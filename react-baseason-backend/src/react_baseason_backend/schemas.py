import datetime
import decimal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------- auth ----
class RegisterRequest(BaseModel):
    login_id: str = Field(min_length=4, max_length=100)
    password: str = Field(min_length=4, max_length=100)
    user_name: str = Field(min_length=1, max_length=100)
    email: str
    phone: str | None = None


class LoginRequest(BaseModel):
    login_id: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=4, max_length=100)


class UpdateMeRequest(BaseModel):
    user_name: str | None = None
    email: str | None = None
    phone: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    org_id: int | None = None
    login_id: str
    user_name: str
    email: str
    phone: str | None = None
    user_status: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ----------------------------------------------------------- categories ----
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    parent_category_id: int | None
    category_name: str
    category_level: int | None


# ------------------------------------------------------------- products ----
class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    variant_id: int
    sku_code: str
    option_name1: str | None
    option_value1: str | None
    option_name2: str | None
    option_value2: str | None
    additional_price: decimal.Decimal
    stock_available: int


class ProductListItem(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    short_description: str | None
    category_id: int
    category_name: str
    regular_price: decimal.Decimal
    sale_price: decimal.Decimal
    product_status: str
    thumbnail_url: str
    in_stock: bool


class ProductDetailOut(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    short_description: str | None
    description: str | None
    category_id: int
    category_name: str
    regular_price: decimal.Decimal
    sale_price: decimal.Decimal
    product_status: str
    images: list[str]
    variants: list[VariantOut]


class ProductListResponse(BaseModel):
    total: int
    items: list[ProductListItem]


# ------------------------------------------------------------ addresses ----
class AddressIn(BaseModel):
    address_name: str | None = None
    receiver_name: str
    receiver_phone: str
    zipcode: str | None = None
    address1: str
    address2: str | None = None
    default_yn: str = "N"


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    address_id: int
    address_name: str | None
    receiver_name: str | None
    receiver_phone: str | None
    zipcode: str | None
    address1: str | None
    address2: str | None
    default_yn: str


# ---------------------------------------------------------------- orders ----
class CreateOrderRequest(BaseModel):
    variant_id: int
    quantity: int = Field(gt=0, le=99)
    receiver_name: str
    receiver_phone: str
    zipcode: str | None = None
    shipping_address1: str
    shipping_address2: str | None = None
    payment_method: str = "CARD"


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_item_id: int
    product_id: int
    variant_id: int | None
    product_name_snapshot: str
    sku_snapshot: str | None
    quantity: int
    unit_price: decimal.Decimal
    item_amount: decimal.Decimal
    item_status: str | None
    thumbnail_url: str | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    order_no: str
    order_status: str
    process_status: str | None
    product_amount: decimal.Decimal
    discount_amount: decimal.Decimal
    shipping_amount: decimal.Decimal
    total_amount: decimal.Decimal
    receiver_name: str | None
    receiver_phone: str | None
    zipcode: str | None
    shipping_address1: str | None
    shipping_address2: str | None
    ordered_at: datetime.datetime | None
    items: list[OrderItemOut]
    payment_method: str | None = None
    payment_status: str | None = None


# --------------------------------------------------------------- refunds ----
class CreateRefundRequest(BaseModel):
    order_id: int
    refund_reason: str = Field(min_length=1, max_length=500)


class RefundRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    refund_request_id: int
    order_id: int
    refund_reason: str | None
    requested_amount: decimal.Decimal | None
    approved_amount: decimal.Decimal | None
    refund_status: str
    requested_at: datetime.datetime | None
    order_no: str | None = None
