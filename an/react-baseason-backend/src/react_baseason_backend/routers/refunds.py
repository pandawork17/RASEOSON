import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/refund-requests", tags=["refunds"])

REFUNDABLE_ORDER_STATUSES = {"PAID", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED"}


@router.get("", response_model=list[schemas.RefundRequestOut])
def list_refund_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.execute(
        select(models.RefundRequest)
        .where(models.RefundRequest.buyer_user_id == current_user.user_id)
        .order_by(models.RefundRequest.requested_at.desc())
    ).scalars().all()

    result = []
    for row in rows:
        order = db.get(models.Order, row.order_id)
        result.append(
            schemas.RefundRequestOut(
                refund_request_id=row.refund_request_id,
                order_id=row.order_id,
                refund_reason=row.refund_reason,
                requested_amount=row.requested_amount,
                approved_amount=row.approved_amount,
                refund_status=row.refund_status,
                requested_at=row.requested_at,
                order_no=order.order_no if order else None,
            )
        )
    return result


@router.post("", response_model=schemas.RefundRequestOut, status_code=status.HTTP_201_CREATED)
def create_refund_request(
    payload: schemas.CreateRefundRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = db.get(models.Order, payload.order_id)
    if order is None or order.buyer_user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다.")

    if order.order_status not in REFUNDABLE_ORDER_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="환불 신청이 불가능한 주문 상태입니다.")

    existing = db.execute(
        select(models.RefundRequest).where(
            models.RefundRequest.order_id == order.order_id,
            models.RefundRequest.refund_status.in_(["REQUESTED", "REVIEWING", "APPROVED"]),
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 환불 신청이 진행 중인 주문입니다.")

    now = datetime.datetime.utcnow()
    refund = models.RefundRequest(
        org_id=order.org_id,
        order_id=order.order_id,
        buyer_user_id=current_user.user_id,
        refund_reason=payload.refund_reason,
        requested_amount=order.total_amount,
        refund_status="REQUESTED",
        requested_at=now,
    )
    db.add(refund)

    order.process_status = "REFUND_WAITING"
    order.updated_at = now

    db.commit()
    db.refresh(refund)

    return schemas.RefundRequestOut(
        refund_request_id=refund.refund_request_id,
        order_id=refund.order_id,
        refund_reason=refund.refund_reason,
        requested_amount=refund.requested_amount,
        approved_amount=refund.approved_amount,
        refund_status=refund.refund_status,
        requested_at=refund.requested_at,
        order_no=order.order_no,
    )
