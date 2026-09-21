from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ProductCard


class SellerDashboard(BaseModel):
    stats: dict[str, float | int]
    top_products: list[ProductCard]
    latest_orders: list[dict]


class SellerProductVariantCreate(BaseModel):
    sku_code: str
    option_name1: str | None = None
    option_value1: str | None = None
    option_name2: str | None = None
    option_value2: str | None = None
    additional_price: float = 0
    initial_stock: int = 0
    safety_stock: int = 0
    org_id: int | None = None


class SellerProductImageCreate(BaseModel):
    file_id: int
    image_type: str = "DETAIL"
    alt_text: str | None = None
    display_order: int = 0
    is_main: bool = False


class SellerProductFileCreate(BaseModel):
    file_id: int
    file_category: str | None = None
    file_description: str | None = None
    display_order: int = 0


class SellerProductCreate(BaseModel):
    category_id: int
    product_name: str
    short_description: str | None = None
    description: str | None = None
    regular_price: float = Field(gt=0)
    sale_price: float = Field(gt=0)
    product_status: str = "READY"
    product_code: str | None = None
    image_url: str | None = None
    thumbnail_url: str | None = None
    images: list[SellerProductImageCreate] = Field(default_factory=list)
    files: list[SellerProductFileCreate] = Field(default_factory=list)
    variants: list[SellerProductVariantCreate] = Field(default_factory=list)


class SellerProductCreateResponse(BaseModel):
    product_id: int
    product_code: str
    created_variant_count: int
    created_image_count: int
    created_file_count: int


class SellerProductStatusUpdate(BaseModel):
    product_status: str


class SellerInventoryRow(BaseModel):
    inventory_id: int
    org_name: str
    product_name: str
    sku_code: str
    available_quantity: int
    stock_quantity: int
    reserved_quantity: int
    safety_stock: int
    updated_at: datetime | None = None


class SellerOrderRow(BaseModel):
    order_no: str
    buyer_name: str
    product_name: str
    sku_code: str | None = None
    quantity: int
    item_amount: float
    order_status: str
    ordered_at: datetime | None = None
