from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.core.security import create_access_token
from app.schemas.account import BuyerSignupRequest, BuyerSignupResponse
from app.schemas.common import ProductCard, ProductDetail
from app.schemas.inquiry import InquiryDetail, InquirySummary
from app.services.account_service import create_buyer_account
from app.services.common_service import get_product_detail, list_catalog_products
from app.services.inquiry_service import get_inquiry_detail, list_public_inquiries


router = APIRouter()


@router.get("/catalog", response_model=list[ProductCard])
def catalog(db: DbSession) -> list[ProductCard]:
    return list_catalog_products(db)


@router.get("/products/{product_id}", response_model=ProductDetail)
def product_detail(product_id: int, db: DbSession) -> ProductDetail:
    product = get_product_detail(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product


@router.post("/signup/buyer", response_model=BuyerSignupResponse, status_code=status.HTTP_201_CREATED)
def signup_buyer(payload: BuyerSignupRequest, db: DbSession) -> BuyerSignupResponse:
    user = create_buyer_account(db, payload)
    token = create_access_token(str(user.user_id), {"roles": user.roles})
    return BuyerSignupResponse(access_token=token, user=user)


@router.get("/inquiries", response_model=list[InquirySummary])
def public_inquiries(db: DbSession) -> list[InquirySummary]:
    return list_public_inquiries(db)


@router.get("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def public_inquiry_detail(inquiry_id: int, db: DbSession) -> InquiryDetail:
    return get_inquiry_detail(db, inquiry_id)
