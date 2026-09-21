from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OrgUnit(Base):
    __tablename__ = "org_units"

    org_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    org_code: Mapped[str] = mapped_column(String(50))
    org_name: Mapped[str] = mapped_column(String(150))
    org_type: Mapped[str] = mapped_column(String(30))
    business_number: Mapped[str | None] = mapped_column(String(30))
    representative_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(255))
    address1: Mapped[str | None] = mapped_column(String(300))
    address2: Mapped[str | None] = mapped_column(String(300))
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    login_id: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    user_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30))
    user_status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    role_code: Mapped[str] = mapped_column(String(30))
    role_name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.role_id"), primary_key=True)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class SellerProfile(Base):
    __tablename__ = "seller_profiles"

    seller_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    company_name: Mapped[str] = mapped_column(String(200))
    business_number: Mapped[str | None] = mapped_column(String(30))
    representative_name: Mapped[str | None] = mapped_column(String(100))
    settlement_bank: Mapped[str | None] = mapped_column(String(100))
    settlement_account: Mapped[str | None] = mapped_column(String(100))
    seller_status: Mapped[str | None] = mapped_column(String(30), default="ACTIVE")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    address_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    address_name: Mapped[str | None] = mapped_column(String(100))
    receiver_name: Mapped[str | None] = mapped_column(String(100))
    receiver_phone: Mapped[str | None] = mapped_column(String(30))
    zipcode: Mapped[str | None] = mapped_column(String(20))
    address1: Mapped[str | None] = mapped_column(String(300))
    address2: Mapped[str | None] = mapped_column(String(300))
    default_yn: Mapped[str] = mapped_column(String(1), default="N")


