"""
[inquiries.py - 고객 1:1 Q&A 문의 및 첨부 이미지 관리 라우터]

■ 역할:
  - 쇼핑몰 구매자의 1:1 고객 문의 목록 조회, 상세 조회, 등록, 수정, 삭제를 담당합니다.
  - 비밀글(secret_yn='Y') 기능: 작성자 본인 및 관리자(ADMIN)만 내용과 첨부파일을 볼 수 있으며, 타인에게는 '비밀글입니다.'로 마스킹 처리됩니다.
  - Base64 데이터 URI 형태의 첨부 이미지를 수신하여 디코딩 후 `uploads/inquiries/` 폴더에 파일로 저장하고, FileAsset 및 InquiryFile 테이블과 연동합니다.
"""

import base64
import datetime
import os
import uuid
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_optional_user

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])

# 문의 첨부파일 저장 경로: common-backend/uploads/inquiries
UPLOAD_DIR_BACKEND = Path("uploads/inquiries")
UPLOAD_DIR_BACKEND.mkdir(parents=True, exist_ok=True)


def _mask_name(name: Optional[str]) -> str:
    """
    타인에게 보여질 작성자 이름을 마스킹 처리합니다 (예: 홍길동 -> 홍*동)
    """
    if not name:
        return "고객님"
    if len(name) <= 1:
        return name
    if len(name) == 2:
        return name[0] + "*"
    return name[0] + "*" * (len(name) - 2) + name[-1]


def check_is_admin(db: Session, user: Optional[models.User]) -> bool:
    """
    사용자가 관리자(ADMIN) 권한을 가지고 있는지 확인합니다.
    """
    if user is None:
        return False
    row = db.execute(
        select(models.Role.role_code)
        .join(models.UserRole, models.UserRole.role_id == models.Role.role_id)
        .where(models.UserRole.user_id == user.user_id, models.Role.role_code == "ADMIN")
    ).first()
    return row is not None


def save_inquiry_photos(db: Session, inquiry_id: int, photos: List[str], org_id: int = 1):
    """
    전달된 이미지 데이터(Base64 문자열 또는 URL)를 파싱하여 디스크에 저장하고 FileAsset 레코드를 생성합니다.
    """
    for photo_str in photos:
        if not photo_str:
            continue

        file_url = photo_str
        ext = "png"
        mime_type = "image/png"

        # Base64 Data URI인 경우 파일로 디코딩 저장
        if photo_str.startswith("data:image/"):
            try:
                header, base64_data = photo_str.split(";base64,", 1)
                mime_type = header.replace("data:", "")
                ext = mime_type.split("/")[-1].lower()
                if ext == "jpeg":
                    ext = "jpg"
                image_bytes = base64.b64decode(base64_data)

                filename = f"inquiry_{inquiry_id}_{uuid.uuid4().hex[:8]}.{ext}"
                backend_file_path = UPLOAD_DIR_BACKEND / filename
                backend_file_path.write_bytes(image_bytes)

                file_url = f"/uploads/inquiries/{filename}"
            except Exception as e:
                print(f"[inquiries] Error decoding photo base64: {e}")
                continue

        # FileAsset DB 레코드 생성
        file_asset = models.FileAsset(
            org_id=org_id,
            file_type="IMAGE",
            storage_type="LOCAL" if file_url.startswith("/uploads") else "URL",
            original_file_name=os.path.basename(file_url),
            public_url=file_url,
            thumbnail_url=file_url,
        )
        db.add(file_asset)
        db.flush()

        # InquiryFile 연결 레코드 생성
        inquiry_file = models.InquiryFile(
            org_id=org_id,
            inquiry_id=inquiry_id,
            file_id=file_asset.file_id,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(inquiry_file)
        db.flush()


def get_inquiry_photos(db: Session, inquiry_id: int) -> List[str]:
    """
    특정 문의에 연결된 첨부 이미지 파일 URL 리스트를 조회합니다.
    """
    rows = db.execute(
        select(models.FileAsset.public_url, models.FileAsset.file_type)
        .join(models.InquiryFile, models.InquiryFile.file_id == models.FileAsset.file_id)
        .where(models.InquiryFile.inquiry_id == inquiry_id)
        .order_by(models.InquiryFile.inquiry_file_id.asc())
    ).all()
    photos = []
    for r in rows:
        url, file_type = r[0], r[1]
        if not url:
            continue
        if file_type == "IMAGE" or any(
            url.lower().endswith(ext)
            for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]
        ):
            photos.append(url)
    return photos


