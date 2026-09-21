from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Integer,
    DateTime,
    Text,
    Numeric,
    Enum,
    Date,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# ---------------------------------------------------------
# 담당 A: 조직·회원·문의·회사 정책
# ---------------------------------------------------------

class OrgUnit(Base):
    __tablename__ = "org_units"

    org_id = Column(BigInteger, primary_key=True, autoincrement=True)
    parent_org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    org_code = Column(String(50), unique=True, nullable=False)
    org_name = Column(String(150), nullable=False)
    org_type = Column(Enum('HEADQUARTER', 'BRANCH', 'STORE', 'WAREHOUSE'), nullable=False)
    business_number = Column(String(30), nullable=True)
    representative_name = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    zipcode = Column(String(20), nullable=True)
    address1 = Column(String(300), nullable=True)
    address2 = Column(String(300), nullable=True)
    active_yn = Column(String(1), default='Y')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    login_id = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(30), nullable=True)
    user_status = Column(Enum('ACTIVE', 'INACTIVE', 'SUSPENDED', 'WITHDRAWN'), default='ACTIVE')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_code = Column(String(30), unique=True, nullable=False)
    role_name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    role_id = Column(BigInteger, ForeignKey("roles.role_id"), primary_key=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)


class SellerProfile(Base):
    __tablename__ = "seller_profiles"

    seller_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    business_number = Column(String(30), nullable=True)
    representative_name = Column(String(100), nullable=True)
    settlement_bank = Column(String(100), nullable=True)
    settlement_account = Column(String(100), nullable=True)
    seller_status = Column(String(30), default='ACTIVE')
    created_at = Column(DateTime, default=datetime.utcnow)


class UserAddress(Base):
    __tablename__ = "user_addresses"

    address_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    address_name = Column(String(100), nullable=True)
    receiver_name = Column(String(100), nullable=True)
    receiver_phone = Column(String(30), nullable=True)
    zipcode = Column(String(20), nullable=True)
    address1 = Column(String(300), nullable=True)
    address2 = Column(String(300), nullable=True)
    default_yn = Column(String(1), default='N')
    created_at = Column(DateTime, default=datetime.utcnow)


class CompanyPolicy(Base):
    __tablename__ = "company_policies"

    policy_id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    policy_code = Column(String(50), nullable=False)
    policy_name = Column(String(200), nullable=False)
    policy_version = Column(String(30), nullable=False)
    policy_type = Column(String(50), nullable=True)
    policy_content = Column(Text, nullable=True)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date, nullable=True)
    active_yn = Column(String(1), default='Y')
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------
# 담당 B: 상품·재고·파일·AI 자료
# ---------------------------------------------------------

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(BigInteger, primary_key=True, autoincrement=True)
    parent_category_id = Column(BigInteger, ForeignKey("categories.category_id"), nullable=True)
    category_name = Column(String(100), nullable=False)
    category_level = Column(Integer, default=1)
    display_order = Column(Integer, default=0)
    active_yn = Column(String(1), default='Y')


class Product(Base):
    __tablename__ = "products"

    product_id = Column(BigInteger, primary_key=True, autoincrement=True)
    seller_user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    category_id = Column(BigInteger, ForeignKey("categories.category_id"), nullable=False)
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(200), nullable=False)
    short_description = Column(String(1000), nullable=True)
    description = Column(Text, nullable=True)
    regular_price = Column(Numeric(15, 2), nullable=False)
    sale_price = Column(Numeric(15, 2), nullable=False)
    product_status = Column(Enum('READY', 'SALE', 'SOLD_OUT', 'STOPPED', 'DELETED'), default='READY')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProductVariant(Base):
    __tablename__ = "product_variants"

    variant_id = Column(BigInteger, primary_key=True, autoincrement=True)
    product_id = Column(BigInteger, ForeignKey("products.product_id"), nullable=False)
    sku_code = Column(String(100), unique=True, nullable=False)
    option_name1 = Column(String(100), nullable=True)
    option_value1 = Column(String(100), nullable=True)
    option_name2 = Column(String(100), nullable=True)
    option_value2 = Column(String(100), nullable=True)
    additional_price = Column(Numeric(15, 2), default=0.00)
    active_yn = Column(String(1), default='Y')


class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=False)
    variant_id = Column(BigInteger, ForeignKey("product_variants.variant_id"), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    safety_stock = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FileAsset(Base):
    __tablename__ = "file_assets"

    file_id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    file_type = Column(Enum('IMAGE', 'PDF', 'DOCUMENT', 'VIDEO', 'AUDIO', 'ETC'), nullable=False)
    storage_type = Column(Enum('LOCAL', 'S3', 'GCS', 'NAS', 'URL'), nullable=False)
    original_file_name = Column(String(500), nullable=True)
    stored_file_name = Column(String(500), nullable=True)
    file_extension = Column(String(30), nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, default=0)
    storage_path = Column(String(1000), nullable=True)
    public_url = Column(String(2000), nullable=True)
    thumbnail_url = Column(String(2000), nullable=True)
    checksum_sha256 = Column(String(64), nullable=True)
    active_yn = Column(String(1), default='Y')
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------
# 담당 C: 주문·결제·환불
# ---------------------------------------------------------

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_no = Column(String(64), unique=True, nullable=False)
    buyer_user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=False)
    order_status = Column(Enum(
        'ORDERED', 'PAYMENT_PENDING', 'PAID', 'PREPARING', 
        'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'
    ), default='ORDERED')
    product_amount = Column(Numeric(15, 2), nullable=False)
    discount_amount = Column(Numeric(15, 2), default=0.00)
    shipping_amount = Column(Numeric(15, 2), default=0.00)
    total_amount = Column(Numeric(15, 2), nullable=False)
    receiver_name = Column(String(100), nullable=True)
    receiver_phone = Column(String(30), nullable=True)
    zipcode = Column(String(20), nullable=True)
    shipping_address1 = Column(String(300), nullable=True)
    shipping_address2 = Column(String(300), nullable=True)
    ordered_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_id = Column(BigInteger, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(BigInteger, ForeignKey("products.product_id"), nullable=False)
    variant_id = Column(BigInteger, ForeignKey("product_variants.variant_id"), nullable=True)
    product_name_snapshot = Column(String(200), nullable=False)
    sku_snapshot = Column(String(100), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(15, 2), nullable=False)
    item_amount = Column(Numeric(15, 2), nullable=False)
    item_status = Column(String(30), default='ORDERED')


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_id = Column(BigInteger, ForeignKey("orders.order_id"), nullable=False)
    pg_provider = Column(String(50), nullable=False)
    payment_key = Column(String(255), unique=True, nullable=True)
    pg_order_id = Column(String(255), nullable=True)
    customer_key = Column(String(255), nullable=True)
    payment_type = Column(String(50), nullable=True)
    payment_method = Column(String(100), nullable=True)
    payment_status = Column(String(50), nullable=True)
    requested_amount = Column(Numeric(15, 2), nullable=False)
    approved_amount = Column(Numeric(15, 2), default=0.00)
    cancelled_amount = Column(Numeric(15, 2), default=0.00)
    balance_amount = Column(Numeric(15, 2), default=0.00)
    currency = Column(String(10), default='KRW')
    receipt_url = Column(String(2000), nullable=True)
    requested_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)