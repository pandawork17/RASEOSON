import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..images import build_thumbnail

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _generate_order_no() -> str:
    today = datetime.datetime.utcnow().strftime("%Y%m%d")
    return f"ORD-{today}-{uuid.uuid4().hex[:8].upper()}"


def _order_out(order: models.Order, db: Session) -> schemas.OrderOut:
    product_ids = [item.product_id for item in order.items]
    products = db.execute(
        select(models.Product)
        .options(selectinload(models.Product.images).selectinload(models.ProductImage.file))
        .where(models.Product.product_id.in_(product_ids))
    ).scalars().all()
    thumbnail_by_product = {p.product_id: build_thumbnail(p) for p in products}

    items_out = [
        schemas.OrderItemOut(
            order_item_id=item.order_item_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            product_name_snapshot=item.product_name_snapshot,
            sku_snapshot=item.sku_snapshot,
            quantity=item.quantity,
            unit_price=item.unit_price,
            item_amount=item.item_amount,
            item_status=item.item_status,
            thumbnail_url=thumbnail_by_product.get(item.product_id),
        )
        for item in order.items
    ]

    latest_payment = order.payments[-1] if order.payments else None

    return schemas.OrderOut(
        order_id=order.order_id,
        order_no=order.order_no,
        order_status=order.order_status,
        process_status=order.process_status,
        product_amount=order.product_amount,
        discount_amount=order.discount_amount,
        shipping_amount=order.shipping_amount,
        total_amount=order.total_amount,
        receiver_name=order.receiver_name,
        receiver_phone=order.receiver_phone,
        zipcode=order.zipcode,
        shipping_address1=order.shipping_address1,
        shipping_address2=order.shipping_address2,
        ordered_at=order.ordered_at,
        items=items_out,
        payment_method=latest_payment.payment_method if latest_payment else None,
        payment_status=latest_payment.payment_status if latest_payment else None,
    )


@router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: schemas.CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    variant = db.execute(
        select(models.ProductVariant)
        .options(selectinload(models.ProductVariant.product))
        .where(models.ProductVariant.variant_id == payload.variant_id)
    ).scalar_one_or_none()

    if variant is None or variant.active_yn != "Y":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="상품 옵션을 찾을 수 없습니다.")

    product = variant.product
    if product.product_status not in ("SALE", "READY"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="판매 중인 상품이 아닙니다.")

    inventory_rows = db.execute(
        select(models.Inventory).where(models.Inventory.variant_id == variant.variant_id)
    ).scalars().all()
    available = sum(row.stock_quantity - row.reserved_quantity for row in inventory_rows)

    if available < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="재고가 부족합니다.")

    unit_regular = product.regular_price + variant.additional_price
    unit_sale = product.sale_price + variant.additional_price
    product_amount = unit_regular * payload.quantity
    discount_amount = max(unit_regular - unit_sale, 0) * payload.quantity
    shipping_amount = 3000
    total_amount = product_amount - discount_amount + shipping_amount

    order_org_id = current_user.org_id or 1
    now = datetime.datetime.utcnow()

    order = models.Order(
        order_no=_generate_order_no(),
        buyer_user_id=current_user.user_id,
        org_id=order_org_id,
        order_status="PAID",
        process_status="PAYMENT_COMPLETED",
        product_amount=product_amount,
        discount_amount=discount_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        zipcode=payload.zipcode,
        shipping_address1=payload.shipping_address1,
        shipping_address2=payload.shipping_address2,
        ordered_at=now,
        updated_at=now,
    )
    db.add(order)
    db.flush()

    order_item = models.OrderItem(
        org_id=order_org_id,
        order_id=order.order_id,
        product_id=product.product_id,
        variant_id=variant.variant_id,
        product_name_snapshot=product.product_name,
        sku_snapshot=variant.sku_code,
        quantity=payload.quantity,
        unit_price=unit_sale,
        item_amount=unit_sale * payload.quantity,
        item_status="PAID",
    )
    db.add(order_item)

    payment = models.Payment(
        org_id=order_org_id,
        order_id=order.order_id,
        pg_provider="DEMO",
        payment_key=f"demo_{uuid.uuid4().hex}",
        pg_order_id=order.order_no,
        payment_type="NORMAL",
        payment_method=payload.payment_method,
        payment_status="DONE",
        requested_amount=total_amount,
        approved_amount=total_amount,
        currency="KRW",
        requested_at=now,
        approved_at=now,
        created_at=now,
    )
    db.add(payment)

    remaining = payload.quantity
    for row in inventory_rows:
        row_available = row.stock_quantity - row.reserved_quantity
        if row_available <= 0 or remaining <= 0:
            continue
        deduction = min(row_available, remaining)
        row.stock_quantity -= deduction
        remaining -= deduction

    db.commit()
    db.refresh(order)

    order = db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
        .where(models.Order.order_id == order.order_id)
    ).scalar_one()

    return _order_out(order, db)


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    orders = db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
        .where(models.Order.buyer_user_id == current_user.user_id)
        .order_by(models.Order.ordered_at.desc(), models.Order.order_id.desc())
    ).scalars().all()

    return [_order_out(order, db) for order in orders]


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
        .where(models.Order.order_id == order_id)
    ).scalar_one_or_none()

    if order is None or order.buyer_user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다.")

    return _order_out(order, db)
