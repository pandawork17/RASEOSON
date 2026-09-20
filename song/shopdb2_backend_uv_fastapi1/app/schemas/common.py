from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class OrgSummary(BaseModel):
    org_id: int
    org_name: str
    org_type: str


class UserSummary(BaseModel):
    user_id: int
    login_id: str
    user_name: str
    email: str
    phone: str | None = None
    org: OrgSummary | None = None
    roles: list[str]


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    category_level: int
    parent_category_id: int | None = None


class ProductCard(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    category_name: str
    seller_name: str
    seller_company: str | None = None
    regular_price: float
    sale_price: float
    discount_rate: int
    image_url: str | None = None
    thumbnail_url: str | None = None
    product_status: str
    created_at: datetime | None = None


class ProductImageItem(BaseModel):
    product_image_id: int
    image_type: str
    alt_text: str | None = None
    display_order: int
    image_url: str | None = None
    thumbnail_url: str | None = None


class ProductFileItem(BaseModel):
    product_file_id: int
    file_id: int
    file_category: str | None = None
    file_description: str | None = None
    display_order: int
    original_file_name: str | None = None
    mime_type: str | None = None
    public_url: str | None = None
    created_at: datetime | None = None


class VariantInventoryItem(BaseModel):
    variant_id: int
    sku_code: str
    option_name1: str | None = None
    option_value1: str | None = None
    option_name2: str | None = None
    option_value2: str | None = None
    additional_price: float
    org_id: int | None = None
    org_name: str | None = None
    stock_quantity: int
    reserved_quantity: int
    safety_stock: int
    available_quantity: int


class ProductDetail(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    short_description: str | None = None
    description: str | None = None
    category_name: str
    seller_name: str
    seller_company: str | None = None
    regular_price: float
    sale_price: float
    discount_rate: int
    product_status: str
    images: list[ProductImageItem]
    files: list[ProductFileItem] = []
    variants: list[VariantInventoryItem]


class RefundPolicySummary(BaseModel):
    refund_policy_id: int
    policy_name: str
    allowed_days: int
    shipping_fee_payer: str
    refund_policy_text: str | None = None
    effective_from: date
    effective_to: date | None = None


class CompanyPolicySummary(BaseModel):
    policy_id: int
    policy_code: str
    policy_name: str
    policy_version: str
    policy_type: str | None = None
    effective_from: date
    effective_to: date | None = None
