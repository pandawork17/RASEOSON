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

import datetime
import uuid
from typing import List, Dict, Any, Optional
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
                WHEN '1) 결제완료' THEN '결제 완료'
                WHEN '2) 배송전' THEN '배송 준비중'
                WHEN '3) 배송전환불요청' THEN '배송전 환불요청'
                WHEN '4) 배송전환불대기' THEN '배송전 환불대기'
                WHEN '5) 배송전환불완료' THEN '배송전 환불완료'
                WHEN '6) 배송시작 (주문완료)' THEN '배송 시작'
                WHEN '7) 배송중' THEN '배송중'
                WHEN '8) 배송완료' THEN '배송 완료'
                WHEN '9) 반품환불요청' THEN '반품 환불요청'
                WHEN '10) 반품환불대기' THEN '반품 환불대기'
                WHEN '11) 반품환불완료' THEN '반품 환불완료'
                WHEN '12) 교환요청' THEN '교환 요청'
                WHEN '13) 교환처리중' THEN '교환 처리중'
                WHEN '14) 교환완료' THEN '교환 완료'
                WHEN 'PAYMENT_COMPLETED' THEN '결제 완료'
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


def format_notification_date(dt: Any) -> str:
    """
    알림 생성 일시를 친절한 상대 시간(방금 전, n분 전, n시간 전, 어제, 날짜)으로 변환
    """
    if not dt:
        return "방금 전"
    try:
        now = datetime.datetime.now()
        diff = now - dt
        total_seconds = int(diff.total_seconds())
        if total_seconds < 0:
            return "방금 전"
        if total_seconds < 60:
            return "방금 전"
        minutes = total_seconds // 60
        if minutes < 60:
            return f"{minutes}분 전"
        hours = total_seconds // 3600
        if hours < 24:
            return f"{hours}시간 전"
        days = total_seconds // 86400
        if days == 1:
            return "어제"
        if days < 7:
            return f"{days}일 전"
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return str(dt)[:10]


# =========================================================
# 8. 지사 알림 목록 조회 (/api/branches/{org_id}/notifications)
# =========================================================
@router.get("/api/branch/branches/{org_id}/notifications", summary="지사 알림 목록 (프론트 호출용)")
@router.get("/api/branches/{org_id}/notifications", summary="지사 알림 목록 (백엔드 표준)")
def get_branch_notifications(org_id: int, db: Session = Depends(get_db)):
    """
    지사 관리자 화면(park)의 상단 알림종(🔔)에 표시할 미확인 알림 목록을 최신순으로 조회합니다.
    """
    org = db.query(models.OrgUnit).filter(models.OrgUnit.org_id == org_id).first()
    org_name = org.org_name if org else ""
    short_name = org_name.replace("베이스시즌 ", "").replace("스마트쇼핑 ", "") if org_name else ""

    sql = text("""
        SELECT id, org_id, type, title, target_tab, is_read, created_at
        FROM branch_notifications
        WHERE (
              org_id = :str_org_id 
              OR org_id = :org_name 
              OR org_id = :short_name 
              OR (:org_name != '' AND :org_name LIKE CONCAT('%', org_id, '%'))
              OR org_id = 'ALL'
          )
        ORDER BY is_read ASC, created_at DESC, id DESC
        LIMIT 50
    """)
    rows = db.execute(sql, {
        "str_org_id": str(org_id),
        "org_name": org_name,
        "short_name": short_name,
    }).mappings().all()

    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "org_id": r["org_id"],
            "type": r["type"],
            "title": r["title"],
            "targetTab": r["target_tab"],
            "target_tab": r["target_tab"],
            "is_read": bool(r["is_read"]),
            "isRead": bool(r["is_read"]),
            "date": format_notification_date(r["created_at"]),
            "created_at": r["created_at"].strftime("%Y-%m-%d %H:%M:%S") if r["created_at"] else "",
        })
    return result


# =========================================================
# 9. 알림 읽음(확인) 처리 (/api/notifications/{id}/read)
# =========================================================
@router.put("/api/notifications/{notification_id}/read", summary="알림 읽음 처리 (PUT)")
@router.put("/api/branch/notifications/{notification_id}/read", summary="알림 읽음 처리 (호환용)")
@router.patch("/api/notifications/{notification_id}/read", summary="알림 읽음 처리 (PATCH)")
@router.post("/api/notifications/{notification_id}/read", summary="알림 읽음 처리 (POST)")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """
    지사 관리자가 알림창에서 알림을 클릭했을 때 읽음(is_read=1) 상태로 업데이트합니다.
    """
    sql = text("UPDATE branch_notifications SET is_read = 1 WHERE id = :id")
    db.execute(sql, {"id": notification_id})
    db.commit()
    return {"success": True, "message": "알림이 확인 처리되었습니다.", "id": notification_id}


