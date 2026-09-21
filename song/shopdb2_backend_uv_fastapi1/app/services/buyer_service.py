from __future__ import annotations

import base64
import json
from datetime import UTC, datetime
from decimal import Decimal
from urllib import error as urllib_error
from urllib import request as urllib_request
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Inventory, Order, OrderItem, OrgUnit, Payment, Product, ProductVariant, RefundItem, RefundPolicy, RefundRequest
from app.schemas.buyer import (
    BuyerOrderPaymentResponse,
    BuyerDashboard,
    BuyerOrderItem,
    BuyerOrderSummary,
    BuyerOrderPaymentRequest,
    CreateOrderRequest,
    CreateOrderResponse,
    TossPaymentConfirmRequest,
    TossPaymentFailRequest,
    OrderQuoteRequest,
    OrderQuoteResponse,
    CreateRefundRequest,
    CreateRefundResponse,
    RefundSummary,
)
from app.schemas.common import RefundPolicySummary, UserSummary
from app.services.common_service import list_catalog_products, money


ACTIVE_ORDER_STATUSES = ("ORDERED", "PAYMENT_PENDING", "PAID", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED")
REFUNDABLE_ORDER_STATUSES = ("PAID", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED")


def _order_name(product_name: str, quantity: int) -> str:
    return product_name if quantity <= 1 else f"{product_name} and {quantity - 1} more"


def _find_order_payment(db: Session, buyer_user_id: int, *, order_id: int | None = None, order_no: str | None = None):
    stmt = (
        select(Order, Payment, OrderItem, Inventory)
        .join(Payment, Payment.order_id == Order.order_id)
        .join(OrderItem, OrderItem.order_id == Order.order_id)
        .join(Inventory, Inventory.org_id == Order.org_id)
        .where(
            Order.buyer_user_id == buyer_user_id,
            Inventory.variant_id == OrderItem.variant_id,
        )
    )
    if order_id is not None:
        stmt = stmt.where(Order.order_id == order_id)
    if order_no is not None:
        stmt = stmt.where(Order.order_no == order_no)
    return db.execute(stmt).first()


def _release_reserved_inventory(order: Order, order_item: OrderItem, inventory: Inventory) -> None:
    inventory.reserved_quantity = max(0, inventory.reserved_quantity - order_item.quantity)
    order.updated_at = datetime.now(UTC).replace(tzinfo=None)


def _confirm_reserved_inventory(order_item: OrderItem, inventory: Inventory) -> None:
    if inventory.reserved_quantity < order_item.quantity:
        raise HTTPException(status_code=409, detail="Reserved inventory is inconsistent for this order.")
    if inventory.stock_quantity < order_item.quantity:
        raise HTTPException(status_code=409, detail="Physical inventory is insufficient to confirm this payment.")

    inventory.reserved_quantity -= order_item.quantity
    inventory.stock_quantity -= order_item.quantity


def _confirm_toss_payment(payment_key: str, order_id: str, amount: float) -> dict[str, object]:
    if not settings.toss_payments_enabled or not settings.toss_payments_secret_key:
        raise HTTPException(
            status_code=503,
            detail="Toss Payments keys are not configured. Set TOSS_PAYMENTS_CLIENT_KEY and TOSS_PAYMENTS_SECRET_KEY.",
        )

    credentials = base64.b64encode(f"{settings.toss_payments_secret_key}:".encode("utf-8")).decode("ascii")
    payload = json.dumps(
        {
            "paymentKey": payment_key,
            "orderId": order_id,
            "amount": amount,
        }
    ).encode("utf-8")
    request = urllib_request.Request(
        "https://api.tosspayments.com/v1/payments/confirm",
        data=payload,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
            "Idempotency-Key": f"shopdb2-{order_id}-{uuid4().hex[:16]}",
        },
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib_error.HTTPError as exc:
        try:
            error_body = json.loads(exc.read().decode("utf-8"))
            detail = error_body.get("message") or error_body.get("code") or str(exc)
        except Exception:
            detail = str(exc)
        raise HTTPException(status_code=400, detail=f"Toss confirm failed: {detail}") from exc
    except urllib_error.URLError as exc:
        raise HTTPException(status_code=502, detail=f"Toss Payments network error: {exc.reason}") from exc


def build_order_quote(db: Session, payload: OrderQuoteRequest) -> OrderQuoteResponse:
    product = db.scalar(select(Product).where(Product.product_id == payload.product_id))
    variant = db.scalar(
        select(ProductVariant).where(
            ProductVariant.variant_id == payload.variant_id,
            ProductVariant.product_id == payload.product_id,
        )
    )
    inventory_row = db.execute(
        select(Inventory, OrgUnit.org_name)
        .join(OrgUnit, OrgUnit.org_id == Inventory.org_id)
        .where(
            Inventory.org_id == payload.org_id,
            Inventory.variant_id == payload.variant_id,
        )
    ).first()

    if product is None or variant is None or inventory_row is None:
        raise HTTPException(status_code=404, detail="Product inventory not found.")

    inventory, org_name = inventory_row
    available = inventory.stock_quantity - inventory.reserved_quantity
    if available < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock.")

    unit_price = Decimal(product.sale_price) + Decimal(variant.additional_price or 0)
    product_amount = unit_price * payload.quantity
    shipping_amount = Decimal(0 if product_amount >= 100000 else 3000)
    total_amount = product_amount + shipping_amount

    return OrderQuoteResponse(
        product_id=product.product_id,
        product_name=product.product_name,
        variant_id=variant.variant_id,
        sku_code=variant.sku_code,
        org_id=payload.org_id,
        org_name=org_name,
        quantity=payload.quantity,
        available_quantity=available,
        unit_price=money(unit_price),
        product_amount=money(product_amount),
        shipping_amount=money(shipping_amount),
        total_amount=money(total_amount),
    )


def get_buyer_orders(db: Session, buyer_user_id: int) -> list[BuyerOrderSummary]:
    order_stmt = (
        select(Order, OrgUnit.org_name, Payment.payment_status)
        .join(OrgUnit, OrgUnit.org_id == Order.org_id)
        .outerjoin(Payment, Payment.order_id == Order.order_id)
        .where(Order.buyer_user_id == buyer_user_id)
        .order_by(Order.ordered_at.desc(), Order.order_id.desc())
    )
    results: list[BuyerOrderSummary] = []
    for order, org_name, payment_status in db.execute(order_stmt).all():
        item_stmt = (
            select(OrderItem)
            .where(OrderItem.order_id == order.order_id)
            .order_by(OrderItem.order_item_id.asc())
        )
        items = [
            BuyerOrderItem(
                order_item_id=item.order_item_id,
                product_name=item.product_name_snapshot,
                sku_code=item.sku_snapshot,
                quantity=item.quantity,
                unit_price=money(item.unit_price),
                item_amount=money(item.item_amount),
                item_status=item.item_status,
            )
            for item in db.scalars(item_stmt).all()
        ]
        results.append(
            BuyerOrderSummary(
                order_id=order.order_id,
                order_no=order.order_no,
                order_status=order.order_status,
                org_name=org_name,
                total_amount=money(order.total_amount),
                shipping_amount=money(order.shipping_amount),
                ordered_at=order.ordered_at,
                payment_status=payment_status,
                items=items,
            )
        )
    return results


def get_current_refund_policy(db: Session) -> RefundPolicySummary | None:
    today = datetime.now(UTC).date()
    stmt = (
        select(RefundPolicy)
        .where(
            RefundPolicy.active_yn == "Y",
            RefundPolicy.effective_from <= today,
            func.coalesce(RefundPolicy.effective_to, today) >= today,
        )
        .order_by(RefundPolicy.effective_from.desc())
    )
    policy = db.scalars(stmt).first()
    if policy is None:
        return None
    return RefundPolicySummary(
        refund_policy_id=policy.refund_policy_id,
        policy_name=policy.policy_name,
        allowed_days=policy.allowed_days,
        shipping_fee_payer=policy.shipping_fee_payer,
        refund_policy_text=policy.refund_policy_text,
        effective_from=policy.effective_from,
        effective_to=policy.effective_to,
    )


def get_buyer_dashboard(db: Session, current_user: UserSummary) -> BuyerDashboard:
    stats_row = db.execute(
        select(
            func.count(Order.order_id),
            func.coalesce(func.sum(Order.total_amount), 0),
            func.sum(case((Order.order_status.in_(("PAID", "PREPARING", "SHIPPING")), 1), else_=0)),
        ).where(Order.buyer_user_id == current_user.user_id)
    ).one()
    refund_count = db.scalar(
        select(func.count(RefundRequest.refund_request_id)).where(RefundRequest.buyer_user_id == current_user.user_id)
    ) or 0

    recent_orders = get_buyer_orders(db, current_user.user_id)[:5]
    featured_products = list_catalog_products(db)[:4]
    return BuyerDashboard(
        stats={
            "order_count": int(stats_row[0] or 0),
            "total_spend": money(stats_row[1]),
            "active_orders": int(stats_row[2] or 0),
            "refund_requests": int(refund_count),
        },
        current_refund_policy=get_current_refund_policy(db),
        featured_products=featured_products,
        recent_orders=recent_orders,
    )


def create_order(db: Session, current_user: UserSummary, payload: CreateOrderRequest) -> CreateOrderResponse:
    quote = build_order_quote(
        db,
        OrderQuoteRequest(
            product_id=payload.product_id,
            variant_id=payload.variant_id,
            org_id=payload.org_id,
            quantity=payload.quantity,
        ),
    )
    product = db.scalar(select(Product).where(Product.product_id == payload.product_id))
    variant = db.scalar(select(ProductVariant).where(ProductVariant.variant_id == payload.variant_id))
    inventory = db.scalar(select(Inventory).where(Inventory.org_id == payload.org_id, Inventory.variant_id == payload.variant_id))
    if product is None or variant is None or inventory is None:
        raise HTTPException(status_code=404, detail="Product inventory not found.")

    unit_price = Decimal(str(quote.unit_price))
    product_amount = Decimal(str(quote.product_amount))
    shipping_amount = Decimal(str(quote.shipping_amount))
    total_amount = Decimal(str(quote.total_amount))
    order_no = f"ORD-{datetime.now(UTC):%Y%m%d}-{uuid4().hex[:8].upper()}"

    order = Order(
        order_no=order_no,
        buyer_user_id=current_user.user_id,
        org_id=payload.org_id,
        order_status="PAYMENT_PENDING",
        product_amount=product_amount,
        discount_amount=0,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        zipcode=payload.zipcode,
        shipping_address1=payload.shipping_address1,
        shipping_address2=payload.shipping_address2,
        ordered_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(order)
    db.flush()

    order_item = OrderItem(
        order_id=order.order_id,
        product_id=product.product_id,
        variant_id=variant.variant_id,
        product_name_snapshot=product.product_name,
        sku_snapshot=variant.sku_code,
        quantity=payload.quantity,
        unit_price=unit_price,
        item_amount=product_amount,
        item_status="ORDERED",
    )
    db.add(order_item)

    payment = Payment(
        order_id=order.order_id,
        pg_provider=payload.payment_provider,
        payment_key=f"pending_{uuid4().hex}",
        pg_order_id=order_no,
        customer_key=f"user-{current_user.user_id}",
        payment_type="NORMAL",
        payment_method=payload.payment_method,
        payment_status="READY",
        requested_amount=total_amount,
        approved_amount=0,
        cancelled_amount=0,
        balance_amount=total_amount,
        currency="KRW",
        requested_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(payment)

    inventory.reserved_quantity += payload.quantity
    db.commit()
    db.refresh(order)
    db.refresh(payment)

    return CreateOrderResponse(
        order_id=order.order_id,
        order_no=order.order_no,
        product_id=product.product_id,
        product_name=product.product_name,
        payment_id=payment.payment_id,
        total_amount=money(order.total_amount),
        order_status=order.order_status,
        payment_status=payment.payment_status or "READY",
        payment_provider=payment.pg_provider,
        payment_method=payment.payment_method or payload.payment_method,
        customer_key=payment.customer_key or f"user-{current_user.user_id}",
        order_name=_order_name(product.product_name, payload.quantity),
        toss_client_key=settings.toss_payments_client_key,
        payment_enabled=settings.toss_payments_enabled,
    )


def get_buyer_refunds(db: Session, buyer_user_id: int) -> list[RefundSummary]:
    stmt = (
        select(RefundRequest, Order.order_no)
        .join(Order, Order.order_id == RefundRequest.order_id)
        .where(RefundRequest.buyer_user_id == buyer_user_id)
        .order_by(RefundRequest.requested_at.desc(), RefundRequest.refund_request_id.desc())
    )
    return [
        RefundSummary(
            refund_request_id=refund.refund_request_id,
            order_no=order_no,
            refund_status=refund.refund_status,
            requested_amount=money(refund.requested_amount),
            approved_amount=money(refund.approved_amount),
            refund_reason=refund.refund_reason,
            requested_at=refund.requested_at,
        )
        for refund, order_no in db.execute(stmt).all()
    ]


def create_refund_request(db: Session, current_user: UserSummary, payload: CreateRefundRequest) -> CreateRefundResponse:
    order_item_row = db.execute(
        select(Order, OrderItem)
        .join(OrderItem, OrderItem.order_id == Order.order_id)
        .where(
            Order.order_id == payload.order_id,
            Order.buyer_user_id == current_user.user_id,
            OrderItem.order_item_id == payload.order_item_id,
        )
    ).first()

    if order_item_row is None:
        raise HTTPException(status_code=404, detail="Order item not found.")

    order, order_item = order_item_row
    if order.order_status not in REFUNDABLE_ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Refund is available only after payment is completed.")
    if payload.refund_quantity > order_item.quantity:
        raise HTTPException(status_code=400, detail="Refund quantity exceeds ordered quantity.")

    refund_policy = db.scalars(select(RefundPolicy).order_by(RefundPolicy.effective_from.desc())).first()
    requested_amount = (Decimal(order_item.item_amount) / order_item.quantity) * payload.refund_quantity

    refund = RefundRequest(
        order_id=order.order_id,
        buyer_user_id=current_user.user_id,
        refund_policy_id=refund_policy.refund_policy_id if refund_policy else None,
        refund_reason=payload.refund_reason,
        requested_amount=requested_amount,
        approved_amount=0,
        refund_status="REQUESTED",
        requested_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(refund)
    db.flush()

    refund_item = RefundItem(
        refund_request_id=refund.refund_request_id,
        order_item_id=order_item.order_item_id,
        refund_quantity=payload.refund_quantity,
        refund_amount=requested_amount,
    )
    db.add(refund_item)
    db.commit()

    return CreateRefundResponse(
        refund_request_id=refund.refund_request_id,
        refund_status=refund.refund_status,
        requested_amount=money(requested_amount),
    )


def process_order_payment(
    db: Session,
    current_user: UserSummary,
    order_id: int,
    payload: BuyerOrderPaymentRequest,
) -> BuyerOrderPaymentResponse:
    row = _find_order_payment(db, current_user.user_id, order_id=order_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Order payment not found.")

    order, payment, order_item, inventory = row
    if payment.payment_status == "DONE":
        return BuyerOrderPaymentResponse(
            order_id=order.order_id,
            order_no=order.order_no,
            payment_id=payment.payment_id,
            payment_status=payment.payment_status,
            order_status=order.order_status,
            payment_method=payment.payment_method,
            payment_key=payment.payment_key,
            receipt_url=payment.receipt_url,
            approved_at=payment.approved_at,
        )

    approved_at = datetime.now(UTC).replace(tzinfo=None)
    _confirm_reserved_inventory(order_item, inventory)
    payment.payment_method = payload.payment_method
    payment.payment_status = "DONE"
    payment.approved_amount = payment.requested_amount
    payment.balance_amount = 0
    payment.approved_at = approved_at
    payment.payment_key = payment.payment_key or f"manual_{uuid4().hex}"
    order.order_status = "PAID"
    order.updated_at = approved_at
    order_item.item_status = "PAID"
    db.commit()

    return BuyerOrderPaymentResponse(
        order_id=order.order_id,
        order_no=order.order_no,
        payment_id=payment.payment_id,
        payment_status=payment.payment_status or "DONE",
        order_status=order.order_status,
        payment_method=payment.payment_method,
        payment_key=payment.payment_key,
        receipt_url=payment.receipt_url,
        approved_at=payment.approved_at,
    )


def confirm_toss_order_payment(
    db: Session,
    current_user: UserSummary,
    payload: TossPaymentConfirmRequest,
) -> BuyerOrderPaymentResponse:
    row = _find_order_payment(db, current_user.user_id, order_no=payload.order_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Order payment not found.")

    order, payment, order_item, inventory = row
    if payment.payment_status == "DONE":
        return BuyerOrderPaymentResponse(
            order_id=order.order_id,
            order_no=order.order_no,
            payment_id=payment.payment_id,
            payment_status=payment.payment_status or "DONE",
            order_status=order.order_status,
            payment_method=payment.payment_method,
            payment_key=payment.payment_key,
            receipt_url=payment.receipt_url,
            approved_at=payment.approved_at,
        )

    expected_amount = money(payment.requested_amount)
    if round(float(payload.amount), 2) != round(float(expected_amount), 2):
        raise HTTPException(status_code=400, detail="Payment amount does not match the order total.")
    if payload.order_id != order.order_no:
        raise HTTPException(status_code=400, detail="Payment order id does not match the stored order number.")

    confirm_result = _confirm_toss_payment(payload.payment_key, payload.order_id, payload.amount)
    approved_at_raw = confirm_result.get("approvedAt")
    approved_at = datetime.now(UTC).replace(tzinfo=None)
    if isinstance(approved_at_raw, str):
        approved_at = datetime.fromisoformat(approved_at_raw.replace("Z", "+00:00")).replace(tzinfo=None)

    _confirm_reserved_inventory(order_item, inventory)
    receipt = confirm_result.get("receipt")
    receipt_url = receipt.get("url") if isinstance(receipt, dict) else None

    payment.payment_key = str(confirm_result.get("paymentKey") or payload.payment_key)
    payment.payment_method = str(confirm_result.get("method") or payment.payment_method or "CARD")
    payment.payment_status = "DONE"
    payment.approved_amount = Decimal(str(confirm_result.get("totalAmount") or payload.amount))
    payment.balance_amount = 0
    payment.receipt_url = str(receipt_url or payment.receipt_url or "")
    payment.approved_at = approved_at
    order.order_status = "PAID"
    order.updated_at = approved_at
    order_item.item_status = "PAID"
    db.commit()

    return BuyerOrderPaymentResponse(
        order_id=order.order_id,
        order_no=order.order_no,
        payment_id=payment.payment_id,
        payment_status=payment.payment_status or "DONE",
        order_status=order.order_status,
        payment_method=payment.payment_method,
        payment_key=payment.payment_key,
        receipt_url=payment.receipt_url,
        approved_at=payment.approved_at,
    )


def fail_toss_order_payment(
    db: Session,
    current_user: UserSummary,
    payload: TossPaymentFailRequest,
) -> BuyerOrderPaymentResponse:
    row = _find_order_payment(db, current_user.user_id, order_no=payload.order_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Order payment not found.")

    order, payment, order_item, inventory = row
    if payment.payment_status == "DONE":
        return BuyerOrderPaymentResponse(
            order_id=order.order_id,
            order_no=order.order_no,
            payment_id=payment.payment_id,
            payment_status=payment.payment_status or "DONE",
            order_status=order.order_status,
            payment_method=payment.payment_method,
            payment_key=payment.payment_key,
            receipt_url=payment.receipt_url,
            approved_at=payment.approved_at,
        )

    _release_reserved_inventory(order, order_item, inventory)
    payment.payment_status = "FAILED"
    payment.balance_amount = payment.requested_amount
    payment.cancelled_at = datetime.now(UTC).replace(tzinfo=None)
    order.order_status = "PAYMENT_FAILED"
    order_item.item_status = "PAYMENT_FAILED"
    db.commit()

    return BuyerOrderPaymentResponse(
        order_id=order.order_id,
        order_no=order.order_no,
        payment_id=payment.payment_id,
        payment_status=payment.payment_status or "FAILED",
        order_status=order.order_status,
        payment_method=payment.payment_method,
        payment_key=payment.payment_key,
        receipt_url=payment.receipt_url,
        approved_at=payment.approved_at,
    )
