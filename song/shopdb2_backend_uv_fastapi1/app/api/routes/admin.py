from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.api.deps import CurrentUser, DbSession, require_roles
from app.schemas.admin import (
    AdminDashboard,
    AdminPaymentRow,
    AdminPoliciesResponse,
    AdminRefundRow,
    AdminTableCreateRequest,
    AdminTableDefinition,
    AdminTableDeleteRequest,
    AdminTableMutationResponse,
    AdminTableRowsResponse,
    AdminTableUpdateRequest,
    AdminUserRow,
)
from app.schemas.common import OrgSummary, ProductCard
from app.schemas.file import FileUploadResponse
from app.schemas.inquiry import InquiryAnswerRequest, InquiryDetail, InquirySummary
from app.schemas.seller import SellerProductCreate, SellerProductCreateResponse
from app.services.admin_service import (
    get_admin_dashboard,
    get_admin_payments,
    get_admin_policies,
    get_admin_products,
    get_admin_refunds,
    get_admin_users,
    list_orgs,
)
from app.services.admin_table_service import (
    create_admin_table_row,
    delete_admin_table_row,
    get_admin_table_rows,
    list_admin_table_definitions,
    update_admin_table_row,
)
from app.services.file_service import save_upload_file
from app.services.inquiry_service import answer_inquiry, get_inquiry_detail, list_all_inquiries
from app.services.seller_service import create_seller_product


router = APIRouter(dependencies=[Depends(require_roles("ADMIN"))])


@router.get("/dashboard", response_model=AdminDashboard)
def dashboard(current_user: CurrentUser, db: DbSession) -> AdminDashboard:
    return get_admin_dashboard(db)


@router.get("/users", response_model=list[AdminUserRow])
def users(current_user: CurrentUser, db: DbSession) -> list[AdminUserRow]:
    return get_admin_users(db)


@router.get("/payments", response_model=list[AdminPaymentRow])
def payments(current_user: CurrentUser, db: DbSession) -> list[AdminPaymentRow]:
    return get_admin_payments(db)


@router.get("/refunds", response_model=list[AdminRefundRow])
def refunds(current_user: CurrentUser, db: DbSession) -> list[AdminRefundRow]:
    return get_admin_refunds(db)


@router.get("/policies", response_model=AdminPoliciesResponse)
def policies(current_user: CurrentUser, db: DbSession) -> AdminPoliciesResponse:
    return get_admin_policies(db)


@router.get("/products", response_model=list[ProductCard])
def products(
    current_user: CurrentUser,
    db: DbSession,
    search: str = Query(default="", max_length=200),
    product_status: str = Query(default="ALL", max_length=30),
    category_id: int | None = Query(default=None, ge=1),
) -> list[ProductCard]:
    return get_admin_products(db, search=search, product_status=product_status, category_id=category_id)


@router.get("/orgs", response_model=list[OrgSummary])
def orgs(current_user: CurrentUser, db: DbSession) -> list[OrgSummary]:
    return list_orgs(db)


@router.post("/products", response_model=SellerProductCreateResponse)
def create_product(payload: SellerProductCreate, current_user: CurrentUser, db: DbSession) -> SellerProductCreateResponse:
    return create_seller_product(db, current_user, payload)


@router.post("/files/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> FileUploadResponse:
    return await save_upload_file(db, current_user.org.org_id if current_user.org else None, file)


@router.get("/inquiries", response_model=list[InquirySummary])
def inquiries(current_user: CurrentUser, db: DbSession) -> list[InquirySummary]:
    return list_all_inquiries(db)


@router.get("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def inquiry_detail(inquiry_id: int, current_user: CurrentUser, db: DbSession) -> InquiryDetail:
    return get_inquiry_detail(db, inquiry_id, current_user=current_user, admin_view=True)


@router.post("/inquiries/{inquiry_id}/answer", response_model=InquiryDetail)
def inquiry_answer(
    inquiry_id: int,
    payload: InquiryAnswerRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> InquiryDetail:
    return answer_inquiry(db, inquiry_id, current_user, payload.answer_content, payload.inquiry_status)


@router.get("/table-definitions", response_model=list[AdminTableDefinition])
def table_definitions(current_user: CurrentUser, db: DbSession) -> list[AdminTableDefinition]:
    return list_admin_table_definitions(db)


@router.get("/tables/{table_name}", response_model=AdminTableRowsResponse)
def table_rows(
    table_name: str,
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    search: str = Query(default="", max_length=200),
    search_column: str = Query(default="_all", max_length=128),
) -> AdminTableRowsResponse:
    return get_admin_table_rows(
        db,
        table_name,
        limit=limit,
        offset=offset,
        search=search,
        search_column=search_column,
    )


@router.post("/tables/{table_name}", response_model=AdminTableMutationResponse, status_code=201)
def table_create(
    table_name: str,
    payload: AdminTableCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> AdminTableMutationResponse:
    return create_admin_table_row(db, table_name, payload)


@router.put("/tables/{table_name}", response_model=AdminTableMutationResponse)
def table_update(
    table_name: str,
    payload: AdminTableUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> AdminTableMutationResponse:
    return update_admin_table_row(db, table_name, payload)


@router.delete("/tables/{table_name}", response_model=AdminTableMutationResponse)
def table_delete(
    table_name: str,
    payload: AdminTableDeleteRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> AdminTableMutationResponse:
    return delete_admin_table_row(db, table_name, payload)
