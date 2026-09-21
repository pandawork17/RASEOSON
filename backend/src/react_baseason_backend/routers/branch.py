from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/branch", tags=["branch"])


class PriceUpdateRequest(BaseModel):
    sale_price: float


@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    variants = db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).all()
    return {"product": product, "variants": variants}


@router.put("/products/{product_id}/price")
def update_product_price(product_id: int, request: PriceUpdateRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    product.sale_price = request.sale_price
    db.commit()
    db.refresh(product)
    return {"message": "판매가가 변경되었습니다.", "sale_price": float(product.sale_price)}


@router.get("/branches")
def get_branches(db: Session = Depends(get_db)):
    return db.query(models.OrgUnit).filter(models.OrgUnit.org_type == "BRANCH").all()


@router.get("/branches/{org_id}/inventory")
def get_branch_inventory(org_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Product.product_id,
            models.Product.product_code,
            models.Product.product_name,
            models.Product.regular_price,
            models.Product.sale_price,
            models.Product.created_at,
            models.Inventory.stock_quantity,
            models.Inventory.safety_stock,
        )
        .join(models.ProductVariant, models.Product.product_id == models.ProductVariant.product_id)
        .join(models.Inventory, models.Inventory.variant_id == models.ProductVariant.variant_id)
        .filter(models.Inventory.org_id == org_id)
        .all()
    )
    return [
        {
            "id": row.product_id,
            "productCode": row.product_code,
            "name": row.product_name,
            "regularPrice": float(row.regular_price or 0),
            "salePrice": float(row.sale_price or 0),
            "discountRate": round(((float(row.regular_price) - float(row.sale_price)) / float(row.regular_price)) * 100)
            if row.regular_price and row.sale_price
            else 0,
            "stock": row.stock_quantity,
            "safetyStock": row.safety_stock,
            "uploadDate": row.created_at.strftime("%Y-%m-%d %H:%M") if row.created_at else "",
        }
        for row in results
    ]


@router.get("/notices")
def get_notices(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT n.notice_id, n.title, n.content, n.is_pinned,
               DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i') AS created_at,
               n.view_count, u.user_name AS author_name, n.image
        FROM notices n JOIN users u ON n.author_id = u.user_id
        ORDER BY n.is_pinned DESC, n.created_at DESC
    """))
    return result.mappings().all()


@router.get("/branches/{org_id}/orders")
def get_branch_orders(org_id: int, db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT o.order_no AS orderNo,
               (SELECT p.product_name FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = o.order_id LIMIT 1) AS product,
               (SELECT SUM(quantity) FROM order_items WHERE order_id = o.order_id) AS qty,
               u.user_name AS buyer, o.receiver_phone, o.zipcode, o.shipping_address1, o.shipping_address2,
               DATE_FORMAT(o.ordered_at, '%Y-%m-%d %H:%i') AS ordered_at,
               o.process_status AS status
        FROM orders o JOIN users u ON o.buyer_user_id = u.user_id
        WHERE o.org_id = :org_id ORDER BY o.ordered_at DESC
    """), {"org_id": org_id})
    return result.mappings().all()


@router.get("/branches/{org_id}/inquiries")
def get_branch_inquiries(org_id: int, db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT i.inquiry_id AS id, u.user_name AS author, u.login_id AS userId,
               i.category_code AS type, i.title, i.content,
               CASE WHEN i.inquiry_status = 'ANSWERED' THEN '답변완료' ELSE '미답변' END AS status,
               DATE_FORMAT(i.created_at, '%Y-%m-%d') AS date, IFNULL(i.answer_content, '') AS reply
        FROM buyer_inquiries i JOIN users u ON i.user_id = u.user_id
        WHERE i.org_id = :org_id ORDER BY i.created_at DESC
    """), {"org_id": org_id})
    return result.mappings().all()


@router.get("/hq/products")
def get_hq_products(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT p.product_id AS id, p.product_code AS code, CONCAT('[본사] ', p.product_name) AS name,
               p.regular_price * 0.6 AS wholesalePrice, DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') AS uploadDate
        FROM products p WHERE p.org_id = 1 ORDER BY p.created_at DESC
    """))
    return result.mappings().all()
