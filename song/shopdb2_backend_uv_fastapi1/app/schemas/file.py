from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    file_id: int
    original_file_name: str | None = None
    file_type: str
    storage_type: str
    mime_type: str | None = None
    file_size: int
    public_url: str | None = None
    thumbnail_url: str | None = None
    created_at: datetime | None = None
