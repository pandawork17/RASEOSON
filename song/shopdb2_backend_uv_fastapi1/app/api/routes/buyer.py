from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import CurrentUser, DbSession, require_roles
from app.schemas.account import (
    BuyerAddressCreateRequest,
    BuyerAddressResponse,
    BuyerAddressUpdateRequest,
    BuyerProfileResponse,
    BuyerProfileUpdateRequest,
)
from app.schemas.buyer import (
    BuyerCatalogResponse,
    BuyerDashboard,
    TossPaymentConfirmRequest,
    TossPaymentFailRequest,
    BuyerOrderPaymentRequest,
    BuyerOrderPaymentResponse,
    BuyerOrderSummary,
    BuyerProductResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    CreateRefundRequest,
    CreateRefundResponse,
    OrderQuoteRequest,
    OrderQuoteResponse,
    RefundSummary,
)
from app.schemas.file import FileUploadResponse
from app.schemas.inquiry import InquiryCreateRequest, InquiryDetail, InquirySummary, InquiryUpdateRequest
from app.services.account_service import (
    create_user_address,
    delete_user_address,
    get_buyer_profile,
    update_buyer_profile,
    update_user_address,
)
from app.services.buyer_service import (
    build_order_quote,
    confirm_toss_order_payment,
    create_order,
    create_refund_request,
    fail_toss_order_payment,
    get_buyer_dashboard,
    get_buyer_orders,
    get_buyer_refunds,
    process_order_payment,
)
from app.services.common_service import get_product_detail, list_catalog_products
from app.services.file_service import save_upload_file
from app.services.inquiry_service import (
    create_inquiry,
    delete_inquiry,
    get_inquiry_detail,
    list_user_inquiries,
    update_inquiry,
)


router = APIRouter(dependencies=[Depends(require_roles("BUYER"))])


@router.get("/dashboard", response_model=BuyerDashboard)
def dashboard(current_user: CurrentUser, db: DbSession) -> BuyerDashboard:
    return get_buyer_dashboard(db, current_user)


@router.get("/products", response_model=BuyerCatalogResponse)
def products(current_user: CurrentUser, db: DbSession) -> BuyerCatalogResponse:
    items = list_catalog_products(db)
    return BuyerCatalogResponse(products=items, total_count=len(items))


@router.get("/products/{product_id}", response_model=BuyerProductResponse)
def product_detail(product_id: int, current_user: CurrentUser, db: DbSession) -> BuyerProductResponse:
    product = get_product_detail(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return BuyerProductResponse(product=product)


@router.get("/orders", response_model=list[BuyerOrderSummary])
def orders(current_user: CurrentUser, db: DbSession) -> list[BuyerOrderSummary]:
    return get_buyer_orders(db, current_user.user_id)


@router.post("/order-quote", response_model=OrderQuoteResponse)
def order_quote(payload: OrderQuoteRequest, current_user: CurrentUser, db: DbSession) -> OrderQuoteResponse:
    return build_order_quote(db, payload)


@router.post("/orders", response_model=CreateOrderResponse)
def order_create(payload: CreateOrderRequest, current_user: CurrentUser, db: DbSession) -> CreateOrderResponse:
    return create_order(db, current_user, payload)


@router.post("/orders/{order_id}/pay", response_model=BuyerOrderPaymentResponse)
def order_payment(
    order_id: int,
    payload: BuyerOrderPaymentRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerOrderPaymentResponse:
    return process_order_payment(db, current_user, order_id, payload)


@router.post("/payments/toss/confirm", response_model=BuyerOrderPaymentResponse)
def toss_confirm(
    payload: TossPaymentConfirmRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerOrderPaymentResponse:
    return confirm_toss_order_payment(db, current_user, payload)


@router.post("/payments/toss/fail", response_model=BuyerOrderPaymentResponse)
def toss_fail(
    payload: TossPaymentFailRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerOrderPaymentResponse:
    return fail_toss_order_payment(db, current_user, payload)


@router.get("/refunds", response_model=list[RefundSummary])
def refunds(current_user: CurrentUser, db: DbSession) -> list[RefundSummary]:
    return get_buyer_refunds(db, current_user.user_id)


@router.post("/refunds", response_model=CreateRefundResponse)
def refund_create(payload: CreateRefundRequest, current_user: CurrentUser, db: DbSession) -> CreateRefundResponse:
    return create_refund_request(db, current_user, payload)


@router.get("/profile", response_model=BuyerProfileResponse)
def profile(current_user: CurrentUser, db: DbSession) -> BuyerProfileResponse:
    return get_buyer_profile(db, current_user)


@router.patch("/profile", response_model=BuyerProfileResponse)
def update_profile(
    payload: BuyerProfileUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerProfileResponse:
    return update_buyer_profile(db, current_user.user_id, payload)


@router.post("/addresses", response_model=BuyerAddressResponse, status_code=201)
def add_address(
    payload: BuyerAddressCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerAddressResponse:
    return create_user_address(db, current_user.user_id, payload)


@router.put("/addresses/{address_id}", response_model=BuyerAddressResponse)
def edit_address(
    address_id: int,
    payload: BuyerAddressUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BuyerAddressResponse:
    return update_user_address(db, current_user.user_id, address_id, payload)


@router.delete("/addresses/{address_id}")
def remove_address(address_id: int, current_user: CurrentUser, db: DbSession) -> dict[str, int]:
    return delete_user_address(db, current_user.user_id, address_id)


@router.post("/files/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> FileUploadResponse:
    return await save_upload_file(db, current_user.org.org_id if current_user.org else None, file)


@router.get("/inquiries", response_model=list[InquirySummary])
def inquiries(current_user: CurrentUser, db: DbSession) -> list[InquirySummary]:
    return list_user_inquiries(db, current_user.user_id)


@router.get("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def inquiry_detail(inquiry_id: int, current_user: CurrentUser, db: DbSession) -> InquiryDetail:
    return get_inquiry_detail(db, inquiry_id, current_user=current_user)


@router.post("/inquiries", response_model=InquiryDetail, status_code=201)
def inquiry_create(
    payload: InquiryCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> InquiryDetail:
    return create_inquiry(db, current_user, payload)


@router.put("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def inquiry_update(
    inquiry_id: int,
    payload: InquiryUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> InquiryDetail:
    return update_inquiry(db, inquiry_id, current_user, payload)


@router.delete("/inquiries/{inquiry_id}")
def inquiry_delete(inquiry_id: int, current_user: CurrentUser, db: DbSession) -> dict[str, int]:
    return delete_inquiry(db, inquiry_id, current_user)
