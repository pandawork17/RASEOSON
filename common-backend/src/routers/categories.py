"""
[categories.py - 상품 카테고리 조회 라우터]

■ 역할:
  - 쇼핑몰 상단 네비게이션 및 사이드바에서 사용할 활성(active_yn='Y') 카테고리 목록을 반환합니다.
  - 카테고리 레벨(category_level)과 전시 순서(display_order)에 따라 정렬하여 제공합니다.

■ 통합/호환성 개선:
  - an(고객몰) 프론트엔드는 `/api/categories`를 호출합니다.
  - park(지사관리) 백엔드는 `/api/products/categories`를 지원했었습니다.
  - 두 경로 모두 동일한 로직으로 정상 응답할 수 있도록 다중 라우트 데코레이터를 적용했습니다.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["categories"])


@router.get("/api/categories", response_model=List[schemas.CategoryOut], summary="카테고리 목록 조회 (표준)")
@router.get("/api/products/categories", response_model=List[schemas.CategoryOut], summary="카테고리 목록 조회 (호환용)")
def list_categories(db: Session = Depends(get_db)):
    """
    현재 활성화(active_yn='Y')된 상품 카테고리를 계층 및 전시 순서대로 정렬하여 반환합니다.
    """
    rows = db.execute(
        select(models.Category)
        .where(models.Category.active_yn == "Y")
        .order_by(models.Category.category_level, models.Category.display_order)
    ).scalars().all()
    return [schemas.CategoryOut.model_validate(row) for row in rows]

