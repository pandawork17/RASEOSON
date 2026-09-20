import base64
import datetime
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_optional_user

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])

BACKEND_ROOT = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
UPLOAD_DIR_BACKEND = os.path.join(BACKEND_ROOT, "uploads", "inquiries")
UPLOAD_DIR_FRONTEND = os.path.join(
    os.path.dirname(BACKEND_ROOT),
    "react-baseason-frontend",
    "public",
    "uploads",
    "inquiries",
)


def _mask_name(name: str | None) -> str:
    if not name:
        return "고객님"
    if len(name) <= 1:
        return name
    if len(name) == 2:
        return name[0] + "*"
    return name[0] + "*" * (len(name) - 2) + name[-1]


def check_is_admin(db: Session, user: models.User | None) -> bool:
    if user is None:
        return False
    row = db.execute(
        select(models.Role.role_code)
        .join(models.UserRole, models.UserRole.role_id == models.Role.role_id)
        .where(models.UserRole.user_id == user.user_id, models.Role.role_code == "ADMIN")
    ).first()
    return row is not None


def save_inquiry_photos(db: Session, inquiry_id: int, photos: list[str], org_id: int = 1):
    os.makedirs(UPLOAD_DIR_BACKEND, exist_ok=True)
    try:
        os.makedirs(UPLOAD_DIR_FRONTEND, exist_ok=True)
    except Exception:
        pass

    for photo_str in photos:
        if not photo_str:
            continue

        file_url = photo_str
        file_size = 0
        ext = "png"
        mime_type = "image/png"

        if photo_str.startswith("data:image/"):
            try:
                header, base64_data = photo_str.split(";base64,", 1)
                mime_type = header.replace("data:", "")
                ext = mime_type.split("/")[-1].lower()
                if ext == "jpeg":
                    ext = "jpg"
                image_bytes = base64.b64decode(base64_data)
                file_size = len(image_bytes)

                filename = f"inquiry_{inquiry_id}_{uuid.uuid4().hex[:8]}.{ext}"

                # Save to backend uploads
                backend_file_path = os.path.join(UPLOAD_DIR_BACKEND, filename)
                with open(backend_file_path, "wb") as f:
                    f.write(image_bytes)

                # Save to frontend public uploads as well for direct Vite access
                try:
                    frontend_file_path = os.path.join(UPLOAD_DIR_FRONTEND, filename)
                    with open(frontend_file_path, "wb") as f:
                        f.write(image_bytes)
                except Exception:
                    pass

                file_url = f"/uploads/inquiries/{filename}"
            except Exception as e:
                print(f"Error decoding photo base64: {e}")
                continue

        # Insert file_asset record
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

        # Insert inquiry_file record
        inquiry_file = models.InquiryFile(
            org_id=org_id,
            inquiry_id=inquiry_id,
            file_id=file_asset.file_id,
            created_at=datetime.datetime.now(),
        )
        db.add(inquiry_file)
        db.flush()


def get_inquiry_photos(db: Session, inquiry_id: int) -> list[str]:
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


@router.get("", response_model=list[schemas.InquiryOut])
def list_inquiries(
    my_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
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
        is_author = (
            current_user is not None
            and current_user.user_id == r.user_id
        )
        can_view = is_author or is_admin

        user_name = r.user.user_name if r.user else "고객님"
        login_id = r.user.login_id if r.user else None

        # 비밀글이면서 본인/관리자가 아닐 때만 마스킹 처리
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


@router.get("/{inquiry_id}", response_model=schemas.InquiryOut)
def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
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
    is_author = (
        current_user is not None
        and current_user.user_id == inquiry.user_id
    )
    is_admin = check_is_admin(db, current_user)

    # 비밀글인 경우에만 작성자 또는 관리자 외 열람 차단
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


@router.post("", response_model=schemas.InquiryOut, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    payload: schemas.InquiryIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.datetime.now()
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


@router.put("/{inquiry_id}", response_model=schemas.InquiryOut)
def update_inquiry(
    inquiry_id: int,
    payload: schemas.InquiryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inquiry = db.get(models.BuyerInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 문의글을 찾을 수 없습니다.",
        )

    is_author = (current_user.user_id == inquiry.user_id)
    is_admin = check_is_admin(db, current_user)
    if not (is_author or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인이 작성한 문의만 수정할 수 있습니다.",
        )

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

    inquiry.updated_at = datetime.datetime.now()
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


@router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inquiry = db.get(models.BuyerInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 문의글을 찾을 수 없습니다.",
        )

    # 1. 외래키 제약조건(inquiry_files) 방지를 위해 먼저 연관된 inquiry_files 레코드 삭제
    db.execute(text("DELETE FROM inquiry_files WHERE inquiry_id = :id"), {"id": inquiry_id})

    # 2. 문의글 삭제 (사용자 요청에 따라 기존 DB 데이터도 삭제 가능하도록 처리)
    db.delete(inquiry)
    db.commit()
    return None
