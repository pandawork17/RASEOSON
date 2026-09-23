"""
[addresses.py - 회원 배송지 관리 라우터 (CRUD)]

■ 역할:
  - 로그인한 회원의 배송지 목록 조회, 추가, 수정, 삭제, 기본배송지 지정을 처리합니다.
  - 회원이 배송지를 등록할 때 첫 번째 배송지이거나 default_yn='Y'인 경우 기존 기본 배송지를 해제합니다.
  - 기본 배송지를 삭제하거나 기본 배송지가 없을 경우 남아있는 배송지 중 가장 최근 배송지를 기본 배송지로 자동 승격합니다.
"""

import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


@router.get("", response_model=List[schemas.AddressOut], summary="배송지 목록 조회")
def list_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    현재 로그인한 회원의 배송지 목록 조회 (기본 배송지 우선 정렬)
    """
    rows = db.execute(
        select(models.UserAddress)
        .where(models.UserAddress.user_id == current_user.user_id)
        .order_by(models.UserAddress.default_yn.desc(), models.UserAddress.address_id.desc())
    ).scalars().all()

    # 등록된 배송지가 있으나 기본배송지가 하나도 없을 경우 최상단 배송지를 기본배송지로 자동 지정
    if rows and not any(r.default_yn == "Y" for r in rows):
        rows[0].default_yn = "Y"
        db.commit()
        db.refresh(rows[0])

    return [schemas.AddressOut.model_validate(row) for row in rows]


@router.post("", response_model=schemas.AddressOut, status_code=status.HTTP_201_CREATED, summary="배송지 추가")
def create_address(
    payload: schemas.AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    신규 배송지 등록
    - 첫 번째 배송지이거나 기본 배송지로 선택 시 이전 기본 배송지를 N으로 변경
    """
    existing_addrs = db.execute(
        select(models.UserAddress).where(models.UserAddress.user_id == current_user.user_id)
    ).scalars().all()

    is_first = (len(existing_addrs) == 0)
    if is_first or payload.default_yn == "Y":
        db.query(models.UserAddress).filter(
            models.UserAddress.user_id == current_user.user_id
        ).update({"default_yn": "N"})
        payload.default_yn = "Y"

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


@router.put("/{address_id}", response_model=schemas.AddressOut, summary="배송지 수정")
def update_address(
    address_id: int,
    payload: schemas.AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    기존 배송지 정보 수정
    """
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


@router.patch("/{address_id}/default", response_model=schemas.AddressOut, summary="기본 배송지로 설정")
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    지정한 배송지를 기본 배송지로 승격
    """
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


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT, summary="배송지 삭제")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    배송지 삭제 (기본 배송지 삭제 시 남은 배송지 중 첫 번째를 기본으로 지정)
    """
    address = db.get(models.UserAddress, address_id)
    if address is None or address.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="배송지를 찾을 수 없습니다.")

    db.delete(address)
    db.flush()

    remaining = db.execute(
        select(models.UserAddress)
        .where(models.UserAddress.user_id == current_user.user_id)
        .order_by(models.UserAddress.default_yn.desc(), models.UserAddress.address_id.desc())
    ).scalars().all()

    if remaining and not any(a.default_yn == "Y" for a in remaining):
        remaining[0].default_yn = "Y"

    db.commit()