@router.get("", response_model=List[schemas.InquiryOut], summary="1:1 문의 목록 조회")
def list_inquiries(
    my_only: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    1:1 고객 문의 목록 조회
    - my_only=True: 내가 작성한 문의글만 필터링
    - 비밀글(secret_yn='Y')은 본인 및 관리자 외에는 내용 마스킹
    """
    query = (
        select(models.BuyerInquiry)
        .options(
            joinedload(models.BuyerInquiry.user),
            joinedload(models.BuyerInquiry.answered_by),
            joinedload(models.BuyerInquiry.files).joinedload(models.InquiryFile.file),
        )
        .order_by(models.BuyerInquiry.inquiry_id.desc())
    )

    if my_only:
        if current_user is None:
            return []
        query = query.where(models.BuyerInquiry.user_id == current_user.user_id)

    rows = db.execute(query).unique().scalars().all()
    is_admin = check_is_admin(db, current_user)

    result = []
    for r in rows:
        is_secret = (r.secret_yn == "Y")
        is_author = (current_user is not None and current_user.user_id == r.user_id)
        can_view = is_author or is_admin

        user_name = r.user.user_name if r.user else "고객님"
        login_id = r.user.login_id if r.user else None

        if is_secret and not can_view:
            title = "비밀글입니다."
            content = "비밀글입니다."
            answer_content = None
            secret_yn = "Y"
            photos = []
        else:
            title = r.title
            content = r.content
            answer_content = r.answer_content
            secret_yn = r.secret_yn or "N"
            photos = [
                f.file.public_url
                for f in (r.files or [])
                if f.file and f.file.public_url and (
                    f.file.file_type == "IMAGE" or any(
                        f.file.public_url.lower().endswith(ext)
                        for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]
                    )
                )
            ]

        result.append(
            schemas.InquiryOut(
                inquiry_id=r.inquiry_id,
                user_id=r.user_id,
                user_name=user_name,
                login_id=login_id,
                org_id=r.org_id,
                category_code=r.category_code,
                title=title,
                content=content,
                inquiry_status=r.inquiry_status,
                secret_yn=secret_yn,
                answer_content=answer_content,
                answered_by_name=r.answered_by.user_name if r.answered_by else None,
                photos=photos,
                created_at=r.created_at,
                updated_at=r.updated_at,
                answered_at=r.answered_at,
            )
        )
    return result


@router.get("/{inquiry_id}", response_model=schemas.InquiryOut, summary="1:1 문의 상세 조회")
def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    특정 1:1 문의글 상세 조회 (비밀글 권한 체크)
    """
    inquiry = (
        db.execute(
            select(models.BuyerInquiry)
            .options(
                joinedload(models.BuyerInquiry.user),
                joinedload(models.BuyerInquiry.answered_by),
                joinedload(models.BuyerInquiry.files).joinedload(models.InquiryFile.file),
            )
            .where(models.BuyerInquiry.inquiry_id == inquiry_id)
        )
        .unique()
        .scalars()
        .first()
    )
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 문의글을 찾을 수 없습니다.",
        )

    is_secret = (inquiry.secret_yn == "Y")
    is_author = (current_user is not None and current_user.user_id == inquiry.user_id)
    is_admin = check_is_admin(db, current_user)

    if is_secret and not (is_author or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비밀글은 작성자 본인만 열람할 수 있습니다.",
        )

    photos = [
        f.file.public_url
        for f in (inquiry.files or [])
        if f.file and f.file.public_url and (
            f.file.file_type == "IMAGE" or any(
                f.file.public_url.lower().endswith(ext)
                for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]
            )
        )
    ]

    return schemas.InquiryOut(
        inquiry_id=inquiry.inquiry_id,
        user_id=inquiry.user_id,
        user_name=inquiry.user.user_name if inquiry.user else "고객님",
        login_id=inquiry.user.login_id if inquiry.user else None,
        org_id=inquiry.org_id,
        category_code=inquiry.category_code,
        title=inquiry.title,
        content=inquiry.content,
        inquiry_status=inquiry.inquiry_status,
        secret_yn=inquiry.secret_yn or "N",
        answer_content=inquiry.answer_content,
        answered_by_name=inquiry.answered_by.user_name if inquiry.answered_by else None,
        photos=photos,
        created_at=inquiry.created_at,
        updated_at=inquiry.updated_at,
        answered_at=inquiry.answered_at,
    )


