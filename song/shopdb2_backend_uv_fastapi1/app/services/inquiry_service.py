from __future__ import annotations

from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import BuyerInquiry, FileAsset, InquiryFile, User
from app.schemas.file import FileUploadResponse
from app.schemas.inquiry import InquiryCreateRequest, InquiryDetail, InquirySummary, InquiryUpdateRequest
from app.schemas.common import UserSummary
from app.services.file_service import file_asset_to_response


def _attachments_for_inquiry(db: Session, inquiry_id: int) -> list[FileUploadResponse]:
    stmt = (
        select(FileAsset)
        .join(InquiryFile, InquiryFile.file_id == FileAsset.file_id)
        .where(InquiryFile.inquiry_id == inquiry_id, FileAsset.active_yn == "Y")
        .order_by(InquiryFile.inquiry_file_id.asc())
    )
    return [file_asset_to_response(item) for item in db.scalars(stmt).all()]


def _summary_from_row(db: Session, inquiry: BuyerInquiry, user_name: str, include_content: bool = False) -> InquirySummary | InquiryDetail:
    base = {
        "inquiry_id": inquiry.inquiry_id,
        "category_code": inquiry.category_code,
        "title": inquiry.title,
        "content_preview": inquiry.content[:120],
        "inquiry_status": inquiry.inquiry_status,
        "secret_yn": inquiry.secret_yn,
        "user_id": inquiry.user_id,
        "user_name": user_name,
        "answer_content": inquiry.answer_content,
        "created_at": inquiry.created_at,
        "updated_at": inquiry.updated_at,
        "answered_at": inquiry.answered_at,
        "attachments": _attachments_for_inquiry(db, inquiry.inquiry_id),
    }
    if include_content:
        return InquiryDetail(**base, content=inquiry.content)
    return InquirySummary(**base)


def _replace_attachments(db: Session, inquiry_id: int, file_ids: list[int]) -> None:
    current_links = db.scalars(select(InquiryFile).where(InquiryFile.inquiry_id == inquiry_id)).all()
    for link in current_links:
        db.delete(link)

    if not file_ids:
        return

    valid_ids = set(db.scalars(select(FileAsset.file_id).where(FileAsset.file_id.in_(file_ids), FileAsset.active_yn == "Y")).all())
    missing = [file_id for file_id in file_ids if file_id not in valid_ids]
    if missing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid file IDs: {missing}")

    for file_id in file_ids:
        db.add(InquiryFile(inquiry_id=inquiry_id, file_id=file_id))


def list_public_inquiries(db: Session) -> list[InquirySummary]:
    stmt = (
        select(BuyerInquiry, User.user_name)
        .join(User, User.user_id == BuyerInquiry.user_id)
        .where(BuyerInquiry.secret_yn == "N")
        .order_by(BuyerInquiry.created_at.desc(), BuyerInquiry.inquiry_id.desc())
    )
    return [_summary_from_row(db, inquiry, user_name) for inquiry, user_name in db.execute(stmt).all()]


def list_user_inquiries(db: Session, user_id: int) -> list[InquirySummary]:
    stmt = (
        select(BuyerInquiry, User.user_name)
        .join(User, User.user_id == BuyerInquiry.user_id)
        .where(BuyerInquiry.user_id == user_id)
        .order_by(BuyerInquiry.created_at.desc(), BuyerInquiry.inquiry_id.desc())
    )
    return [_summary_from_row(db, inquiry, user_name) for inquiry, user_name in db.execute(stmt).all()]


def list_all_inquiries(db: Session) -> list[InquirySummary]:
    stmt = (
        select(BuyerInquiry, User.user_name)
        .join(User, User.user_id == BuyerInquiry.user_id)
        .order_by(BuyerInquiry.created_at.desc(), BuyerInquiry.inquiry_id.desc())
    )
    return [_summary_from_row(db, inquiry, user_name) for inquiry, user_name in db.execute(stmt).all()]


def get_inquiry_detail(db: Session, inquiry_id: int, current_user: UserSummary | None = None, admin_view: bool = False) -> InquiryDetail:
    row = db.execute(
        select(BuyerInquiry, User.user_name)
        .join(User, User.user_id == BuyerInquiry.user_id)
        .where(BuyerInquiry.inquiry_id == inquiry_id)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Inquiry not found.")

    inquiry, user_name = row
    if inquiry.secret_yn == "Y" and not admin_view:
        if current_user is None or current_user.user_id != inquiry.user_id:
            raise HTTPException(status_code=403, detail="This inquiry is private.")
    return _summary_from_row(db, inquiry, user_name, include_content=True)


def create_inquiry(db: Session, current_user: UserSummary, payload: InquiryCreateRequest) -> InquiryDetail:
    inquiry = BuyerInquiry(
        user_id=current_user.user_id,
        org_id=current_user.org.org_id if current_user.org else None,
        category_code=payload.category_code,
        title=payload.title,
        content=payload.content,
        inquiry_status="OPEN",
        secret_yn=payload.secret_yn,
        created_at=datetime.now(UTC).replace(tzinfo=None),
        updated_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(inquiry)
    db.flush()
    _replace_attachments(db, inquiry.inquiry_id, payload.attachment_file_ids)
    db.commit()
    return get_inquiry_detail(db, inquiry.inquiry_id, current_user=current_user, admin_view=False)


def update_inquiry(db: Session, inquiry_id: int, current_user: UserSummary, payload: InquiryUpdateRequest) -> InquiryDetail:
    inquiry = db.scalar(select(BuyerInquiry).where(BuyerInquiry.inquiry_id == inquiry_id))
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found.")
    if inquiry.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own inquiry.")
    if inquiry.inquiry_status == "ANSWERED":
        raise HTTPException(status_code=400, detail="Answered inquiries cannot be edited.")

    inquiry.category_code = payload.category_code
    inquiry.title = payload.title
    inquiry.content = payload.content
    inquiry.secret_yn = payload.secret_yn
    inquiry.updated_at = datetime.now(UTC).replace(tzinfo=None)
    _replace_attachments(db, inquiry_id, payload.attachment_file_ids)
    db.commit()
    return get_inquiry_detail(db, inquiry_id, current_user=current_user)


def delete_inquiry(db: Session, inquiry_id: int, current_user: UserSummary) -> dict[str, int]:
    inquiry = db.scalar(select(BuyerInquiry).where(BuyerInquiry.inquiry_id == inquiry_id))
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found.")
    if inquiry.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own inquiry.")
    links = db.scalars(select(InquiryFile).where(InquiryFile.inquiry_id == inquiry_id)).all()
    for link in links:
        db.delete(link)
    db.delete(inquiry)
    db.commit()
    return {"deleted_inquiry_id": inquiry_id}


def answer_inquiry(db: Session, inquiry_id: int, current_user: UserSummary, answer_content: str, inquiry_status: str) -> InquiryDetail:
    inquiry = db.scalar(select(BuyerInquiry).where(BuyerInquiry.inquiry_id == inquiry_id))
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found.")

    inquiry.answer_content = answer_content
    inquiry.inquiry_status = inquiry_status
    inquiry.answered_by_user_id = current_user.user_id
    inquiry.answered_at = datetime.now(UTC).replace(tzinfo=None)
    inquiry.updated_at = datetime.now(UTC).replace(tzinfo=None)
    db.commit()
    return get_inquiry_detail(db, inquiry_id, current_user=current_user, admin_view=True)
