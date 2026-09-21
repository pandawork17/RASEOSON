"""
[config.py - 공용 백엔드 통합 환경 설정]

■ 역할:
  - .env 파일에서 MySQL DB 접속 정보, JWT 보안 키, CORS 도메인을 읽어와 안전하게 관리합니다.
  - pydantic-settings를 사용하여 환경 변수의 유효성을 자동으로 검증합니다.

■ 통합/개선 내용:
  - an(고객몰 포트 5173/5174), park(지사관리 포트 3000/5173), song(본사관리 포트 5173/5174/5175)의
    모든 프론트엔드가 CORS 에러 없이 통신할 수 있도록 기본 CORS 허용 목록을 확장했습니다.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # .env 파일 우선 로드 설정
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # 1. MySQL 데이터베이스 설정 (3개 프로젝트 모두 shopdb3jo 공유)
    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "shopdb3jo"
    db_password: str = "shopdb3jo"
    db_name: str = "shopdb3jo"

    # 2. JWT 인증 설정 (고객 쇼핑몰 로그인 세션 유지용)
    jwt_secret: str = "shopdb3jo-common-backend-secret-key-2026"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24시간 유효

    # 3. CORS 허용 도메인 목록 (쉼표로 구분)
    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:5175,http://127.0.0.1:5175"
    )

    @property
    def database_url(self) -> str:
        """
        SQLAlchemy가 사용할 MySQL 연결 URL 문자열 생성
        형식: mysql+pymysql://유저:비번@호스트:포트/DB명?charset=utf8mb4
        """
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        """
        쉼표로 나열된 문자열을 파싱하여 FastAPI CORSMiddleware에 전달할 리스트로 변환
        """
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    설정 객체를 캐싱하여 매번 .env를 다시 읽는 오버헤드를 방지합니다.
    """
    return Settings()