# =========================================================
# 10. 지사 알림 전체 읽음 처리 (/api/branches/{org_id}/notifications/read-all)
# =========================================================
@router.put("/api/branches/{org_id}/notifications/read-all", summary="지사 알림 전체 읽음 (PUT)")
@router.put("/api/branch/branches/{org_id}/notifications/read-all", summary="지사 알림 전체 읽음 (호환용)")
def mark_all_notifications_read(org_id: int, db: Session = Depends(get_db)):
    """
    특정 지사의 모든 알림을 일괄 읽음(is_read=1) 처리합니다.
    """
    org = db.query(models.OrgUnit).filter(models.OrgUnit.org_id == org_id).first()
    org_name = org.org_name if org else ""
    short_name = org_name.replace("베이스시즌 ", "").replace("스마트쇼핑 ", "") if org_name else ""

    sql = text("""
        UPDATE branch_notifications
        SET is_read = 1
        WHERE is_read = 0
          AND (
              org_id = :str_org_id 
              OR org_id = :org_name 
              OR org_id = :short_name 
              OR (:org_name != '' AND :org_name LIKE CONCAT('%', org_id, '%'))
              OR org_id = 'ALL'
          )
    """)
    db.execute(sql, {
        "str_org_id": str(org_id),
        "org_name": org_name,
        "short_name": short_name,
    })
    db.commit()
    return {"success": True, "message": "모든 알림이 확인 처리되었습니다."}


