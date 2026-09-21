from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.file import FileUploadResponse


class InquiryCreateRequest(BaseModel):
    category_code: str = Field(default="GENERAL", max_length=50)
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=5)
    secret_yn: str = Field(default="N", max_length=1)
    attachment_file_ids: list[int] = Field(default_factory=list)


class InquiryUpdateRequest(BaseModel):
    category_code: str = Field(default="GENERAL", max_length=50)
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=5)
    secret_yn: str = Field(default="N", max_length=1)
    attachment_file_ids: list[int] = Field(default_factory=list)


class InquiryAnswerRequest(BaseModel):
    answer_content: str = Field(min_length=2)
    inquiry_status: str = Field(default="ANSWERED", max_length=30)


class InquirySummary(BaseModel):
    inquiry_id: int
    category_code: str
    title: str
    content_preview: str
    inquiry_status: str
    secret_yn: str
    user_id: int
    user_name: str
    answer_content: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    answered_at: datetime | None = None
    attachments: list[FileUploadResponse]


class InquiryDetail(InquirySummary):
    content: str
