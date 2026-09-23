"""
[products.py - 상품 목록, 상세 조회 및 검색 라우터]

■ 역할:
  - 쇼핑몰 구매자가 열람하는 상품 목록(페이징, 카테고리 필터링, 검색어 검색) 및 상세 정보를 제공합니다.
  - 카테고리 필터 시 하위 카테고리(descendants)까지 재귀적으로 탐색하여 하위 카테고리 상품도 함께 노출합니다.
  - 지사/창고별 실재고에서 예약재고를 차감한 가용재고(available stock)를 계산합니다.
  - 상품 상세 조회 시 `images.py`를 연동하여 항상 5장 이상의 갤러리 이미지를 제공합니다.
"""

from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db
from ..images import build_gallery, build_thumbnail

router = APIRouter(prefix="/api/products", tags=["products"])


def _available_stock_map(db: Session, variant_ids: List[int]) -> Dict[int, int]:
    """
    옵션 ID 목록에 대해 각 옵션의 총 가용 재고(stock_quantity - reserved_quantity)를 집계합니다.
    """
    if not variant_ids:
        return {}
    rows = db.execute(
        select(
            models.Inventory.variant_id,
            func.sum(models.Inventory.stock_quantity - models.Inventory.reserved_quantity),
        )
        .where(models.Inventory.variant_id.in_(variant_ids))
        .group_by(models.Inventory.variant_id)
    ).all()
    return {variant_id: int(available or 0) for variant_id, available in rows}


def _descendant_category_ids(db: Session, root_id: int) -> List[int]:
    """
    선택한 카테고리의 모든 하위 카테고리 ID를 DFS(깊이 우선 탐색)로 찾아 리스트로 반환합니다.
    """
    all_categories = db.execute(select(models.Category)).scalars().all()
    children_by_parent: dict[Optional[int], list[int]] = {}
    for c in all_categories:
        children_by_parent.setdefault(c.parent_category_id, []).append(c.category_id)

    result = [root_id]
    stack = [root_id]
    while stack:
        current = stack.pop()
        for child_id in children_by_parent.get(current, []):
            result.append(child_id)
            stack.append(child_id)
    return result


@router.get("", response_model=schemas.ProductListResponse, summary="상품 목록 및 검색 (페이징)")
def list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = Query(default=None, max_length=200),
    sort: Optional[str] = Query(default=None, description="정렬 옵션: 'bestseller' 등"),
    is_bestseller: Optional[bool] = Query(default=False, description="베스트셀러 여부"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    상품 목록 조회
    - category_id 지정 시 하위 카테고리 상품까지 일괄 조회
    - search 파라미터로 상품명 부분 검색
    - sort="bestseller" 또는 is_bestseller=True 시:
      주문 내역(order_items) 테이블에서 가장 많이 팔린 상품만 판매수량 내림차순으로 조회합니다.
      주문내역 테이블에 주문이 없거나 주문되지 않은 상품은 전혀 포함되지 않습니다.
    - 판매중(SALE) 또는 판매대기(READY) 상태의 상품만 표시
    """
    query = (
        select(models.Product)
        .options(selectinload(models.Product.images).selectinload(models.ProductImage.file))
        .options(selectinload(models.Product.category))
        .options(selectinload(models.Product.variants))
        .where(models.Product.product_status.in_(["SALE", "READY"]))
    )

    if category_id is not None:
        category_ids = _descendant_category_ids(db, category_id)
        query = query.where(models.Product.category_id.in_(category_ids))

    if search:
        like = f"%{search}%"
        query = query.where(models.Product.product_name.ilike(like))

    if is_bestseller or (sort and sort.lower() == "bestseller"):
        # 주문 내역(order_items) 테이블에서 실제 판매된 수량 집계 (취소/환불 제외)
        sales_subq = (
            select(
                models.OrderItem.product_id,
                func.sum(models.OrderItem.quantity).label("total_sold"),
            )
            .join(models.Order, models.OrderItem.order_id == models.Order.order_id)
            .where(
                (models.Order.order_status.is_(None))
                | (
                    ~models.Order.order_status.ilike("%취소%")
                    & ~models.Order.order_status.in_(["CANCELLED", "REFUNDED"])
                )
            )
            .group_by(models.OrderItem.product_id)
            .having(func.sum(models.OrderItem.quantity) > 0)
            .subquery()
        )

        query = (
            query
            .join(sales_subq, models.Product.product_id == sales_subq.c.product_id)
            .order_by(sales_subq.c.total_sold.desc(), models.Product.product_id.asc())
        )
    else:
        query = query.order_by(models.Product.product_id.asc())

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    rows = db.execute(
        query.offset((page - 1) * page_size).limit(page_size)
    ).scalars().all()

    all_variant_ids = [v.variant_id for p in rows for v in p.variants]
    stock_map = _available_stock_map(db, all_variant_ids)

    items = []
    for product in rows:
        in_stock = any(stock_map.get(v.variant_id, 0) > 0 for v in product.variants)
        items.append(
            schemas.ProductListItem(
                product_id=product.product_id,
                product_code=product.product_code,
                product_name=product.product_name,
                short_description=product.short_description,
                category_id=product.category_id,
                category_name=product.category.category_name if product.category else "",
                regular_price=product.regular_price,
                sale_price=product.sale_price,
                product_status=product.product_status,
                thumbnail_url=build_thumbnail(product),
                in_stock=in_stock,
            )
        )

    return schemas.ProductListResponse(total=total, items=items)


@router.get("/bestseller", response_model=schemas.ProductListResponse, summary="베스트셀러 상품 목록 (주문량 순)")
def get_bestsellers(
    category_id: Optional[int] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    주문 내역(order_items) 테이블에서 가장 많이 팔린 상품만 조회합니다.
    주문 내역 테이블에 아무도 주문하지 않았으면 아무 상품도 노출되지 않습니다.
    """
    return list_products(
        category_id=category_id,
        search=None,
        sort="bestseller",
        is_bestseller=True,
        page=page,
        page_size=page_size,
        db=db,
    )


@router.get("/{product_id}", response_model=schemas.ProductDetailOut, summary="상품 상세 조회")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    상품 상세 정보 조회
    - 상품 기본 정보, 카테고리명
    - 옵션별 가용 재고(stock_available)
    - 5장 이상의 갤러리 이미지 URL 리스트 포함
    """
    product = db.execute(
        select(models.Product)
        .options(selectinload(models.Product.images).selectinload(models.ProductImage.file))
        .options(selectinload(models.Product.category))
        .options(selectinload(models.Product.variants))
        .where(models.Product.product_id == product_id)
    ).scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="상품을 찾을 수 없습니다.")

    variant_ids = [v.variant_id for v in product.variants]
    stock_map = _available_stock_map(db, variant_ids)

    variants = [
        schemas.VariantOut(
            variant_id=v.variant_id,
            sku_code=v.sku_code,
            option_name1=v.option_name1,
            option_value1=v.option_value1,
            option_name2=v.option_name2,
            option_value2=v.option_value2,
            additional_price=v.additional_price,
            stock_available=max(0, stock_map.get(v.variant_id, 0)),
        )
        for v in product.variants
        if v.active_yn == "Y"
    ]

    return schemas.ProductDetailOut(
        product_id=product.product_id,
        product_code=product.product_code,
        product_name=product.product_name,
        short_description=product.short_description,
        description=product.description,
        category_id=product.category_id,
        category_name=product.category.category_name if product.category else "",
        regular_price=product.regular_price,
        sale_price=product.sale_price,
        product_status=product.product_status,
        images=build_gallery(product),
        variants=variants,
    )