class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.category_id"))
    category_name: Mapped[str] = mapped_column(String(100))
    category_level: Mapped[int] = mapped_column(Integer, default=1)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    seller_user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.category_id"))
    product_code: Mapped[str] = mapped_column(String(50))
    product_name: Mapped[str] = mapped_column(String(200))
    short_description: Mapped[str | None] = mapped_column(String(1000))
    description: Mapped[str | None] = mapped_column(Text)
    regular_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    sale_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    product_status: Mapped[str] = mapped_column(String(30), default="READY")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class FileAsset(Base):
    __tablename__ = "file_assets"

    file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    file_type: Mapped[str] = mapped_column(String(30))
    storage_type: Mapped[str] = mapped_column(String(30))
    original_file_name: Mapped[str | None] = mapped_column(String(500))
    stored_file_name: Mapped[str | None] = mapped_column(String(500))
    file_extension: Mapped[str | None] = mapped_column(String(30))
    mime_type: Mapped[str | None] = mapped_column(String(100))
    file_size: Mapped[int | None] = mapped_column(BigInteger, default=0)
    storage_path: Mapped[str | None] = mapped_column(String(1000))
    public_url: Mapped[str | None] = mapped_column(String(2000))
    thumbnail_url: Mapped[str | None] = mapped_column(String(2000))
    checksum_sha256: Mapped[str | None] = mapped_column(String(64))
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class ProductImage(Base):
    __tablename__ = "product_images"

    product_image_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    file_id: Mapped[int] = mapped_column(ForeignKey("file_assets.file_id"))
    image_type: Mapped[str] = mapped_column(String(30), default="DETAIL")
    alt_text: Mapped[str | None] = mapped_column(String(500))
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class ProductFile(Base):
    __tablename__ = "product_files"

    product_file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    file_id: Mapped[int] = mapped_column(ForeignKey("file_assets.file_id"))
    file_category: Mapped[str | None] = mapped_column(String(50))
    file_description: Mapped[str | None] = mapped_column(String(500))
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class ProductVariant(Base):
    __tablename__ = "product_variants"

    variant_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    sku_code: Mapped[str] = mapped_column(String(100))
    option_name1: Mapped[str | None] = mapped_column(String(100))
    option_value1: Mapped[str | None] = mapped_column(String(100))
    option_name2: Mapped[str | None] = mapped_column(String(100))
    option_value2: Mapped[str | None] = mapped_column(String(100))
    additional_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("org_units.org_id"))
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.variant_id"))
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0)
    safety_stock: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_no: Mapped[str] = mapped_column(String(64))
    buyer_user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    org_id: Mapped[int] = mapped_column(ForeignKey("org_units.org_id"))
    order_status: Mapped[str] = mapped_column(String(30), default="ORDERED")
    product_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    shipping_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    receiver_name: Mapped[str | None] = mapped_column(String(100))
    receiver_phone: Mapped[str | None] = mapped_column(String(30))
    zipcode: Mapped[str | None] = mapped_column(String(20))
    shipping_address1: Mapped[str | None] = mapped_column(String(300))
    shipping_address2: Mapped[str | None] = mapped_column(String(300))
    ordered_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.variant_id"))
    product_name_snapshot: Mapped[str] = mapped_column(String(200))
    sku_snapshot: Mapped[str | None] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    item_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    item_status: Mapped[str | None] = mapped_column(String(30), default="ORDERED")


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"))
    pg_provider: Mapped[str] = mapped_column(String(50))
    payment_key: Mapped[str | None] = mapped_column(String(255))
    pg_order_id: Mapped[str | None] = mapped_column(String(255))
    customer_key: Mapped[str | None] = mapped_column(String(255))
    payment_type: Mapped[str | None] = mapped_column(String(50))
    payment_method: Mapped[str | None] = mapped_column(String(100))
    payment_status: Mapped[str | None] = mapped_column(String(50))
    requested_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    approved_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    cancelled_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    balance_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    currency: Mapped[str | None] = mapped_column(String(10), default="KRW")
    receipt_url: Mapped[str | None] = mapped_column(String(2000))
    requested_at: Mapped[datetime | None] = mapped_column(DateTime)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class CompanyPolicy(Base):
    __tablename__ = "company_policies"

    policy_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    policy_code: Mapped[str] = mapped_column(String(50))
    policy_name: Mapped[str] = mapped_column(String(200))
    policy_version: Mapped[str] = mapped_column(String(30))
    policy_type: Mapped[str | None] = mapped_column(String(50))
    policy_content: Mapped[str | None] = mapped_column(Text)
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class RefundPolicy(Base):
    __tablename__ = "refund_policies"

    refund_policy_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    policy_name: Mapped[str] = mapped_column(String(200))
    allowed_days: Mapped[int] = mapped_column(Integer)
    unopened_refund_yn: Mapped[str] = mapped_column(String(1), default="Y")
    opened_refund_yn: Mapped[str] = mapped_column(String(1), default="N")
    defective_refund_yn: Mapped[str] = mapped_column(String(1), default="Y")
    shipping_fee_payer: Mapped[str] = mapped_column(String(30), default="BUYER")
    refund_policy_text: Mapped[str | None] = mapped_column(Text)
    policy_json: Mapped[dict | None] = mapped_column(JSON)
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    refund_request_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"))
    buyer_user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    refund_policy_id: Mapped[int | None] = mapped_column(ForeignKey("refund_policies.refund_policy_id"))
    refund_reason: Mapped[str | None] = mapped_column(String(500))
    requested_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    approved_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    refund_status: Mapped[str] = mapped_column(String(30), default="REQUESTED")
    requested_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    approved_at: Mapped[datetime | None] = mapped_column(DateTime)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)


class RefundItem(Base):
    __tablename__ = "refund_items"

    refund_item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    refund_request_id: Mapped[int] = mapped_column(ForeignKey("refund_requests.refund_request_id"))
    order_item_id: Mapped[int] = mapped_column(ForeignKey("order_items.order_item_id"))
    refund_quantity: Mapped[int] = mapped_column(Integer)
    refund_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))


class BuyerInquiry(Base):
    __tablename__ = "buyer_inquiries"

    inquiry_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    org_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.org_id"))
    category_code: Mapped[str] = mapped_column(String(50), default="GENERAL")
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    inquiry_status: Mapped[str] = mapped_column(String(30), default="OPEN")
    secret_yn: Mapped[str] = mapped_column(String(1), default="N")
    answer_content: Mapped[str | None] = mapped_column(Text)
    answered_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"))
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    answered_at: Mapped[datetime | None] = mapped_column(DateTime)


class InquiryFile(Base):
    __tablename__ = "inquiry_files"

    inquiry_file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    inquiry_id: Mapped[int] = mapped_column(ForeignKey("buyer_inquiries.inquiry_id"))
    file_id: Mapped[int] = mapped_column(ForeignKey("file_assets.file_id"))
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