# =========================================================
# 11. 지사 발주(사입) 신청 및 내역 조회
# =========================================================
@router.get("/api/branch-purchase-orders", summary="지사 발주 목록 조회")
@router.get("/api/branch/purchase-orders", summary="지사 발주 목록 조회 (호환)")
def get_branch_purchase_orders(org_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    지사에서 본사로 요청한 발주(사입) 신청 목록 조회
    """
    sql = "SELECT * FROM branch_purchase_orders"
    params = {}
    if org_id:
        sql += " WHERE org_id = :org_id"
        params["org_id"] = org_id
    sql += " ORDER BY branch_order_id DESC"

    rows = db.execute(text(sql), params).mappings().all()
    result = []
    for r in rows:
        d = dict(r)
        for k in ["requested_at", "approved_at", "shipped_at", "received_at", "updated_at"]:
            if d.get(k) and hasattr(d[k], "isoformat"):
                d[k] = d[k].isoformat()
        result.append(d)
    return result


@router.get("/api/branch-purchase-order-items", summary="지사 발주 품목 목록 조회")
@router.get("/api/branch/purchase-order-items", summary="지사 발주 품목 목록 조회 (호환)")
def get_branch_purchase_order_items(branch_order_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    지사 발주 신청의 상세 품목 목록 조회
    """
    sql = "SELECT * FROM branch_purchase_order_items"
    params = {}
    if branch_order_id:
        sql += " WHERE branch_order_id = :branch_order_id"
        params["branch_order_id"] = branch_order_id
    sql += " ORDER BY branch_order_item_id DESC"

    rows = db.execute(text(sql), params).mappings().all()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("created_at") and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        if d.get("unit_price") is not None:
            d["unit_price"] = float(d["unit_price"])
        if d.get("item_amount") is not None:
            d["item_amount"] = float(d["item_amount"])
        result.append(d)
    return result


class CreateBranchPurchaseOrderRequest(BaseModel):
    org_id: int
    product_id: Optional[int] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    quantity: int = 1
    wholesale_price: Optional[float] = 0.0
    request_note: Optional[str] = None


@router.post("/api/branch-purchase-orders", summary="지사 발주 신청")
@router.post("/api/branch/purchase-orders", summary="지사 발주 신청 (호환)")
def create_branch_purchase_order(
    body: CreateBranchPurchaseOrderRequest,
    db: Session = Depends(get_db),
):
    """
    지사 관리자가 본사 상품을 발주(사입) 신청하여 DB에 등록
    """
    order_no = f"BPO-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.datetime.now()

    pid = body.product_id
    if not pid and body.product_code:
        p = db.execute(text("SELECT product_id FROM products WHERE product_code = :c"), {"c": body.product_code}).mappings().first()
        if p:
            pid = p["product_id"]
    if not pid:
        pid = 1

    var = db.execute(text("SELECT variant_id FROM product_variants WHERE product_id = :p LIMIT 1"), {"p": pid}).mappings().first()
    var_id = var["variant_id"] if var else None

    uid = 2 if body.org_id == 2 else 3

    ins_order = text("""
        INSERT INTO branch_purchase_orders (branch_order_no, org_id, head_org_id, requested_by_user_id, order_status, request_note, requested_at, updated_at)
        VALUES (:no, :org_id, 1, :uid, 'WAITING_APPROVAL', :note, :now, :now)
    """)
    res = db.execute(ins_order, {
        "no": order_no,
        "org_id": body.org_id,
        "uid": uid,
        "note": body.request_note or f"지사 발주 요청: {body.product_name or ''}",
        "now": now,
    })
    b_order_id = res.lastrowid

    unit_price = body.wholesale_price or 0.0
    item_amount = unit_price * body.quantity
    ins_item = text("""
        INSERT INTO branch_purchase_order_items (org_id, branch_order_id, product_id, variant_id, order_quantity, approved_quantity, received_quantity, unit_price, item_amount, created_at)
        VALUES (:org_id, :b_order_id, :pid, :vid, :qty, NULL, 0, :price, :amount, :now)
    """)
    db.execute(ins_item, {
        "org_id": body.org_id,
        "b_order_id": b_order_id,
        "pid": pid,
        "vid": var_id,
        "qty": body.quantity,
        "price": unit_price,
        "amount": item_amount,
        "now": now,
    })

    # 지사 -> 본사 알림 생성
    try:
        branch_name = "전주지사" if body.org_id == 2 else ("부산지사" if body.org_id == 3 else f"지사 {body.org_id}")
        p_name = body.product_name or f"상품 #{pid}"
        notif_sql = text("""
            INSERT INTO branch_notifications (org_id, type, title, target_tab, is_read, created_at)
            VALUES ('1', '발주', :title, 'restock-history', 0, :now)
        """)
        db.execute(notif_sql, {
            "title": f"[{branch_name}]에서 [{p_name}] {body.quantity}개 발주 신청이 접수되었습니다.",
            "now": now,
        })
    except Exception as e:
        print("[branch] notification warning:", e)

    db.commit()
    return {
        "status": "success",
        "message": "발주 신청이 완료되었습니다.",
        "branch_order_id": b_order_id,
        "branch_order_no": order_no,
    }


class UpdateBranchOrderStatusRequest(BaseModel):
    order_status: str


@router.patch("/api/branch-purchase-orders/{branch_order_id}/status", summary="지사 발주 상태 변경 (PATCH)")
@router.put("/api/branch-purchase-orders/{branch_order_id}/status", summary="지사 발주 상태 변경 (PUT)")
@router.patch("/api/branch/purchase-orders/{branch_order_id}/status", summary="지사 발주 상태 변경 (호환)")
def update_branch_purchase_order_status(
    branch_order_id: int,
    body: UpdateBranchOrderStatusRequest,
    db: Session = Depends(get_db),
):
    """
    본사 관리자가 지사의 발주 요청을 승인 / 배송 / 입고 / 반려 처리
    """
    status_map = {
        "승인 대기": "WAITING_APPROVAL",
        "요청대기": "WAITING_APPROVAL",
        "발주 승인": "SHIPPING",
        "승인": "SHIPPING",
        "배송 중": "SHIPPING",
        "출고완료": "RECEIVED",
        "입고 완료": "RECEIVED",
        "반려": "REJECTED",
    }
    raw_status = status_map.get(body.order_status, body.order_status)
    
    # 지사 정보 조회
    row = db.execute(
        text("SELECT org_id, branch_order_no FROM branch_purchase_orders WHERE branch_order_id = :id"),
        {"id": branch_order_id}
    ).fetchone()

    db.execute(
        text("UPDATE branch_purchase_orders SET order_status = :st, updated_at = NOW() WHERE branch_order_id = :id"),
        {"st": raw_status, "id": branch_order_id}
    )

    if row:
        org_id = str(row[0])
        order_no = row[1] or f"#{branch_order_id}"
        status_label = {
            "SHIPPING": "발주가 승인되어 배송(출고) 진행 중입니다.",
            "RECEIVED": "발주 건이 입고(출고완료) 처리되었습니다.",
            "REJECTED": "발주 신청이 반려되었습니다.",
            "WAITING_APPROVAL": "발주가 승인 대기 상태로 변경되었습니다."
        }.get(raw_status, f"발주 상태가 '{raw_status}'(으)로 변경되었습니다.")

        try:
            db.execute(text("""
                INSERT INTO branch_notifications (org_id, type, title, target_tab, is_read, created_at)
                VALUES (:org_id, '발주', :title, 'restock-history', 0, NOW())
            """), {
                "org_id": org_id,
                "title": f"발주 [{order_no}] {status_label}"
            })
        except Exception as e:
            print("[branch] notification warning:", e)

    db.commit()
    return {"status": "success", "branch_order_id": branch_order_id, "order_status": raw_status}



