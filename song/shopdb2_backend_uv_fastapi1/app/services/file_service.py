from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import FileAsset
from app.schemas.file import FileUploadResponse


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "pdf", "txt", "doc", "docx"}
ALLOWED_MIME_PREFIXES = (
    "image/",
    "application/pdf",
    "text/",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
MAX_FILE_SIZE = 10 * 1024 * 1024


def _to_response(file_asset: FileAsset) -> FileUploadResponse:
    return FileUploadResponse(
        file_id=file_asset.file_id,
        original_file_name=file_asset.original_file_name,
        file_type=file_asset.file_type,
        storage_type=file_asset.storage_type,
        mime_type=file_asset.mime_type,
        file_size=file_asset.file_size or 0,
        public_url=file_asset.public_url,
        thumbnail_url=file_asset.thumbnail_url,
        created_at=file_asset.created_at,
    )


async def save_upload_file(db: Session, user_org_id: int | None, upload_file: UploadFile) -> FileUploadResponse:
    original_name = upload_file.filename or "upload.bin"
    extension = Path(original_name).suffix.lower().lstrip(".")
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file extension.")

    content_type = upload_file.content_type or "application/octet-stream"
    if not any(content_type.startswith(prefix) for prefix in ALLOWED_MIME_PREFIXES):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file content type.")

    content = await upload_file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is too large.")

    now = datetime.now(UTC)
    folder = Path(settings.upload_dir) / str(now.year) / f"{now.month:02d}"
    folder.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid4().hex}.{extension}"
    target_path = folder / stored_name
    target_path.write_bytes(content)

    relative_path = target_path.relative_to(Path(settings.upload_dir)).as_posix()
    public_url = f"{settings.public_upload_base}/{relative_path}"
    file_type = "IMAGE" if content_type.startswith("image/") else "DOCUMENT"
    checksum = hashlib.sha256(content).hexdigest()

    file_asset = FileAsset(
        org_id=user_org_id,
        file_type=file_type,
        storage_type="LOCAL",
        original_file_name=original_name,
        stored_file_name=stored_name,
        file_extension=extension,
        mime_type=content_type,
        file_size=len(content),
        storage_path=relative_path,
        public_url=public_url,
        thumbnail_url=public_url if file_type == "IMAGE" else None,
        checksum_sha256=checksum,
        active_yn="Y",
    )
    db.add(file_asset)
    db.commit()
    db.refresh(file_asset)
    return _to_response(file_asset)


def file_asset_to_response(file_asset: FileAsset) -> FileUploadResponse:
    return _to_response(file_asset)
