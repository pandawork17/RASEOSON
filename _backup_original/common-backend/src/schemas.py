"""
[schemas.py - 공용 Pydantic DTO (Data Transfer Object) 스키마 정의]

■ 역할:
  - 클라이언트가 요청(Request)할 때 보낸 JSON 데이터의 타입과 유효성을 검증(Validation)합니다.
  - 서버가 응답(Response)할 때 필요한 필드만 정제하여 안전하게 직렬화합니다.
  - ORM 모델(SQLAlchemy)을 Pydantic 객체로 자동 변환하기 위해 `from_attributes = True` 설정을 사용합니다.

■ 포함된 도메인 스키마:
  1. 인증 및 회원 (Register, Login, UserOut, TokenResponse 등)
  2. 카테고리 및 상품 (CategoryOut, ProductDetailOut, ProductListResponse, PriceUpdateRequest 등)
  3. 배송지 (AddressIn, AddressOut)
  4. 주문 및 환불 (CreateOrderRequest, OrderOut, RefundRequestOut 등)
  5. 공지사항 (NoticeOut, NoticeCreate, NoticeUpdate 등)
  6. 고객 문의 (InquiryIn, InquiryOut 등)
  7. 조직 및 권한 (OrgUnitCreate, OrgUnitUpdate, RoleUpdate 등)
"""

import datetime
import decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# 1. 인증 및 회원 스키마 (담당 A / an)
# =========================================================
class RegisterRequest(BaseModel):
    """회원가입 요청 바디"""
    login_id: str = Field(min_length=4, max_length=100, description="로그인 아이디")
    password: str = Field(min_length=4, max_length=100, description="비밀번호")
    user_name: str = Field(min_length=1, max_length=100, description="사용자 실명")
    email: str = Field(description="이메일 주소")
    phone: Optional[str] = Field(None, description="전화번호")


class LoginRequest(BaseModel):
    """로그인 요청 바디"""
    login_id: str = Field(description="로그인 아이디")
    password: str = Field(description="비밀번호")


class ChangePasswordRequest(BaseModel):
    """비밀번호 변경 요청 바디"""
    old_password: str = Field(description="기존 비밀번호")
    new_password: str = Field(min_length=4, max_length=100, description="신규 비밀번호")


class UpdateMeRequest(BaseModel):
    """내 정보 수정 요청 바디"""
    user_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class UserOut(BaseModel):
    """클라이언트에 전달되는 회원 정보 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    org_id: Optional[int] = None
    login_id: str
    user_name: str
    nickname: Optional[str] = None
    email: str
    phone: Optional[str] = None
    user_status: str
    role_code: Optional[str] = None
    role_name: Optional[str] = None


class TokenResponse(BaseModel):
    """로그인 및 회원가입 성공 시 반환되는 JWT 토큰 응답"""
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# =========================================================
# 2. 카테고리 및 상품 스키마 (담당 B / an, park)
# =========================================================
class CategoryOut(BaseModel):
    """카테고리 목록 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    parent_category_id: Optional[int] = None
    category_name: str
    category_level: Optional[int] = 1


class VariantOut(BaseModel):
    """상품 옵션/단품 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    variant_id: int
    sku_code: str
    option_name1: Optional[str] = None
    option_value1: Optional[str] = None
    option_name2: Optional[str] = None
    option_value2: Optional[str] = None
    additional_price: decimal.Decimal
    stock_available: int


class ProductListItem(BaseModel):
    """쇼핑몰 상품 목록 카드용 응답 DTO"""
    product_id: int
    product_code: str
    product_name: str
    short_description: Optional[str] = None
    category_id: int
    category_name: str
    regular_price: decimal.Decimal
    sale_price: decimal.Decimal
    product_status: str
    thumbnail_url: str
    in_stock: bool


class ProductDetailOut(BaseModel):
    """쇼핑몰 상품 상세 페이지용 응답 DTO (최소 5장 이상의 갤러리 이미지 포함)"""
    product_id: int
    product_code: str
    product_name: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: int
    category_name: str
    regular_price: decimal.Decimal
    sale_price: decimal.Decimal
    product_status: str
    images: List[str]
    variants: List[VariantOut]


class ProductListResponse(BaseModel):
    """페이징 처리된 상품 목록 응답"""
    total: int
    items: List[ProductListItem]


class PriceUpdateRequest(BaseModel):
    """지사 관리자 화면에서 상품 판매가 변경 요청 DTO (park)"""
    sale_price: float = Field(gt=0, description="수정할 판매가")


# =========================================================
# 3. 배송지 스키마 (담당 A / an)
# =========================================================
class AddressIn(BaseModel):
    """배송지 등록/수정 요청 DTO"""
    address_name: Optional[str] = None
    receiver_name: str
    receiver_phone: str
    zipcode: Optional[str] = None
    address1: str
    address2: Optional[str] = None
    default_yn: str = "N"


class AddressOut(BaseModel):
    """배송지 목록 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    address_id: int
    address_name: Optional[str] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    zipcode: Optional[str] = None
    address1: Optional[str] = None
    address2: Optional[str] = None
    default_yn: str


