"""
[branch.py - 지사/지점 관리자 전용 라우터 (park)]

■ 역할:
  - 지사 관리자 화면(`react-app-teamproject` / `BranchAdmin.jsx`)에서 사용하는 전용 API들을 제공합니다.
  - 지사별 재고 현황(정상가 대비 할인율 자동 계산 포함).
  - 지사 관리자의 상품 판매가 변경.
  - 특정 지사로 배정된 고객 주문 및 배송 상태 가공.
  - 특정 지사로 인입된 고객 1:1 문의 및 답변 상태 가공.
  - 본사 상품 발주(사입) 미리보기 (도매가 60% 자동 계산).

■ 중요한 호환성 처리:
  - `park` 프론트엔드(`BranchAdmin.jsx`, `Home.jsx`)는 `/api/branch/...` 경로를 호출하고,
    기존 `park/backend/main.py`는 `/api/...` 경로로 작성되어 있어 발생하던 404 불일치를 해결하기 위해
    모든 엔드포인트에 `/api/branch/...`와 `/api/...` 양쪽 경로를 모두 데코레이터로 등록했습니다!
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["branch"])


# =========================================================
# 1. 지사(조직) 목록 조회
# =========================================================
@router.get("/api/branch/branches", summary="지사 목록 조회 (프론트 호출용)")
@router.get("/api/branches", summary="지사 목록 조회 (백엔드 표준)")
def get_branches(db: Session = Depends(get_db)):
    """
    운영 조직 중 지사('BRANCH') 타입의 목록을 조회합니다.
    """
    branches = db.query(models.OrgUnit).filter(models.OrgUnit.org_type == "BRANCH").all()
    return branches


# =========================================================
# 2. 지사별 재고 현황 (할인율 자동 계산)
# =========================================================
@router.get("/api/branch/branches/{org_id}/inventory", summary="지사별 재고 현황 (프론트 호출용)")
@router.get("/api/branches/{org_id}/inventory", summary="지사별 재고 현황 (백엔드 표준)")
def get_branch_inventory(org_id: int, db: Session = Depends(get_db)):
    """
    특정 지사의 상품별 재고 및 안전재고 조회
    - 정상가(regular_price)와 판매가(sale_price)를 비교하여 할인율(discountRate %) 자동 연산
    - 프론트엔드 화면 바인딩에 맞춘 카멜케이스(CamelCase) 응답 형식 유지
    """
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

    items = []
    for r in results:
        reg_price = float(r.regular_price) if r.regular_price else 0
        sale_price = float(r.sale_price) if r.sale_price else 0
        discount_rate = 0

        if reg_price > 0 and sale_price > 0:
            discount_rate = round(((reg_price - sale_price) / reg_price) * 100)

        items.append({
            "id": r.product_id,
            "productCode": r.product_code,
            "name": r.product_name,
            "regularPrice": reg_price,
            "salePrice": sale_price,
            "discountRate": discount_rate,
            "stock": r.stock_quantity,
            "safetyStock": r.safety_stock,
            "uploadDate": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
        })
    return items


# =========================================================
# 3. 상품 판매가 수정
# =========================================================
@router.put("/api/branch/products/{product_id}/price", summary="상품 판매가 변경 (프론트 호출용)")
@router.put("/api/products/{product_id}/price", summary="상품 판매가 변경 (백엔드 표준)")
def update_product_price(product_id: int, req: schemas.PriceUpdateRequest, db: Session = Depends(get_db)):
    """
    지사 관리자가 특정 상품의 판매가를 실시간 수정합니다.
    """
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="상품을 찾을 수 없습니다.")

    product.sale_price = req.sale_price
    db.commit()
    db.refresh(product)
    return {"message": "판매가가 성공적으로 변경되었습니다.", "sale_price": float(product.sale_price)}


# =========================================================
# 4. 지사 접수 고객 주문 내역
# =========================================================
@router.get("/api/branch/branches/{org_id}/orders", summary="지사 주문 내역 (프론트 호출용)")
@router.get("/api/branches/{org_id}/orders", summary="지사 주문 내역 (백엔드 표준)")
def get_branch_orders(org_id: int, db: Session = Depends(get_db)):
    """
    특정 지사(org_id)로 접수된 고객 주문 목록 및 주문 처리 상태 변환
    """
    sql = text("""
        SELECT 
            o.order_no as orderNo, 
            (SELECT p.product_name FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = o.order_id LIMIT 1) as product,
            (SELECT SUM(quantity) FROM order_items WHERE order_id = o.order_id) as qty,
            u.user_name as buyer,
            o.receiver_phone, o.zipcode, o.shipping_address1, o.shipping_address2,
            DATE_FORMAT(o.ordered_at, '%Y-%m-%d %H:%i') as ordered_at,
            CASE o.process_status 
                WHEN '1)결제대기' THEN '결제대기'
                WHEN '2)결제완료' THEN '결제 완료'
                WHEN 'PAYMENT_COMPLETED' THEN '결제 완료'
                WHEN '3)배송전' THEN '배송준비중'
                WHEN '7)배송중' THEN '배송중'
                WHEN '10)반품환불완료' THEN '환불 처리 완료'
                ELSE COALESCE(o.process_status, o.order_status) END as status
        FROM orders o
        JOIN users u ON o.buyer_user_id = u.user_id
        WHERE o.org_id = :org_id
        ORDER BY o.ordered_at DESC
    """)
    return db.execute(sql, {"org_id": org_id}).mappings().all()


# =========================================================
# 5. 지사 접수 고객 1:1 문의
# =========================================================
@router.get("/api/branch/branches/{org_id}/inquiries", summary="지사 고객 문의 (프론트 호출용)")
@router.get("/api/branches/{org_id}/inquiries", summary="지사 고객 문의 (백엔드 표준)")
def get_branch_inquiries(org_id: int, db: Session = Depends(get_db)):
    """
    특정 지사(org_id)로 접수된 고객 문의 및 답변 상태 조회
    """
    sql = text("""
        SELECT i.inquiry_id as id, u.user_name as author, u.login_id as userId, 
               i.category_code as type, 
               i.title, i.content, 
               CASE WHEN i.inquiry_status = 'ANSWERED' THEN '답변완료' ELSE '미답변' END as status,
               DATE_FORMAT(i.created_at, '%Y-%m-%d') as date,
               IFNULL(i.answer_content, '') as reply
        FROM buyer_inquiries i
        JOIN users u ON i.user_id = u.user_id
        WHERE i.org_id = :org_id
        ORDER BY i.created_at DESC
    """)
    return db.execute(sql, {"org_id": org_id}).mappings().all()


# =========================================================
# 6. 본사 상품 발주 목록 (도매가 60% 자동 계산)
# =========================================================
@router.get("/api/branch/hq/products", summary="본사 상품 발주 목록 (프론트 호출용)")
@router.get("/api/hq/products", summary="본사 상품 발주 목록 (백엔드 표준)")
def get_hq_products(db: Session = Depends(get_db)):
    """
    본사(org_id=1)에서 공급하는 상품 목록과 가맹점 도매가(정상가의 60%)를 조회합니다.
    """
    sql = text("""
        SELECT p.product_id as id, p.product_code as code, 
               CONCAT('[본사] ', p.product_name) as name, 
               ROUND(p.regular_price * 0.6) as wholesalePrice, 
               DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') as uploadDate
        FROM products p
        WHERE p.org_id = 1 OR p.org_id IS NULL
        ORDER BY p.created_at DESC
    """)
    return db.execute(sql).mappings().all()


# =========================================================
# 7. 지사 화면 메인 상품 목록 호환용 (/api/branch/products)
# =========================================================
@router.get("/api/branch/products", summary="지사 상품 목록 조회 (Home.jsx 호환)")
def get_branch_products(db: Session = Depends(get_db)):
    """
    park의 Home.jsx 화면에서 '/api/branch/products'를 직접 fetch할 때 상품 목록을 반환합니다.
    """
    return db.query(models.Product).filter(models.Product.product_status.in_(["SALE", "READY"])).all()

