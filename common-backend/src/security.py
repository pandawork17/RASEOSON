"""
[security.py - 비밀번호 단방향 암호화 및 JWT 액세스 토큰 관리]

■ 역할:
  - 사용자 비밀번호를 DB에 안전하게 저장하기 위해 해싱(hashing)하고, 로그인 시 평문 암호와 일치하는지 검증합니다.
  - 로그인 성공 시 사용자 ID를 담은 JWT(JSON Web Token)를 발행하고, 유효한 토큰인지 검증/해독합니다.

■ 통합/개선 내용:
  - passlib의 CryptContext에 pbkdf2_sha256 및 bcrypt 방식을 모두 등록하여,
    기존 DB 시드 데이터에 있을 수 있는 다양한 암호화 형식과의 호환성을 확보했습니다.
"""

import datetime
from typing import Optional
import jwt
from passlib.context import CryptContext

from .config import get_settings

settings = get_settings()

# 1. 비밀번호 암호화 컨텍스트 설정 (pbkdf2_sha256을 기본으로 사용하되 bcrypt도 검증 가능)
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    평문 비밀번호를 단방향 암호화 해시 문자열로 변환합니다.
    """
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    사용자가 입력한 평문 비밀번호와 DB에 저장된 해시값이 일치하는지 검증합니다.
    """
    try:
        return pwd_context.verify(password, password_hash)
    except (ValueError, Exception):
        return False


def create_access_token(user_id: int) -> str:
    """
    로그인 성공 시 클라이언트(브라우저)에 반환할 JWT Bearer 토큰을 생성합니다.
    토큰 페이로드에는 user_id(sub), 발급시간(iat), 만료시간(exp)이 포함됩니다.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + datetime.timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[int]:
    """
    클라이언트가 헤더(Authorization: Bearer <token>)로 보낸 토큰을 복호화하여
    유효성을 검증하고, 정상인 경우 토큰의 소유자(user_id)를 정수형으로 반환합니다.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None

