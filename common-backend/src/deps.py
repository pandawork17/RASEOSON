"""
[deps.py - FastAPI 의존성 주입(Dependency Injection) 정의]

■ 역할:
  - 각 라우터 함수에서 매개변수로 Depends(...)를 통해 주입받을 공통 함수들을 정의합니다.
  - get_db: 요청 단위의 데이터베이스 세션 공급.
  - get_current_user: Authorization 헤더의 JWT Bearer 토큰을 검증하여 현재 로그인한 User 객체 반환.
  - get_optional_user: 로그인이 필수가 아닌 공개 조회 API(예: 공지사항, 상품 상세)에서 선택적 로그인 식별.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .security import decode_access_token

# auto_error=False로 설정하여 인증 헤더가 없을 때 무조건 403을 띄우지 않고,
# 우리가 정의한 get_current_user에서 친절한 401 안내 메시지를 반환하도록 제어합니다.
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    [로그인 필수 API용 의존성]
    - Authorization 헤더 검사
    - JWT 토큰 디코딩 및 만료 여부 확인
    - DB에서 user_id 조회 및 활성 상태(user_status == 'ACTIVE') 확인
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다. (Authorization Bearer 헤더가 누락되었습니다)",
        )

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않거나 만료된 토큰입니다. 다시 로그인해 주세요.",
        )

    user = db.get(models.User, user_id)
    if user is None or user.user_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없거나 비활성화(정지/탈퇴)된 계정입니다.",
        )

    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """
    [로그인 선택 API용 의존성]
    - 비로그인 유저도 접근할 수 있지만, 로그인한 유저인 경우 추가 혜택이나 정보를 제공할 때 사용합니다.
    """
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        return None
    user = db.get(models.User, user_id)
    if user is None or user.user_status != "ACTIVE":
        return None
    return user

