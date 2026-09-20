import os

from dotenv import load_dotenv
from sqlalchemy import create_engine

# .env 파일의 DB 설정값을 읽습니다.
load_dotenv(override=True)

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")

# 실제 HeidiSQL에서 확인한 3조 데이터베이스 이름
DB_NAME = os.getenv("DB_NAME", "shopdb3jo")

# MySQL 접속 주소를 만듭니다.
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# FastAPI가 MySQL에 연결할 때 사용할 엔진입니다.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)