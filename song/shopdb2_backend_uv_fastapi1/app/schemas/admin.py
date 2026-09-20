from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.schemas.common import CompanyPolicySummary, RefundPolicySummary, UserSummary
from app.schemas.inquiry import InquiryDetail, InquirySummary


class AdminDashboard(BaseModel):
    stats: dict[str, float | int]
    monthly_sales: list[dict]
    branch_sales: list[dict]


class AdminUserRow(UserSummary):
    role_names: list[str]


class AdminPaymentRow(BaseModel):
    payment_id: int
    order_no: str
    buyer_name: str
    pg_provider: str
    payment_method: str | None = None
    payment_status: str | None = None
    requested_amount: float
    approved_amount: float | None = None
    approved_at: datetime | None = None


class AdminRefundRow(BaseModel):
    refund_request_id: int
    order_no: str
    buyer_name: str
    policy_name: str | None = None
    refund_reason: str | None = None
    refund_status: str
    requested_amount: float | None = None
    approved_amount: float | None = None
    requested_at: datetime | None = None


class AdminPoliciesResponse(BaseModel):
    company_policies: list[CompanyPolicySummary]
    refund_policies: list[RefundPolicySummary]


class AdminSupportResponse(BaseModel):
    inquiries: list[InquirySummary]


class AdminInquiryDetailResponse(BaseModel):
    inquiry: InquiryDetail


class AdminTableColumn(BaseModel):
    name: str
    type: str
    nullable: bool
    default_value: str | None = None
    is_primary_key: bool
    is_auto_increment: bool


class AdminTableDefinition(BaseModel):
    table_name: str
    row_count: int
    primary_keys: list[str]
    columns: list[AdminTableColumn]
    can_create: bool = True
    can_update: bool = True
    can_delete: bool = True


class AdminTableRowsResponse(BaseModel):
    table_name: str
    row_count: int
    filtered_row_count: int
    primary_keys: list[str]
    columns: list[AdminTableColumn]
    rows: list[dict[str, Any]]
    limit: int
    offset: int
    search: str = ""
    search_column: str = "_all"


class AdminTableCreateRequest(BaseModel):
    data: dict[str, Any]


class AdminTableUpdateRequest(BaseModel):
    primary_key: dict[str, Any]
    data: dict[str, Any]


class AdminTableDeleteRequest(BaseModel):
    primary_key: dict[str, Any]


class AdminTableMutationResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    table_name: str
    primary_key: dict[str, Any]
    row: dict[str, Any]