# =========================================================
# 4. 주문 및 결제, 환불 스키마 (담당 C / an)
# =========================================================
class CreateOrderRequest(BaseModel):
    """고객 주문서 작성 요청 바디"""
    variant_id: int
    quantity: int = Field(gt=0, le=99)
    receiver_name: str
    receiver_phone: str
    zipcode: Optional[str] = None
    shipping_address1: str
    shipping_address2: Optional[str] = None
    payment_method: str = "CARD"


class OrderItemOut(BaseModel):
    """주문 상세 내 품목 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    order_item_id: int
    product_id: int
    variant_id: Optional[int] = None
    product_name_snapshot: str
    sku_snapshot: Optional[str] = None
    quantity: int
    unit_price: decimal.Decimal
    item_amount: decimal.Decimal
    item_status: Optional[str] = None
    thumbnail_url: Optional[str] = None


class OrderOut(BaseModel):
    """고객 주문 상세 및 내역 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    order_no: str
    order_status: str
    process_status: Optional[str] = None
    product_amount: decimal.Decimal
    discount_amount: decimal.Decimal
    shipping_amount: decimal.Decimal
    total_amount: decimal.Decimal
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    zipcode: Optional[str] = None
    shipping_address1: Optional[str] = None
    shipping_address2: Optional[str] = None
    ordered_at: Optional[datetime.datetime] = None
    items: List[OrderItemOut]
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None


class CreateRefundRequest(BaseModel):
    """환불 신청 요청 바디"""
    order_id: int
    refund_reason: str = Field(min_length=1, max_length=500)


class RefundRequestOut(BaseModel):
    """환불 내역 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    refund_request_id: int
    order_id: int
    refund_reason: Optional[str] = None
    requested_amount: Optional[decimal.Decimal] = None
    approved_amount: Optional[decimal.Decimal] = None
    refund_status: str
    requested_at: Optional[datetime.datetime] = None
    order_no: Optional[str] = None


# =========================================================
# 5. 공지사항 스키마 (통합 / an + song)
# =========================================================
class NoticeOut(BaseModel):
    """공지사항 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    notice_id: int
    title: str
    content: str
    author_id: int
    author_name: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    view_count: int = 0
    is_pinned: str = "N"
    image: Optional[str] = None


class NoticeCreate(BaseModel):
    """본사 관리자의 공지사항 등록 요청 바디 (song)"""
    title: str
    content: str
    author_id: int
    org_id: int = 1
    is_pinned: str = "N"
    image: Optional[str] = None


class NoticeUpdate(BaseModel):
    """본사 관리자의 공지사항 수정 요청 바디 (song)"""
    title: str
    content: str
    is_pinned: str = "N"
    image: Optional[str] = None


# =========================================================
# 6. 고객 1:1 문의 스키마 (담당 A / an)
# =========================================================
class InquiryIn(BaseModel):
    """고객 1:1 문의 등록 요청 DTO"""
    category_code: str
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    secret_yn: str = "N"
    photos: List[str] = []


class InquiryUpdate(BaseModel):
    """고객 1:1 문의 수정 요청 DTO"""
    category_code: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    secret_yn: Optional[str] = None
    photos: Optional[List[str]] = None


class InquiryOut(BaseModel):
    """고객 1:1 문의 상세 및 목록 응답 DTO"""
    model_config = ConfigDict(from_attributes=True)

    inquiry_id: int
    user_id: int
    user_name: Optional[str] = None
    login_id: Optional[str] = None
    org_id: Optional[int] = None
    category_code: str
    title: str
    content: str
    inquiry_status: str
    secret_yn: str = "N"
    answer_content: Optional[str] = None
    answered_by_name: Optional[str] = None
    photos: List[str] = []
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    answered_at: Optional[datetime.datetime] = None


# =========================================================
# 7. 본사 관리 및 조직/권한 스키마 (담당 A / song)
# =========================================================
class OrgUnitCreate(BaseModel):
    """지사 신규 등록 DTO (song)"""
    org_code: str
    org_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address1: Optional[str] = None


class OrgUnitUpdate(BaseModel):
    """지사 정보 수정 DTO (song)"""
    org_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address1: Optional[str] = None


class RoleUpdate(BaseModel):
    """회원 권한 변경 요청 DTO (song)"""
    role: str

