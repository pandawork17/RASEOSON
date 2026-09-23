"""
[orders.py - 고객 주문서 작성, 결제 및 주문 내역 조회 라우터]

■ 역할:
  - 일반 구매자가 상품을 선택하고 배송지를 지정하여 주문서를 결제/생성합니다.
  - 주문 생성 시 트랜잭션 내에서 [가용재고 확인 -> 재고 차감 -> 주문 마스터(Order) 생성 -> 품목(OrderItem) 스냅샷 생성 -> 가상 결제(Payment) 생성]을 한 번에 처리합니다.
  - 로그인한 회원의 주문 내역 목록 및 상세 조회를 제공합니다.
"""

import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_optional_user
from ..images import build_thumbnail

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _generate_order_no() -> str:
    """
    유니크한 주문 번호 생성 (예: ORD-20260921-A1B2C3D4)
    """
    today = datetime.datetime.utcnow().strftime("%Y%m%d")
    return f"ORD-{today}-{uuid.uuid4().hex[:8].upper()}"


def _order_out(order: models.Order, db: Session) -> schemas.OrderOut:
    """
    주문 및 품목 정보를 OrderOut DTO로 조립하고, 상품 대표 썸네일을 첨부합니다.
    """
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
    pay_status = latest_payment.payment_status if latest_payment else None
    if pay_status == "DONE":
        pay_status = "결제완료"
    elif not pay_status and order.order_status:
        pay_status = "결제완료"

    return schemas.OrderOut(
        order_id=order.order_id,
        order_no=order.order_no,
        buyer_user_id=order.buyer_user_id,
        org_id=order.org_id,
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
        payment_status=pay_status,
    )


@router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED, summary="주문 생성 및 결제")
def create_order(
    payload: schemas.CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    주문 및 가상 결제 생성 (단일 트랜잭션)
    1. 상품 옵션 및 상태 유효성 확인
    2. 재고 확인 및 차감
    3. 주문, 주문상품, 결제 데이터 생성
    """
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

    # 재고 확인
    inventory_rows = db.execute(
        select(models.Inventory).where(models.Inventory.variant_id == variant.variant_id)
    ).scalars().all()
    available = sum(row.stock_quantity - row.reserved_quantity for row in inventory_rows)

    if available < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="재고가 부족합니다.")

    # 금액 계산
    unit_regular = product.regular_price + variant.additional_price
    unit_sale = product.sale_price + variant.additional_price
    product_amount = unit_regular * payload.quantity
    discount_amount = max(unit_regular - unit_sale, 0) * payload.quantity
    shipping_amount = 3000
    total_amount = product_amount - discount_amount + shipping_amount

    order_org_id = current_user.org_id or 1
    now = datetime.datetime.utcnow()

    # 1. Order 마스터 생성
    order = models.Order(
        order_no=_generate_order_no(),
        buyer_user_id=current_user.user_id,
        org_id=order_org_id,
        order_status="1) 결제완료",
        process_status="1) 결제완료",
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

    # 2. OrderItem 품목 스냅샷 생성
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

    # 3. Payment 가상 결제 생성
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

    # 4. 재고 차감 반영
    remaining = payload.quantity
    for row in inventory_rows:
        row_available = row.stock_quantity - row.reserved_quantity
        if row_available <= 0 or remaining <= 0:
            continue
        deduction = min(row_available, remaining)
        row.stock_quantity -= deduction
        remaining -= deduction

    # 5. 지사 관리자 알림 자동 생성 (판매자 대시보드 알림종 연동)
    try:
        buyer_display = current_user.user_name or current_user.login_id or "고객"
        notif = models.BranchNotification(
            org_id=str(order_org_id),
            type="주문",
            title=f"[{buyer_display}] 고객님의 신규 주문이 접수되었습니다.",
            target_tab="orders",
            is_read=0,
            created_at=now,
        )
        db.add(notif)
    except Exception as e:
        print(f"[orders] 알림 생성 무시: {e}")

    db.commit()
    db.refresh(order)

    order = db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
        .where(models.Order.order_id == order.order_id)
    ).scalar_one()

    return _order_out(order, db)


@router.get("", response_model=List[schemas.OrderOut], summary="주문 목록 조회")
def list_orders(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    주문 내역 목록 조회:
    - 구매자로 로그인된 경우 본인 주문 목록만 반환
    - 관리자/판매자이거나 비인증(관리자 시스템 직접 호출)인 경우 전체 주문 목록 반환
    """
    query = (
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
    )
    if current_user and current_user.role_code == "BUYER":
        query = query.where(models.Order.buyer_user_id == current_user.user_id)

    orders = db.execute(
        query.order_by(models.Order.ordered_at.desc(), models.Order.order_id.desc())
    ).scalars().all()

    return [_order_out(order, db) for order in orders]


@router.get("/{order_id}", response_model=schemas.OrderOut, summary="주문 상세 조회")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    특정 주문건의 상세 정보 조회
    """
    order = db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .options(selectinload(models.Order.payments))
        .where(models.Order.order_id == order_id)
    ).scalar_one_or_none()

    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다.")

    if current_user and current_user.role_code == "BUYER" and order.buyer_user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다.")

    return _order_out(order, db)


@router.patch("/{order_id}/status", summary="주문 상태 변경")
@router.put("/{order_id}/status", summary="주문 상태 변경")
def update_order_status(
    order_id: int,
    body: schemas.UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
):
    """
    관리자/판매자용 주문 상태 및 결제 상태 변경
    """
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다.")

    order.order_status = body.order_status
    order.updated_at = datetime.datetime.utcnow()

    # 결제 상태가 명시되었거나 환불/취소인 경우 결제 테이블 동기화
    target_payment_status = body.payment_status
    if not target_payment_status:
        if "환불" in body.order_status or "취소" in body.order_status:
            target_payment_status = "CANCELLED"
        elif "결제" in body.order_status:
            target_payment_status = "DONE"

    if target_payment_status:
        payments = db.execute(
            select(models.Payment).where(models.Payment.order_id == order_id)
        ).scalars().all()
        for p in payments:
            p.payment_status = target_payment_status

    # 주문 상품 상태도 동기화
    db.execute(
        update(models.OrderItem)
        .where(models.OrderItem.order_id == order_id)
        .values(item_status=body.order_status)
    )

    db.commit()
    db.refresh(order)
    return {
        "status": "success",
        "order_id": order_id,
        "order_status": order.order_status,
        "payment_status": target_payment_status,
    }

