"""
[main.py - SHOPDB3JO 통합 공용 백엔드 서버 진입점]

■ 역할:
  - FastAPI 애플리케이션 생성 및 생명주기 관리.
  - CORS 미들웨어 등록 (an 고객몰, park 지사관리, song 본사관리 프론트엔드 포트 전체 허용).
  - uploads/ 정적 파일 서빙 마운트 (/uploads 주소로 이미지 접근 가능).
  - 10개 도메인별 분할 라우터 일괄 등록:
    1. auth (회원가입/로그인/내정보)
    2. categories (상품 카테고리)
    3. products (상품 목록/상세/검색)
    4. addresses (회원 배송지)
    5. orders (고객 주문/결제)
    6. refunds (환불 요청)
    7. inquiries (1:1 고객 문의)
    8. notices (공지사항 통합 CRUD 및 이미지 업로드)
    9. branch (지사 재고, 판매가 변경, 지사 주문/문의 현황)
    10. admin (본사 대시보드 통계, 지사 관리, 회원 권한, DB 탐색)
"""

from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db, engine
from .routers import (
    addresses,
    admin,
    auth,
    branch,
    categories,
    inquiries,
    notices,
    orders,
    products,
    refunds,
)

settings = get_settings()

# 1. FastAPI 애플리케이션 인스턴스 생성
app = FastAPI(
    title="SHOPDB3JO 통합 공용 백엔드 API",
    version="1.0.0",
    description="구매자 쇼핑몰(an) + 지사 관리자(park) + 본사 관리자(song) 3개 시스템을 하나로 통합한 단일 공용 백엔드 서버",
)

# 2. 업로드 정적 파일 서빙 디렉터리 준비 및 마운트
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 3. CORS 미들웨어 설정 (모든 프론트엔드 포트 교차 출처 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. 모듈별 라우터 등록
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(addresses.router)
app.include_router(orders.router)
app.include_router(refunds.router)
app.include_router(inquiries.router)
app.include_router(notices.router)
app.include_router(branch.router)
app.include_router(admin.router)


# 5. 루트 및 상태 확인(Health Check) 엔드포인트
@app.get("/", tags=["system"], summary="서버 상태 확인")
def root():
    return {
        "status": "online",
        "service": "SHOPDB3JO Unified Common Backend",
        "version": "1.0.0",
        "message": "3개 프로젝트(구매자 쇼핑몰, 지사 관리자, 본사 관리자) 통합 백엔드가 성공적으로 실행 중입니다.",
        "docs_url": "/docs"
    }


@app.get("/api/health", tags=["system"], summary="API 헬스체크")
def api_health():
    return {"status": "ok"}


@app.get("/health/db", tags=["system"], summary="데이터베이스 연결 상태 확인")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "db_name": settings.db_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터베이스 연결 실패: {str(e)}")

