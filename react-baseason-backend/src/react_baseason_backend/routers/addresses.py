import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


@router.get("", response_model=list[schemas.AddressOut])
def list_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.execute(
        select(models.UserAddress)
        .where(models.UserAddress.user_id == current_user.user_id)
        .order_by(models.UserAddress.default_yn.desc(), models.UserAddress.address_id.desc())
    ).scalars().all()
    return [schemas.AddressOut.model_validate(row) for row in rows]


@router.post("", response_model=schemas.AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: schemas.AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.default_yn == "Y":
        db.query(models.UserAddress).filter(
            models.UserAddress.user_id == current_user.user_id
        ).update({"default_yn": "N"})

    address = models.UserAddress(
        org_id=current_user.org_id,
        user_id=current_user.user_id,
        address_name=payload.address_name,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        zipcode=payload.zipcode,
        address1=payload.address1,
        address2=payload.address2,
        default_yn=payload.default_yn,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return schemas.AddressOut.model_validate(address)


@router.put("/{address_id}", response_model=schemas.AddressOut)
def update_address(
    address_id: int,
    payload: schemas.AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    address = db.get(models.UserAddress, address_id)
    if address is None or address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="배송지를 찾을 수 없습니다.")

    if payload.default_yn == "Y":
        db.query(models.UserAddress).filter(
            models.UserAddress.user_id == current_user.user_id,
            models.UserAddress.address_id != address_id,
        ).update({"default_yn": "N"})

    address.address_name = payload.address_name
    address.receiver_name = payload.receiver_name
    address.receiver_phone = payload.receiver_phone
    address.zipcode = payload.zipcode
    address.address1 = payload.address1
    address.address2 = payload.address2
    address.default_yn = payload.default_yn

    db.commit()
    db.refresh(address)
    return schemas.AddressOut.model_validate(address)


@router.patch("/{address_id}/default", response_model=schemas.AddressOut)
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    address = db.get(models.UserAddress, address_id)
    if address is None or address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="배송지를 찾을 수 없습니다.")

    db.query(models.UserAddress).filter(
        models.UserAddress.user_id == current_user.user_id
    ).update({"default_yn": "N"})

    address.default_yn = "Y"
    db.commit()
    db.refresh(address)
    return schemas.AddressOut.model_validate(address)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    address = db.get(models.UserAddress, address_id)
    if address is None or address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="배송지를 찾을 수 없습니다.")

    db.delete(address)
    db.commit()
