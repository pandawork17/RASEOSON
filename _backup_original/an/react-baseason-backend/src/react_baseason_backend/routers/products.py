from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db
from ..images import build_gallery, build_thumbnail

router = APIRouter(prefix="/api/products", tags=["products"])


def _available_stock_map(db: Session, variant_ids: list[int]) -> dict[int, int]:
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


@router.get("", response_model=schemas.ProductListResponse)
def list_products(
    category_id: int | None = None,
    search: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
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

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    rows = db.execute(
        query.order_by(models.Product.product_id).offset((page - 1) * page_size).limit(page_size)
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


def _descendant_category_ids(db: Session, root_id: int) -> list[int]:
    all_categories = db.execute(select(models.Category)).scalars().all()
    children_by_parent: dict[int | None, list[int]] = {}
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


@router.get("/{product_id}", response_model=schemas.ProductDetailOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
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
