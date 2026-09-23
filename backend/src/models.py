"""
[models.py - SHOPDB3JO 통합 데이터베이스 ORM 모델 정의]

■ 역할:
  - MySQL `shopdb3jo` 스키마의 모든 테이블을 SQLAlchemy 2.0 선언적 매핑(`Mapped`, `mapped_column`)으로 정의합니다.
  - an(고객몰), park(지사관리), song(본사관리) 3개 프로젝트에서 참조하던 모델들을 하나로 통합하였습니다.

■ 담당 영역별 테이블 구성:
  - [담당 A: 조직·회원·문의·정책]
    - OrgUnit (조직/지점)
    - User (사용자 계정)
    - Role / UserRole (역할 및 권한)
    - SellerProfile (판매자 입점 정보)
    - UserAddress (회원 배송지)
    - CompanyPolicy (회사 운영 정책)
    - BuyerInquiry / InquiryFile (고객 1:1 문의 및 첨부파일)
    - Notice (공지사항)
  - [담당 B: 카테고리·상품·재고·파일]
    - Category (상품 카테고리 계층)
    - Product (상품 마스터)
    - ProductVariant (상품 옵션/단품)
    - ProductImage (상품 갤러리 이미지 연결)
    - Inventory (지사/창고별 옵션 재고)
    - FileAsset (업로드 파일 메타데이터)
  - [담당 C: 주문·결제·환불]
    - Order / OrderItem (고객 주문 마스터 및 품목)
    - Payment (결제 트랜잭션 정보)
    - RefundPolicy / RefundRequest (환불 규정 및 환불 신청 내역)
"""

import datetime
import decimal
from typing import Optional, List

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


# =========================================================
# 1. 조직 및 계층 모델 (Headquarter, Branch 등)
# =========================================================
class OrgUnit(Base):
    """
    운영 조직 단위 (본사, 지사, 매장, 창고)
    - parent_org_id로 상위 본사와의 계층 관계를 표현합니다.
    """
    __tablename__ = "org_units"

    org_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    parent_org_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    org_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    org_name: Mapped[str] = mapped_column(String(150), nullable=False)
    org_type: Mapped[str] = mapped_column(String(20), nullable=False)  # HEADQUARTER, BRANCH, STORE, WAREHOUSE
    business_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    representative_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    zipcode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address1: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    address2: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # 역방향 관계
    users: Mapped[List["User"]] = relationship(back_populates="org")


# =========================================================
# 2. 회원 및 권한 모델
# =========================================================
class Role(Base):
    """권한/역할 마스터 (ROLE_ADMIN, ROLE_SELLER, ROLE_BUYER 등)"""
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    role_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    role_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class User(Base):
    """사용자 계정 마스터 (관리자, 지사담당자, 판매자, 일반 구매자)"""
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    login_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    user_status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # 관계 설정
    org: Mapped[Optional["OrgUnit"]] = relationship(back_populates="users")
    addresses: Mapped[List["UserAddress"]] = relationship(back_populates="user")
    seller_profile: Mapped[Optional["SellerProfile"]] = relationship(back_populates="user", uselist=False)


class UserRole(Base):
    """회원과 역할 다대다 매핑 테이블"""
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.role_id"), primary_key=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    assigned_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class SellerProfile(Base):
    """판매자 추가 정보 테이블"""
    __tablename__ = "seller_profiles"

    seller_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), unique=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    business_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    representative_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    settlement_bank: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    settlement_account: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    seller_status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="seller_profile")


class UserAddress(Base):
    """회원 배송지 목록"""
    __tablename__ = "user_addresses"

    address_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    address_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    receiver_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    receiver_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    zipcode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address1: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    address2: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    default_yn: Mapped[str] = mapped_column(String(1), default="N")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="addresses")


# =========================================================
# 3. 상품 및 카테고리, 재고 모델
# =========================================================
class Category(Base):
    """상품 카테고리 계층"""
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    parent_category_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("categories.category_id"), nullable=True
    )
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    category_level: Mapped[Optional[int]] = mapped_column(Integer, default=1)
    display_order: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


class FileAsset(Base):
    """업로드된 미디어/파일 메타데이터"""
    __tablename__ = "file_assets"

    file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    file_type: Mapped[str] = mapped_column(String(20), default="IMAGE")
    storage_type: Mapped[str] = mapped_column(String(20), default="LOCAL")
    original_file_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    stored_file_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_extension: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(BigInteger, default=0)
    storage_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    public_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class Product(Base):
    """상품 마스터 테이블"""
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    seller_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("categories.category_id"), nullable=False)
    product_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    regular_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    sale_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    product_status: Mapped[str] = mapped_column(String(20), default="SALE")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    category: Mapped["Category"] = relationship()
    variants: Mapped[List["ProductVariant"]] = relationship(
        back_populates="product", order_by="ProductVariant.variant_id"
    )
    images: Mapped[List["ProductImage"]] = relationship(
        back_populates="product", order_by="ProductImage.display_order"
    )


class ProductVariant(Base):
    """상품 옵션/단품 (SKU 단위)"""
    __tablename__ = "product_variants"

    variant_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"), nullable=False)
    sku_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    option_name1: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    option_value1: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    option_name2: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    option_value2: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    additional_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")

    product: Mapped["Product"] = relationship(back_populates="variants")
    inventories: Mapped[List["Inventory"]] = relationship(back_populates="variant")


