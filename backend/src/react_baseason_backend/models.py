import datetime
import decimal

from sqlalchemy import (
    DECIMAL,
    BigInteger,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class OrgUnit(Base):
    __tablename__ = "org_units"

    org_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_code: Mapped[str] = mapped_column(String(50))
    org_name: Mapped[str] = mapped_column(String(150))
    org_type: Mapped[str] = mapped_column(String(20))


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    role_code: Mapped[str] = mapped_column(String(30))
    role_name: Mapped[str] = mapped_column(String(100))


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("org_units.org_id"))
    login_id: Mapped[str] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    user_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    user_status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    addresses: Mapped[list["UserAddress"]] = relationship(back_populates="user")


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.role_id"), primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)


class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_category_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("categories.category_id"))
    category_name: Mapped[str] = mapped_column(String(100))
    category_level: Mapped[int | None] = mapped_column(Integer, default=1)
    display_order: Mapped[int | None] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class FileAsset(Base):
    __tablename__ = "file_assets"

    file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    file_type: Mapped[str] = mapped_column(String(20))
    storage_type: Mapped[str] = mapped_column(String(20))
    original_file_name: Mapped[str | None] = mapped_column(String(500))
    public_url: Mapped[str | None] = mapped_column(String(2000))
    thumbnail_url: Mapped[str | None] = mapped_column(String(2000))


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    seller_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("categories.category_id"))
    product_code: Mapped[str] = mapped_column(String(50), unique=True)
    product_name: Mapped[str] = mapped_column(String(200))
    short_description: Mapped[str | None] = mapped_column(String(1000))
    description: Mapped[str | None] = mapped_column(Text)
    regular_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    sale_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    product_status: Mapped[str] = mapped_column(String(20), default="READY")
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    category: Mapped["Category"] = relationship()
    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product", order_by="ProductVariant.variant_id")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", order_by="ProductImage.display_order")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    variant_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"))
    sku_code: Mapped[str] = mapped_column(String(100), unique=True)
    option_name1: Mapped[str | None] = mapped_column(String(100))
    option_value1: Mapped[str | None] = mapped_column(String(100))
    option_name2: Mapped[str | None] = mapped_column(String(100))
    option_value2: Mapped[str | None] = mapped_column(String(100))
    additional_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")

    product: Mapped["Product"] = relationship(back_populates="variants")


class ProductImage(Base):
    __tablename__ = "product_images"

    product_image_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"))
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("file_assets.file_id"))
    image_type: Mapped[str] = mapped_column(String(20), default="DETAIL")
    alt_text: Mapped[str | None] = mapped_column(String(500))
    display_order: Mapped[int | None] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")

    product: Mapped["Product"] = relationship(back_populates="images")
    file: Mapped["FileAsset"] = relationship()


class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int] = mapped_column(BigInteger)
    variant_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("product_variants.variant_id"))
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0)
    safety_stock: Mapped[int] = mapped_column(Integer, default=0)


