import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

BUYER_ROLE_ID = 1
DEFAULT_ORG_ID = 1  # 본사(headquarters) — storefront shoppers are associated with HQ by default


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.execute(
        select(models.User).where(
            (models.User.login_id == payload.login_id) | (models.User.email == payload.email)
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 아이디 또는 이메일입니다.")

    now = datetime.datetime.utcnow()
    user = models.User(
        org_id=DEFAULT_ORG_ID,
        login_id=payload.login_id,
        password_hash=hash_password(payload.password),
        user_name=payload.user_name,
        email=payload.email,
        phone=payload.phone,
        user_status="ACTIVE",
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.flush()

    db.add(models.UserRole(user_id=user.user_id, role_id=BUYER_ROLE_ID, org_id=DEFAULT_ORG_ID))
    db.commit()
    db.refresh(user)

    token = create_access_token(user.user_id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(models.User).where(models.User.login_id == payload.login_id)
    ).scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    if user.user_status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="사용이 중지된 계정입니다.")

    token = create_access_token(user.user_id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserOut.model_validate(current_user)


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UpdateMeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.email and payload.email != current_user.email:
        exists = db.execute(
            select(models.User).where(models.User.email == payload.email, models.User.user_id != current_user.user_id)
        ).scalar_one_or_none()
        if exists is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 이메일입니다.")
        current_user.email = payload.email

    if payload.user_name:
        current_user.user_name = payload.user_name
    if payload.phone is not None:
        current_user.phone = payload.phone

    current_user.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return schemas.UserOut.model_validate(current_user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="현재 비밀번호가 올바르지 않습니다.")

    current_user.password_hash = hash_password(payload.new_password)
    current_user.updated_at = datetime.datetime.utcnow()
    db.commit()
