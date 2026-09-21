"""
[database.py - SQLAlchemy 데이터베이스 커넥션 풀 및 세션 관리]

■ 역할:
  - MySQL에 연결할 엔진을 생성하고, 안전하게 DB 세션을 열고 닫는 제너레이터(get_db)를 제공합니다.
  - pool_pre_ping=True를 적용하여 MySQL의 장시간 미사용 커넥션 끊김(MySQL server has gone away)을 사전에 방지합니다.
  - SQLAlchemy 2.0 표준 DeclarativeBase를 상속받은 Base 클래스를 선언하여 models.py에서 활용합니다.
"""

from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings

settings = get_settings()

# 1. 데이터베이스 커넥션 풀 생성 (ping 검사 및 30분 주기 커넥션 재활용)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # 매 쿼리 실행 전 커넥션 유효성 자동 확인
    pool_recycle=1800,   # 1800초(30분)마다 커넥션을 갱신하여 MySQL 끊김 에러 방지
)

# 2. 요청마다 독립적인 세션을 생성하는 SessionLocal 팩토리
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


# 3. SQLAlchemy 2.0 선언적 모델들의 부모가 되는 Base 클래스
class Base(DeclarativeBase):
    pass


# 4. FastAPI의 Depends(get_db)에서 사용할 세션 제너레이터
def get_db() -> Generator:
    """
    HTTP 요청이 들어오면 새로운 DB 세션을 생성하고,
    요청 처리가 끝나면(에러 발생 여부 무관) 안전하게 세션을 닫습니다.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

