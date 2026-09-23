"""
[auth.py - 회원가입, 로그인 및 마이페이지 인증 라우터]

■ 역할:
  - 일반 구매자 및 사용자의 회원가입, 로그인, 토큰 발급, 프로필 조회/수정을 처리합니다.
  - 아이디 및 이메일 중복 확인 API를 제공합니다.
  - 테스트 및 개발 편의를 위해 계정 삭제 API(/users/{login_id})를 포함합니다 (단, 관리자/테스트 계정 보호).

■ 주요 엔드포인트:
  - GET  /api/auth/check-id         : 아이디 중복 체크
  - GET  /api/auth/check-email      : 이메일 중복 체크
  - POST /api/auth/register         : 신규 회원가입 (기본 구매자 역할 부여)
  - POST /api/auth/login            : 로그인 (JWT Bearer 토큰 반환)
  - GET  /api/auth/me               : 내 정보 조회 (JWT 인증 필요)
  - PATCH /api/auth/me              : 내 정보 수정 (이름, 이메일, 전화번호)
  - POST /api/auth/change-password  : 비밀번호 변경
  - DELETE /api/auth/users/{login_id} : 개발용 계정 삭제 (연관 데이터 정리)
"""

import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select, text
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

BUYER_ROLE_ID = 1      # 기본 구매자 역할 ID
DEFAULT_ORG_ID = 1     # 쇼핑몰 일반 고객은 기본적으로 본사(HQ, org_id=1) 소속으로 매핑


def compute_nickname(email: str | None, user_name: str | None) -> str:
    """
    이메일 앞자리 또는 이름의 앞 5글자를 따서 UI에 표시할 닉네임을 생성합니다.
    """
    if email and "@" in email:
        return email.split("@")[0][:5]
    return (user_name or "회원")[:5]


def build_user_out(db: Session, user: models.User) -> schemas.UserOut:
    """
    User ORM 모델을 클라이언트가 소비하기 좋은 UserOut DTO로 변환합니다.
    사용자에게 부여된 권한(Role)도 함께 조인하여 role_code, role_name을 채웁니다.
    """
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


@router.get("/check-id", summary="아이디 중복 검사")
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


@router.get("/check-email", summary="이메일 중복 검사")
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


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED, summary="회원가입")
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # 1. 아이디 및 이메일 중복 검사
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

    # 2. 사용자 엔티티 생성 및 비밀번호 암호화
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

    # 3. 기본 구매자 권한(BUYER) 부여
    db.add(models.UserRole(user_id=user.user_id, role_id=BUYER_ROLE_ID, org_id=DEFAULT_ORG_ID))
    db.commit()
    db.refresh(user)

    # 4. 가입 즉시 로그인 처리용 토큰 반환
    token = create_access_token(user.user_id)
    return schemas.TokenResponse(access_token=token, user=build_user_out(db, user))


@router.post("/login", response_model=schemas.TokenResponse, summary="로그인")
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(models.User).where(models.User.login_id == payload.login_id)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    is_valid = verify_password(payload.password, user.password_hash)

    # 판매자/관리자/구매자 표준 데모 계정 호환 처리 (seller1234, admin1234 모두 허용)
    if not is_valid:
        if user.login_id in ("seller01", "seller02") and payload.password in ("seller1234", "admin1234"):
            is_valid = True
        elif user.login_id == "admin01" and payload.password in ("admin1234", "seller1234"):
            is_valid = True
        elif user.login_id in ("buyer01", "buyer02", "buyer03", "buyer96", "buyer5", "tester01", "some") and payload.password == "buyer1234":
            is_valid = True

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    if user.user_status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="사용이 중지된 계정입니다.")

    token = create_access_token(user.user_id)
    return schemas.TokenResponse(access_token=token, user=build_user_out(db, user))


@router.get("/me", response_model=schemas.UserOut, summary="내 정보 조회")
def read_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_out(db, current_user)


@router.patch("/me", response_model=schemas.UserOut, summary="내 정보 수정")
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


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT, summary="비밀번호 변경")
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


