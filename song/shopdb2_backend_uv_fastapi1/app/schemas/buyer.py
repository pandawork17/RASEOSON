from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ProductCard, ProductDetail, RefundPolicySummary


class BuyerOrderItem(BaseModel):
    order_item_id: int
    product_name: str
    sku_code: str | None = None
    quantity: int
    unit_price: float
    item_amount: float
    item_status: str | None = None


class BuyerOrderSummary(BaseModel):
    order_id: int
    order_no: str
    order_status: str
    org_name: str
    total_amount: float
    shipping_amount: float
    ordered_at: datetime | None = None
    payment_status: str | None = None
    items: list[BuyerOrderItem]


class BuyerDashboard(BaseModel):
    stats: dict[str, float | int]
    current_refund_policy: RefundPolicySummary | None = None
    featured_products: list[ProductCard]
    recent_orders: list[BuyerOrderSummary]


class CreateOrderRequest(BaseModel):
    product_id: int
    variant_id: int
    org_id: int
    quantity: int = Field(ge=1, le=99)
    receiver_name: str
    receiver_phone: str
    zipcode: str | None = None
    shipping_address1: str
    shipping_address2: str | None = None
    payment_provider: str = "TOSS"
    payment_method: str = "CARD"


class OrderQuoteRequest(BaseModel):
    product_id: int
    variant_id: int
    org_id: int
    quantity: int = Field(ge=1, le=99)


class OrderQuoteResponse(BaseModel):
    product_id: int
    product_name: str
    variant_id: int
    sku_code: str
    org_id: int
    org_name: str
    quantity: int
    available_quantity: int
    unit_price: float
    product_amount: float
    shipping_amount: float
    total_amount: float


class CreateOrderResponse(BaseModel):
    order_id: int
    order_no: str
    product_id: int
    product_name: str
    payment_id: int
    total_amount: float
    order_status: str
    payment_status: str
    payment_provider: str
    payment_method: str
    customer_key: str
    order_name: str
    toss_client_key: str | None = None
    payment_enabled: bool = False


class BuyerOrderPaymentRequest(BaseModel):
    payment_method: str = "CARD"
    card_company: str | None = None
    card_number_last4: str | None = None


class TossPaymentConfirmRequest(BaseModel):
    payment_key: str
    order_id: str
    amount: float


class TossPaymentFailRequest(BaseModel):
    order_id: str
    code: str | None = None
    message: str | None = None


class BuyerOrderPaymentResponse(BaseModel):
    order_id: int
    order_no: str
    payment_id: int
    payment_status: str
    order_status: str
    payment_method: str | None = None
    payment_key: str | None = None
    receipt_url: str | None = None
    approved_at: datetime | None = None


class RefundSummary(BaseModel):
    refund_request_id: int
    order_no: str
    refund_status: str
    requested_amount: float | None = None
    approved_amount: float | None = None
    refund_reason: str | None = None
    requested_at: datetime | None = None


class CreateRefundRequest(BaseModel):
    order_id: int
    order_item_id: int
    refund_quantity: int = Field(ge=1, le=99)
    refund_reason: str


class CreateRefundResponse(BaseModel):
    refund_request_id: int
    refund_status: str
    requested_amount: float


class BuyerCatalogResponse(BaseModel):
    products: list[ProductCard]
    total_count: int


class BuyerProductResponse(BaseModel):
    product: ProductDetail
