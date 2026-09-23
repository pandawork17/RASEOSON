# database.py 수정
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 생성한 계정 정보: ID(shopdb3jo), PW(shopdb3jo), DB이름(shopdb3jo)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://shopdb3jo:shopdb3jo@127.0.0.1:3306/shopdb3jo?charset=utf8mb4"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()