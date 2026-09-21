import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

BUYER_ROLE_ID = 1
DEFAULT_ORG_ID = 1  # 본사(headquarters) — storefront shoppers are associated with HQ by default


def compute_nickname(email: str | None, user_name: str | None) -> str:
    if email and "@" in email:
        return email.split("@")[0][:5]
    return (user_name or "회원")[:5]


def build_user_out(db: Session, user: models.User) -> schemas.UserOut:
    roles = db.execute(
        select(models.Role.role_code, models.Role.role_name)
        .join(models.UserRole, models.UserRole.role_id == models.Role.role_id)
        .where(models.UserRole.user_id == user.user_id)
        .order_by(models.Role.role_id.desc())
    ).all()
    role_code = roles[0][0] if roles else None
    role_name = roles[0][1] if roles else None

    return schemas.UserOut(
        user_id=user.user_id,
        org_id=user.org_id,
        login_id=user.login_id,
        user_name=user.user_name,
        nickname=compute_nickname(user.email, user.user_name),
        email=user.email,
        phone=user.phone,
        user_status=user.user_status,
        role_code=role_code,
        role_name=role_name,
    )


@router.get("/check-id")
def check_login_id(login_id: str, db: Session = Depends(get_db)):
    target = login_id.strip() if login_id else ""
    if not target:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="아이디를 입력해주세요.")

    existing = db.execute(
        select(models.User).where(models.User.login_id == target)
    ).scalar_one_or_none()

    if existing is not None:
        return {"available": False, "message": "이미 사용 중인 아이디입니다."}
    return {"available": True, "message": "사용 가능한 아이디입니다."}


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    target = email.strip() if email else ""
    if not target:
        return {"available": False, "message": "이메일을 입력해주세요."}

    existing = db.execute(
        select(models.User).where(models.User.email == target)
    ).scalar_one_or_none()

    if existing is not None:
        return {"available": False, "message": "이미 가입된 이메일입니다."}
    return {"available": True, "message": "사용 가능한 이메일입니다."}


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.execute(
        select(models.User).where(
            (models.User.login_id == payload.login_id)
            | (models.User.email == payload.email)
        )
    ).scalar_one_or_none()
    if existing is not None:
        if existing.login_id == payload.login_id:
            detail = "이미 사용 중인 아이디입니다."
        else:
            detail = "이미 가입된 이메일입니다."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

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
    return schemas.TokenResponse(access_token=token, user=build_user_out(db, user))


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
    return schemas.TokenResponse(access_token=token, user=build_user_out(db, user))


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_out(db, current_user)


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
    return build_user_out(db, current_user)


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


@router.delete("/users/{login_id}", status_code=status.HTTP_200_OK)
def delete_user_by_login_id(login_id: str, db: Session = Depends(get_db)):
    PROTECTED_LOGIN_IDS = {"admin01", "seller01", "seller02", "buyer01", "buyer02", "buyer03", "buyer5"}
    if login_id in PROTECTED_LOGIN_IDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="기본 시스템 계정은 삭제할 수 없습니다.",
        )

    user = db.execute(
        select(models.User).where(models.User.login_id == login_id)
    ).scalar_one_or_none()

    if user is None:
        return {"success": True, "message": "해당 계정이 존재하지 않거나 이미 삭제되었습니다."}

    user_id = user.user_id

    # 1. user_roles
    db.execute(delete(models.UserRole).where(models.UserRole.user_id == user_id))

    # 2. user_addresses
    db.execute(delete(models.UserAddress).where(models.UserAddress.user_id == user_id))

    # 3. buyer_inquiries
    db.execute(delete(models.BuyerInquiry).where(models.BuyerInquiry.user_id == user_id))

    # 4. refund_requests
    db.execute(delete(models.RefundRequest).where(models.RefundRequest.buyer_user_id == user_id))

    # 5. orders & related items
    orders = db.execute(
        select(models.Order.order_id).where(models.Order.buyer_user_id == user_id)
    ).scalars().all()
    if orders:
        db.execute(delete(models.Payment).where(models.Payment.order_id.in_(orders)))
        db.execute(delete(models.OrderItem).where(models.OrderItem.order_id.in_(orders)))
        db.execute(delete(models.Order).where(models.Order.order_id.in_(orders)))

    # 6. Delete user
    db.delete(user)
    db.commit()

    return {"success": True, "message": f"계정 '{login_id}'이(가) DB에서 성공적으로 삭제되었습니다."}

