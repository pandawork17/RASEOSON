from sqlalchemy import Column, BigInteger, String, Enum, DateTime, Text, Char, Date, ForeignKey, Integer, Table, func
from sqlalchemy.orm import relationship
from app.database import Base

class OrgUnit(Base):
    __tablename__ = "org_units"
    org_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    parent_org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    org_code = Column(String(50), unique=True, nullable=False)
    org_name = Column(String(150), nullable=False)
    org_type = Column(Enum('HEADQUARTER', 'BRANCH', 'STORE', 'WAREHOUSE'), nullable=False)
    business_number = Column(String(30))
    representative_name = Column(String(100))
    phone = Column(String(30))
    email = Column(String(255))
    zipcode = Column(String(20))
    address1 = Column(String(300))
    address2 = Column(String(300))
    active_yn = Column(Char(1), default='Y')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="org")

class User(Base):
    __tablename__ = "users"
    user_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    login_id = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(30))
    user_status = Column(Enum('ACTIVE', 'INACTIVE', 'SUSPENDED', 'WITHDRAWN'), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    org = relationship("OrgUnit", back_populates="users")
    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)
    addresses = relationship("UserAddress", back_populates="user")
    inquiries = relationship("BuyerInquiry", back_populates="user", foreign_keys="BuyerInquiry.user_id")

class Role(Base):
    __tablename__ = "roles"
    role_id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_code = Column(String(30), unique=True, nullable=False)
    role_name = Column(String(100), nullable=False)
    description = Column(String(500))

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    role_id = Column(BigInteger, ForeignKey("roles.role_id"), primary_key=True)
    assigned_at = Column(DateTime, server_default=func.now())

class SellerProfile(Base):
    __tablename__ = "seller_profiles"
    seller_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    business_number = Column(String(30))
    representative_name = Column(String(100))
    settlement_bank = Column(String(100))
    settlement_account = Column(String(100))
    seller_status = Column(String(30), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="seller_profile")

class UserAddress(Base):
    __tablename__ = "user_addresses"
    address_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    address_name = Column(String(100))
    receiver_name = Column(String(100))
    receiver_phone = Column(String(30))
    zipcode = Column(String(20))
    address1 = Column(String(300))
    address2 = Column(String(300))
    default_yn = Column(Char(1), default='N')
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="addresses")

class BuyerInquiry(Base):
    __tablename__ = "buyer_inquiries"
    inquiry_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    category_code = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    inquiry_status = Column(String(30), nullable=False)
    secret_yn = Column(String(1), nullable=False)
    answer_content = Column(Text)
    answered_by_user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    answered_at = Column(DateTime)

    user = relationship("User", back_populates="inquiries", foreign_keys=[user_id])

class CompanyPolicy(Base):
    __tablename__ = "company_policies"
    policy_id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey("org_units.org_id"), nullable=True)
    policy_code = Column(String(50), nullable=False)
    policy_name = Column(String(200), nullable=False)
    policy_version = Column(String(30), nullable=False)
    policy_type = Column(String(50))
    policy_content = Column(Text)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date)
    active_yn = Column(Char(1), default='Y')
    created_at = Column(DateTime, server_default=func.now())