@router.post("", response_model=schemas.InquiryOut, status_code=status.HTTP_201_CREATED, summary="1:1 문의 등록")
def create_inquiry(
    payload: schemas.InquiryIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    신규 1:1 문의글 작성
    """
    now = datetime.datetime.utcnow()
    inquiry = models.BuyerInquiry(
        user_id=current_user.user_id,
        org_id=current_user.org_id or 1,
        category_code=payload.category_code,
        title=payload.title,
        content=payload.content,
        inquiry_status="RECEIVED",
        secret_yn=payload.secret_yn or "N",
        created_at=now,
        updated_at=now,
    )
    db.add(inquiry)
    db.flush()

    if payload.photos:
        save_inquiry_photos(db, inquiry.inquiry_id, payload.photos, org_id=current_user.org_id or 1)

    # 지사 관리자 알림 자동 생성
    try:
        author_name = current_user.user_name or current_user.login_id or "고객"
        notif = models.BranchNotification(
            org_id=str(inquiry.org_id if inquiry.org_id and inquiry.org_id != 1 else 2),
            type="문의",
            title=f"[{author_name}] 새로운 고객 문의가 등록되었습니다.",
            target_tab="inquiries",
            is_read=0,
            created_at=now,
        )
        db.add(notif)
    except Exception as e:
        print(f"[inquiries] 알림 생성 무시: {e}")

    db.commit()
    db.refresh(inquiry)
    saved_photos = get_inquiry_photos(db, inquiry.inquiry_id)

    return schemas.InquiryOut(
        inquiry_id=inquiry.inquiry_id,
        user_id=inquiry.user_id,
        user_name=current_user.user_name,
        login_id=current_user.login_id,
        org_id=inquiry.org_id,
        category_code=inquiry.category_code,
        title=inquiry.title,
        content=inquiry.content,
        inquiry_status=inquiry.inquiry_status,
        secret_yn=inquiry.secret_yn,
        answer_content=None,
        answered_by_name=None,
        photos=saved_photos,
        created_at=inquiry.created_at,
        updated_at=inquiry.updated_at,
        answered_at=None,
    )


@router.put("/{inquiry_id}", response_model=schemas.InquiryOut, summary="1:1 문의 수정")
def update_inquiry(
    inquiry_id: int,
    payload: schemas.InquiryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    1:1 문의글 수정 (작성자 본인 또는 관리자)
    """
    inquiry = db.get(models.BuyerInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="해당 문의글을 찾을 수 없습니다.")

    is_author = (current_user.user_id == inquiry.user_id)
    is_admin = check_is_admin(db, current_user)
    if not (is_author or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="본인이 작성한 문의만 수정할 수 있습니다.")

    if payload.category_code is not None:
        inquiry.category_code = payload.category_code
    if payload.title is not None:
        inquiry.title = payload.title
    if payload.content is not None:
        inquiry.content = payload.content
    if payload.secret_yn is not None:
        inquiry.secret_yn = payload.secret_yn

    if payload.photos is not None:
        db.execute(text("DELETE FROM inquiry_files WHERE inquiry_id = :id"), {"id": inquiry_id})
        save_inquiry_photos(db, inquiry.inquiry_id, payload.photos, org_id=current_user.org_id or 1)

    inquiry.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(inquiry)

    user = db.get(models.User, inquiry.user_id)
    answered_by = db.get(models.User, inquiry.answered_by_user_id) if inquiry.answered_by_user_id else None
    photos = get_inquiry_photos(db, inquiry.inquiry_id)

    return schemas.InquiryOut(
        inquiry_id=inquiry.inquiry_id,
        user_id=inquiry.user_id,
        user_name=user.user_name if user else "고객님",
        login_id=user.login_id if user else None,
        org_id=inquiry.org_id,
        category_code=inquiry.category_code,
        title=inquiry.title,
        content=inquiry.content,
        inquiry_status=inquiry.inquiry_status,
        secret_yn=inquiry.secret_yn,
        answer_content=inquiry.answer_content,
        answered_by_name=answered_by.user_name if answered_by else None,
        photos=photos,
        created_at=inquiry.created_at,
        updated_at=inquiry.updated_at,
        answered_at=inquiry.answered_at,
    )


@router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT, summary="1:1 문의 삭제")
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    1:1 문의글 삭제
    """
    inquiry = db.get(models.BuyerInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="해당 문의글을 찾을 수 없습니다.")

    is_author = (current_user.user_id == inquiry.user_id)
    is_admin = check_is_admin(db, current_user)
    if not (is_author or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="본인이 작성한 문의만 삭제할 수 있습니다.")

    db.execute(text("DELETE FROM inquiry_files WHERE inquiry_id = :id"), {"id": inquiry_id})
    db.delete(inquiry)
    db.commit()
    return None

