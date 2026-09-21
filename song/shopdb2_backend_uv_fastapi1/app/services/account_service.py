from __future__ import annotations

from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models import OrgUnit, Role, User, UserAddress, UserRole
from app.schemas.account import (
    BuyerAddressCreateRequest,
    BuyerAddressResponse,
    BuyerAddressUpdateRequest,
    BuyerProfileResponse,
    BuyerProfileUpdateRequest,
    BuyerSignupRequest,
)
from app.schemas.common import OrgSummary, UserSummary
from app.services.auth_service import get_user_summary


def _get_buyer_role_id(db: Session) -> int:
    role = db.scalar(select(Role).where(Role.role_code == "BUYER"))
    if role is None:
        raise HTTPException(status_code=500, detail="BUYER role is not configured.")
    return role.role_id


def create_buyer_account(db: Session, payload: BuyerSignupRequest) -> UserSummary:
    existing_user = db.scalar(
        select(func.count())
        .select_from(User)
        .where((User.login_id == payload.login_id) | (User.email == payload.email))
    )
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login ID or email already exists.")

    buyer_role_id = _get_buyer_role_id(db)
    default_org_id = db.scalar(
        select(OrgUnit.org_id).where(OrgUnit.org_type.in_(("HEADQUARTER", "BRANCH"))).order_by(OrgUnit.org_id.asc())
    )

    user = User(
        org_id=default_org_id,
        login_id=payload.login_id,
        password_hash=get_password_hash(payload.password),
        user_name=payload.user_name,
        email=payload.email,
        phone=payload.phone,
        user_status="ACTIVE",
        created_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(user)
    db.flush()

    db.add(UserRole(user_id=user.user_id, role_id=buyer_role_id))
    db.add(
        UserAddress(
            user_id=user.user_id,
            address_name=payload.address.address_name,
            receiver_name=payload.address.receiver_name,
            receiver_phone=payload.address.receiver_phone,
            zipcode=payload.address.zipcode,
            address1=payload.address.address1,
            address2=payload.address.address2,
            default_yn=payload.address.default_yn,
        )
    )
    db.commit()
    return get_user_summary(db, user.user_id)  # type: ignore[return-value]


def list_user_addresses(db: Session, user_id: int) -> list[BuyerAddressResponse]:
    rows = db.scalars(select(UserAddress).where(UserAddress.user_id == user_id).order_by(UserAddress.address_id.asc())).all()
    return [
        BuyerAddressResponse(
            address_id=row.address_id,
            address_name=row.address_name or "Address",
            receiver_name=row.receiver_name or "",
            receiver_phone=row.receiver_phone or "",
            zipcode=row.zipcode,
            address1=row.address1 or "",
            address2=row.address2,
            default_yn=row.default_yn,
            created_at=None,
        )
        for row in rows
    ]


def create_user_address(db: Session, user_id: int, payload: BuyerAddressCreateRequest) -> BuyerAddressResponse:
    if payload.default_yn == "Y":
        for row in db.scalars(select(UserAddress).where(UserAddress.user_id == user_id)).all():
            row.default_yn = "N"

    address = UserAddress(
        user_id=user_id,
        address_name=payload.address_name,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        zipcode=payload.zipcode,
        address1=payload.address1,
        address2=payload.address2,
        default_yn=payload.default_yn,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return BuyerAddressResponse(
        address_id=address.address_id,
        address_name=address.address_name or "Address",
        receiver_name=address.receiver_name or "",
        receiver_phone=address.receiver_phone or "",
        zipcode=address.zipcode,
        address1=address.address1 or "",
        address2=address.address2,
        default_yn=address.default_yn,
        created_at=None,
    )


def update_buyer_profile(db: Session, user_id: int, payload: BuyerProfileUpdateRequest) -> BuyerProfileResponse:
    user = db.scalar(select(User).where(User.user_id == user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    user.user_name = payload.user_name
    user.phone = payload.phone
    db.commit()

    summary = get_user_summary(db, user_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return get_buyer_profile(db, summary)


def update_user_address(
    db: Session,
    user_id: int,
    address_id: int,
    payload: BuyerAddressUpdateRequest,
) -> BuyerAddressResponse:
    address = db.scalar(
        select(UserAddress).where(UserAddress.address_id == address_id, UserAddress.user_id == user_id)
    )
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found.")

    if payload.default_yn == "Y":
        for row in db.scalars(select(UserAddress).where(UserAddress.user_id == user_id)).all():
            row.default_yn = "N"

    address.address_name = payload.address_name
    address.receiver_name = payload.receiver_name
    address.receiver_phone = payload.receiver_phone
    address.zipcode = payload.zipcode
    address.address1 = payload.address1
    address.address2 = payload.address2
    address.default_yn = payload.default_yn
    db.commit()
    db.refresh(address)
    return BuyerAddressResponse(
        address_id=address.address_id,
        address_name=address.address_name or "Address",
        receiver_name=address.receiver_name or "",
        receiver_phone=address.receiver_phone or "",
        zipcode=address.zipcode,
        address1=address.address1 or "",
        address2=address.address2,
        default_yn=address.default_yn,
        created_at=None,
    )


def delete_user_address(db: Session, user_id: int, address_id: int) -> dict[str, int]:
    address = db.scalar(
        select(UserAddress).where(UserAddress.address_id == address_id, UserAddress.user_id == user_id)
    )
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found.")

    db.delete(address)
    db.commit()
    return {"deleted_address_id": address_id}


def get_buyer_profile(db: Session, user: UserSummary) -> BuyerProfileResponse:
    return BuyerProfileResponse(user=user, addresses=list_user_addresses(db, user.user_id))