class UserAddress(Base):
    __tablename__ = "user_addresses"

    address_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    address_name: Mapped[str | None] = mapped_column(String(100))
    receiver_name: Mapped[str | None] = mapped_column(String(100))
    receiver_phone: Mapped[str | None] = mapped_column(String(30))
    zipcode: Mapped[str | None] = mapped_column(String(20))
    address1: Mapped[str | None] = mapped_column(String(300))
    address2: Mapped[str | None] = mapped_column(String(300))
    default_yn: Mapped[str] = mapped_column(String(1), default="N")
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(back_populates="addresses")


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_no: Mapped[str] = mapped_column(String(64), unique=True)
    buyer_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    org_id: Mapped[int] = mapped_column(BigInteger)
    order_status: Mapped[str] = mapped_column(String(30), default="ORDERED")
    process_status: Mapped[str | None] = mapped_column(String(30))
    product_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    discount_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    shipping_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    total_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    receiver_name: Mapped[str | None] = mapped_column(String(100))
    receiver_phone: Mapped[str | None] = mapped_column(String(30))
    zipcode: Mapped[str | None] = mapped_column(String(20))
    shipping_address1: Mapped[str | None] = mapped_column(String(300))
    shipping_address2: Mapped[str | None] = mapped_column(String(300))
    ordered_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", order_by="OrderItem.order_item_id")
    payments: Mapped[list["Payment"]] = relationship(back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"))
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"))
    variant_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("product_variants.variant_id"))
    product_name_snapshot: Mapped[str] = mapped_column(String(200))
    sku_snapshot: Mapped[str | None] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    item_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    item_status: Mapped[str | None] = mapped_column(String(30), default="ORDERED")

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
    variant: Mapped["ProductVariant"] = relationship()


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"))
    pg_provider: Mapped[str] = mapped_column(String(50))
    payment_key: Mapped[str | None] = mapped_column(String(255), unique=True)
    pg_order_id: Mapped[str | None] = mapped_column(String(255))
    payment_type: Mapped[str | None] = mapped_column(String(50))
    payment_method: Mapped[str | None] = mapped_column(String(100))
    payment_status: Mapped[str | None] = mapped_column(String(50))
    requested_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2))
    approved_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    currency: Mapped[str | None] = mapped_column(String(10), default="KRW")
    requested_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    approved_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    order: Mapped["Order"] = relationship(back_populates="payments")


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    refund_request_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"))
    buyer_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    refund_policy_id: Mapped[int | None] = mapped_column(BigInteger)
    refund_reason: Mapped[str | None] = mapped_column(String(500))
    requested_amount: Mapped[decimal.Decimal | None] = mapped_column(DECIMAL(15, 2))
    approved_amount: Mapped[decimal.Decimal | None] = mapped_column(DECIMAL(15, 2))
    refund_status: Mapped[str] = mapped_column(String(20), default="REQUESTED")
    requested_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    approved_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    order: Mapped["Order"] = relationship()


class RefundPolicy(Base):
    __tablename__ = "refund_policies"

    refund_policy_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    policy_name: Mapped[str] = mapped_column(String(200))
    allowed_days: Mapped[int] = mapped_column(Integer)
    refund_policy_text: Mapped[str | None] = mapped_column(Text)
    effective_from: Mapped[datetime.date | None] = mapped_column(Date)
    effective_to: Mapped[datetime.date | None] = mapped_column(Date)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class Notice(Base):
    __tablename__ = "notices"

    notice_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    author_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    org_id: Mapped[int] = mapped_column(BigInteger)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    is_pinned: Mapped[str] = mapped_column(String(1), default="N")
    image: Mapped[str | None] = mapped_column(String(500))

    author: Mapped["User"] = relationship(foreign_keys=[author_id])


class BuyerInquiry(Base):
    __tablename__ = "buyer_inquiries"

    inquiry_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    org_id: Mapped[int | None] = mapped_column(BigInteger)
    category_code: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    inquiry_status: Mapped[str] = mapped_column(String(30), default="RECEIVED")
    secret_yn: Mapped[str] = mapped_column(String(1), default="N")
    answer_content: Mapped[str | None] = mapped_column(Text)
    answered_by_user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.user_id"))
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    answered_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    answered_by: Mapped["User | None"] = relationship(foreign_keys=[answered_by_user_id])
    files: Mapped[list["InquiryFile"]] = relationship(back_populates="inquiry", cascade="all, delete-orphan")


class InquiryFile(Base):
    __tablename__ = "inquiry_files"

    inquiry_file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    org_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("org_units.org_id"))
    inquiry_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("buyer_inquiries.inquiry_id"))
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("file_assets.file_id"))
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)

    inquiry: Mapped["BuyerInquiry"] = relationship(back_populates="files")
    file: Mapped["FileAsset"] = relationship()