class ProductImage(Base):
    """상품과 갤러리 이미지 파일 간 매핑 테이블"""
    __tablename__ = "product_images"

    product_image_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"), nullable=False)
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("file_assets.file_id"), nullable=False)
    image_type: Mapped[str] = mapped_column(String(20), default="DETAIL")
    alt_text: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    display_order: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")

    product: Mapped["Product"] = relationship(back_populates="images")
    file: Mapped["FileAsset"] = relationship()


class Inventory(Base):
    """지사/조직별 옵션 단품의 재고 현황"""
    __tablename__ = "inventories"

    inventory_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("org_units.org_id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("product_variants.variant_id"), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0)
    safety_stock: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    variant: Mapped["ProductVariant"] = relationship(back_populates="inventories")
    org: Mapped["OrgUnit"] = relationship()


# =========================================================
# 4. 주문, 결제, 환불 모델
# =========================================================
class Order(Base):
    """고객 주문 마스터"""
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    buyer_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    org_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    order_status: Mapped[str] = mapped_column(String(30), default="ORDERED")
    process_status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    product_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    discount_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    shipping_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    total_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    receiver_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    receiver_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    zipcode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    shipping_address1: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    shipping_address2: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    ordered_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    buyer: Mapped["User"] = relationship()
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", order_by="OrderItem.order_item_id")
    payments: Mapped[List["Payment"]] = relationship(back_populates="order")


class OrderItem(Base):
    """주문 상품 품목 (주문 시점 스냅샷 보관)"""
    __tablename__ = "order_items"

    order_item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"), nullable=False)
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.product_id"), nullable=False)
    variant_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("product_variants.variant_id"), nullable=True)
    product_name_snapshot: Mapped[str] = mapped_column(String(200), nullable=False)
    sku_snapshot: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    item_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    item_status: Mapped[Optional[str]] = mapped_column(String(30), default="ORDERED")

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
    variant: Mapped[Optional["ProductVariant"]] = relationship()


class Payment(Base):
    """결제 거래 내역"""
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"), nullable=False)
    pg_provider: Mapped[str] = mapped_column(String(50), default="TEST_PG")
    payment_key: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    pg_order_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_status: Mapped[Optional[str]] = mapped_column(String(50), default="COMPLETED")
    requested_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), nullable=False)
    approved_amount: Mapped[decimal.Decimal] = mapped_column(DECIMAL(15, 2), default=0)
    currency: Mapped[Optional[str]] = mapped_column(String(10), default="KRW")
    requested_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    approved_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    order: Mapped["Order"] = relationship(back_populates="payments")


class RefundRequest(Base):
    """고객의 주문 환불/반품 요청"""
    __tablename__ = "refund_requests"

    refund_request_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.order_id"), nullable=False)
    buyer_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    refund_policy_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    refund_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    requested_amount: Mapped[Optional[decimal.Decimal]] = mapped_column(DECIMAL(15, 2), nullable=True)
    approved_amount: Mapped[Optional[decimal.Decimal]] = mapped_column(DECIMAL(15, 2), nullable=True)
    refund_status: Mapped[str] = mapped_column(String(20), default="REQUESTED")
    requested_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    approved_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    order: Mapped["Order"] = relationship()
    buyer: Mapped["User"] = relationship()


class RefundPolicy(Base):
    """회사 환불 규정 마스터"""
    __tablename__ = "refund_policies"

    refund_policy_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    policy_name: Mapped[str] = mapped_column(String(200), nullable=False)
    allowed_days: Mapped[int] = mapped_column(Integer, default=7)
    refund_policy_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effective_from: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    effective_to: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")


# =========================================================
# 5. 공지사항, 1:1 고객 문의, 운영 정책 모델
# =========================================================
class Notice(Base):
    """본사/지사 공지사항"""
    __tablename__ = "notices"

    notice_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    org_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    is_pinned: Mapped[str] = mapped_column(String(1), default="N")
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    author: Mapped["User"] = relationship(foreign_keys=[author_id])


class BuyerInquiry(Base):
    """고객 1:1 Q&A 문의"""
    __tablename__ = "buyer_inquiries"

    inquiry_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    category_code: Mapped[str] = mapped_column(String(50), default="GENERAL")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    inquiry_status: Mapped[str] = mapped_column(String(30), default="RECEIVED")  # RECEIVED, ANSWERED
    secret_yn: Mapped[str] = mapped_column(String(1), default="N")
    answer_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answered_by_user_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=True)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    answered_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    answered_by: Mapped[Optional["User"]] = relationship(foreign_keys=[answered_by_user_id])
    files: Mapped[List["InquiryFile"]] = relationship(back_populates="inquiry", cascade="all, delete-orphan")


class InquiryFile(Base):
    """고객 문의 첨부 이미지 파일 매핑"""
    __tablename__ = "inquiry_files"

    inquiry_file_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    inquiry_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("buyer_inquiries.inquiry_id"), nullable=False)
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("file_assets.file_id"), nullable=False)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    inquiry: Mapped["BuyerInquiry"] = relationship(back_populates="files")
    file: Mapped["FileAsset"] = relationship()


class CompanyPolicy(Base):
    """회사 운영 및 이용 약관 정책"""
    __tablename__ = "company_policies"

    policy_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    policy_code: Mapped[str] = mapped_column(String(50), nullable=False)
    policy_name: Mapped[str] = mapped_column(String(200), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(30), default="1.0")
    policy_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    policy_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effective_from: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    active_yn: Mapped[str] = mapped_column(String(1), default="Y")
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class BranchNotification(Base):
    """지사 관리자 알림 (park 알림종 연동)"""
    __tablename__ = "branch_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    org_id: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_tab: Mapped[str] = mapped_column(String(50), nullable=False)
    is_read: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, default=datetime.datetime.utcnow)