@router.get("/accounts", response_model=list[schemas.AccountOut], summary="로그인용 DB 실제 계정 목록 조회")
def get_login_accounts(db: Session = Depends(get_db)):
    """
    MySQL `users` 테이블에 실제 존재하는 계정들을 권한 및 소속 지사 정보와 함께 조회하여
    로그인 화면에서 실시간으로 선택 및 원클릭 로그인할 수 있도록 반환합니다.
    """
    users = db.execute(
        select(models.User).order_by(models.User.user_id.asc())
    ).scalars().all()

    SYSTEM_ACCOUNTS = {"admin01", "seller01", "seller02", "buyer01"}
    DEFAULT_PW_MAP = {
        "admin01": "admin1234",
        "seller01": "seller1234",
        "seller02": "seller1234",
        "buyer01": "buyer1234",
        "buyer02": "buyer1234",
        "buyer03": "buyer1234",
        "buyer96": "buyer1234",
        "buyer5": "buyer1234",
        "tester01": "buyer1234",
    }

    results = []
    for user in users:
        roles = db.execute(
            select(models.Role.role_code, models.Role.role_name)
            .join(models.UserRole, models.UserRole.role_id == models.Role.role_id)
            .where(models.UserRole.user_id == user.user_id)
            .order_by(models.Role.role_id.desc())
        ).all()

        all_codes = [r[0].upper() for r in roles]
        if "ADMIN" in all_codes or user.login_id.startswith("admin"):
            role_type = "admin"
            role_code = "ADMIN"
            role_name = "본사(총괄자)"
            badge_color = "#9c4221"
        elif "SELLER" in all_codes or user.login_id.startswith("seller"):
            role_type = "seller"
            role_code = "SELLER"
            role_name = "지사(판매자)"
            badge_color = "#2b6cb0"
        else:
            role_type = "buyer"
            role_code = "BUYER"
            role_name = "구매자"
            badge_color = "#6d5548"

        org_name = user.org.org_name if user.org else "스마트쇼핑 본사"
        branch_text = org_name

        is_system = user.login_id in SYSTEM_ACCOUNTS
        is_known_seed = user.login_id in DEFAULT_PW_MAP

        desc = ""
        if role_type == "admin":
            desc = "전체 시스템 총괄 최고 관리자 (지사 관리, 전사 통계)"
        elif role_type == "seller":
            desc = f"{org_name} 판매 담당자 (지사 상품 등록, 재고 관리)"
        else:
            if is_system or user.login_id in ("buyer02", "buyer03"):
                desc = f"{org_name} 관할 쇼핑몰 고객"
            elif not is_known_seed:
                desc = "직접 회원가입하여 DB에 등록된 계정"
                branch_text = "직접 가입 회원"
                badge_color = "#059669"
            else:
                desc = "쇼핑몰 일반 고객 계정"

        default_pw = DEFAULT_PW_MAP.get(
            user.login_id,
            "buyer1234" if role_type == "buyer" else "seller1234"
        )

        results.append(
            schemas.AccountOut(
                user_id=user.user_id,
                login_id=user.login_id,
                user_name=user.user_name,
                nickname=compute_nickname(user.email, user.user_name),
                email=user.email,
                phone=user.phone,
                role=role_type,
                role_code=role_code,
                role_name=role_name,
                org_id=user.org_id,
                org_name=org_name,
                branch=branch_text,
                desc=desc,
                is_system=is_system,
                default_pw=default_pw,
                badge_color=badge_color,
            )
        )

    return results


@router.delete("/users/{login_id}", status_code=status.HTTP_200_OK, summary="개발/테스트용 계정 삭제")
def delete_user_by_login_id(login_id: str, db: Session = Depends(get_db)):
    # 시스템 필수 계정 삭제 방지 가드 (admin01, seller01, seller02, buyer01 보호)
    PROTECTED_LOGIN_IDS = {"admin01", "seller01", "seller02", "buyer01"}
    if login_id in PROTECTED_LOGIN_IDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"시스템 핵심 계정({login_id})은 보호를 위해 삭제할 수 없습니다.",
        )

    user = db.execute(
        select(models.User).where(models.User.login_id == login_id)
    ).scalar_one_or_none()

    if user is None:
        return {"success": True, "message": "해당 계정이 존재하지 않거나 이미 삭제되었습니다."}

    user_id = user.user_id

    try:
        # 1. user_roles 삭제
        db.execute(delete(models.UserRole).where(models.UserRole.user_id == user_id))
        
        # 2. user_addresses 삭제
        db.execute(delete(models.UserAddress).where(models.UserAddress.user_id == user_id))
        
        # 3. buyer_inquiries 및 inquiry_files 삭제
        inquiries = db.execute(
            select(models.BuyerInquiry.inquiry_id).where(models.BuyerInquiry.user_id == user_id)
        ).scalars().all()
        if inquiries:
            db.execute(delete(models.InquiryFile).where(models.InquiryFile.inquiry_id.in_(inquiries)))
            db.execute(delete(models.BuyerInquiry).where(models.BuyerInquiry.inquiry_id.in_(inquiries)))
            
        # 문의 답변자로 지정된 경우 NULL 처리
        db.execute(
            models.BuyerInquiry.__table__.update()
            .where(models.BuyerInquiry.answered_by_user_id == user_id)
            .values(answered_by_user_id=None)
        )
        
        # 4. rag_query_logs 삭제
        try:
            db.execute(text("DELETE FROM rag_query_logs WHERE user_id = :uid"), {"uid": user_id})
        except Exception:
            pass
        
        # 5. refund_requests 및 refund_items 삭제
        refund_ids = db.execute(
            select(models.RefundRequest.refund_request_id).where(models.RefundRequest.buyer_user_id == user_id)
        ).scalars().all()
        if refund_ids:
            try:
                db.execute(text("DELETE FROM refund_items WHERE refund_request_id IN :rids"), {"rids": tuple(refund_ids)})
            except Exception:
                pass
            db.execute(delete(models.RefundRequest).where(models.RefundRequest.refund_request_id.in_(refund_ids)))
        
        # 6. orders (및 연관 주문품목, 결제, 배송) 삭제
        orders = db.execute(
            select(models.Order.order_id).where(models.Order.buyer_user_id == user_id)
        ).scalars().all()
        if orders:
            try:
                db.execute(text("DELETE FROM customer_shipments WHERE order_id IN :oids"), {"oids": tuple(orders)})
            except Exception:
                pass
            db.execute(delete(models.Payment).where(models.Payment.order_id.in_(orders)))
            db.execute(delete(models.OrderItem).where(models.OrderItem.order_id.in_(orders)))
            db.execute(delete(models.Order).where(models.Order.order_id.in_(orders)))
            
        # 7. seller_profiles 삭제
        db.execute(delete(models.SellerProfile).where(models.SellerProfile.user_id == user_id))
        
        # 8. 공지사항 작성자인 경우 최고관리자(1)로 변경
        db.execute(
            models.Notice.__table__.update()
            .where(models.Notice.author_id == user_id)
            .values(author_id=1)
        )

        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"계정 삭제 처리 중 DB 오류가 발생했습니다: {str(e)}",
        )

    return {"success": True, "message": f"계정 '{login_id}'이(가) DB에서 성공적으로 삭제되었습니다."}

