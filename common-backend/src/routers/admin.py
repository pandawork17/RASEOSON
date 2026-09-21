"""
[admin.py - 본사/시스템 관리자 전용 라우터 (song)]

■ 역할:
  - 본사 관리자 화면(`song/frontend`의 `Dashboard.jsx`, `BranchAdmin.jsx`, `CompanyPolicies.jsx` 등)에서 사용하는 관리자 API를 제공합니다.
  - 대시보드 요약 통계: `Dashboard.jsx`가 요청하는 9가지 핵심 지표(/api/dashboard/summary)를 DB 집계 쿼리로 산출합니다.
  - 최근 주문 현황: 본사 대시보드용 최근 5건의 주문/결제 통합 목록.
  - 조직/지사 관리: 본사 및 지사 목록 조회, 신규 지사 등록, 정보 수정, 활성화/비활성화.
  - 회원 및 권한 관리: 전체 회원 목록 조회, 회원별 권한 조회 및 변경.
  - 회사 정책 조회: `company_policies` 목록 조회.
  - 테이블 탐색기: song 프론트엔드의 DB 테이블 데이터 즉시 조회용 엔드포인트 지원.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["admin"])


# =========================================================
# 1. 본사 대시보드 통계 및 최근 주문 (Dashboard.jsx)
# =========================================================
@router.get("/api/dashboard/summary", summary="대시보드 종합 요약 통계")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    song의 Dashboard.jsx에서 카드 형태로 표시하는 9가지 종합 지표 계산:
    - org_count: 운영 조직 수
    - user_count: 전체 회원 수
    - seller_count: 판매자 수
    - product_count: 전체 상품 수
    - order_count: 전체 주문 수
    - payment_count: 결제 내역 건수
    - refund_count: 환불 요청 건수
    - low_stock_count: 안전재고 미달(stock < safety_stock) 품목 수
    - unanswered_inquiry_count: 미답변 문의(inquiry_status != 'ANSWERED') 건수
    """
    sql = text("""
        SELECT
            (SELECT COUNT(*) FROM org_units WHERE active_yn = 'Y') AS org_count,
            (SELECT COUNT(*) FROM users) AS user_count,
            (SELECT COUNT(*) FROM seller_profiles WHERE seller_status = 'ACTIVE') AS seller_count,
            (SELECT COUNT(*) FROM products WHERE product_status != 'DELETED') AS product_count,
            (SELECT COUNT(*) FROM orders) AS order_count,
            (SELECT COUNT(*) FROM payments) AS payment_count,
            (SELECT COUNT(*) FROM refund_requests WHERE refund_status = 'REQUESTED') AS refund_count,
            (SELECT COUNT(*) FROM inventories WHERE stock_quantity <= safety_stock) AS low_stock_count,
            (SELECT COUNT(*) FROM buyer_inquiries WHERE inquiry_status != 'ANSWERED') AS unanswered_inquiry_count
    """)
    row = db.execute(sql).mappings().first()
    return dict(row) if row else {
        "org_count": 0,
        "user_count": 0,
        "seller_count": 0,
        "product_count": 0,
        "order_count": 0,
        "payment_count": 0,
        "refund_count": 0,
        "low_stock_count": 0,
        "unanswered_inquiry_count": 0,
    }


@router.get("/api/dashboard/recent-orders", summary="대시보드 최근 주문 5건")
def get_dashboard_recent_orders(db: Session = Depends(get_db)):
    """
    본사 대시보드 하단에 노출되는 최근 주문 5건 (고객명, 지사명, 결제수단 통합 조인)
    """
    sql = text("""
        SELECT
            o.order_id,
            o.order_no,
            u.user_name AS buyer_name,
            ou.org_name,
            o.order_status,
            o.total_amount,
            DATE_FORMAT(o.ordered_at, '%Y-%m-%d %H:%i') as ordered_at,
            p.payment_method,
            p.payment_status,
            p.approved_amount
        FROM orders AS o
        LEFT JOIN users AS u ON o.buyer_user_id = u.user_id
        LEFT JOIN org_units AS ou ON o.org_id = ou.org_id
        LEFT JOIN payments AS p ON o.order_id = p.order_id
        ORDER BY o.ordered_at DESC, o.order_id DESC
        LIMIT 5
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


# =========================================================
# 2. 조직 / 지사 관리 (song/frontend/src/BranchAdmin.jsx)
# =========================================================
@router.get("/api/org-units", summary="전체 조직 목록 조회")
@router.get("/api/admin/orgs", summary="전체 조직 목록 조회 (api.js 호환)")
def get_org_units(db: Session = Depends(get_db)):
    """
    상위 본사 조직명(parent_org_name)을 포함한 전체 조직 계층 목록 조회
    """
    sql = text("""
        SELECT
            child.org_id,
            child.parent_org_id,
            child.org_code,
            child.org_name,
            child.org_type,
            child.phone,
            child.email,
            child.address1,
            child.active_yn,
            parent.org_name AS parent_org_name
        FROM org_units AS child
        LEFT JOIN org_units AS parent
            ON child.parent_org_id = parent.org_id
        ORDER BY child.org_id
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


@router.post("/api/org-units", status_code=status.HTTP_201_CREATED, summary="신규 지사 등록")
@router.post("/api/admin/orgs", status_code=status.HTTP_201_CREATED, summary="신규 지사 등록 (api.js 호환)")
def create_branch(payload: schemas.OrgUnitCreate, db: Session = Depends(get_db)):
    """
    본사 관리자가 새로운 지사를 등록합니다. (코드 중복 방지)
    """
    # 1. 중복 코드 검사
    duplicate = db.execute(
        text("SELECT org_id FROM org_units WHERE org_code = :org_code"),
        {"org_code": payload.org_code}
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="이미 사용 중인 조직 코드입니다.")

    # 2. 지사(BRANCH) 생성 및 본사(parent_org_id=1) 하위 등록
    sql = text("""
        INSERT INTO org_units (
            org_code, org_name, org_type, parent_org_id, phone, email, address1, active_yn
        ) VALUES (
            :org_code, :org_name, 'BRANCH', 1, :phone, :email, :address1, 'Y'
        )
    """)
    result = db.execute(
        sql,
        {
            "org_code": payload.org_code,
            "org_name": payload.org_name,
            "phone": payload.phone,
            "email": payload.email,
            "address1": payload.address1,
        }
    )
    db.commit()
    return {"message": "지사가 등록되었습니다.", "org_id": result.lastrowid}


@router.put("/api/org-units/{org_id}", summary="지사 정보 수정")
def update_branch(org_id: int, payload: schemas.OrgUnitUpdate, db: Session = Depends(get_db)):
    """
    지사 정보(이름, 전화번호, 이메일, 주소) 수정
    """
    sql = text("""
        UPDATE org_units
        SET
            org_name = COALESCE(:org_name, org_name),
            phone = :phone,
            email = :email,
            address1 = :address1
        WHERE org_id = :org_id
    """)
    result = db.execute(
        sql,
        {
            "org_id": org_id,
            "org_name": payload.org_name,
            "phone": payload.phone,
            "email": payload.email,
            "address1": payload.address1,
        }
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="수정할 조직을 찾지 못했습니다.")
    db.commit()
    return {"message": "지사 정보가 수정되었습니다.", "org_id": org_id}


@router.patch("/api/org-units/{org_id}/deactivate", summary="지사 비활성화")
def deactivate_branch(org_id: int, db: Session = Depends(get_db)):
    """지사 운영 중지(active_yn='N') 처리"""
    sql = text("UPDATE org_units SET active_yn = 'N' WHERE org_id = :org_id")
    result = db.execute(sql, {"org_id": org_id})
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="비활성화할 조직을 찾지 못했습니다.")
    db.commit()
    return {"message": "지사가 비활성화되었습니다.", "org_id": org_id}


@router.patch("/api/org-units/{org_id}/activate", summary="지사 재활성화")
def activate_branch(org_id: int, db: Session = Depends(get_db)):
    """지사 재가동(active_yn='Y') 처리"""
    sql = text("UPDATE org_units SET active_yn = 'Y' WHERE org_id = :org_id")
    result = db.execute(sql, {"org_id": org_id})
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="재활성화할 조직을 찾지 못했습니다.")
    db.commit()
    return {"message": "지사가 재활성화되었습니다.", "org_id": org_id}


# =========================================================
# 3. 회원 및 권한 관리 (song/frontend)
# =========================================================
@router.get("/api/users", summary="전체 회원 목록 조회 (권한/소속 포함)")
def get_users(db: Session = Depends(get_db)):
    """
    전체 회원 목록 (소속 지사, 부여된 권한 목록, 판매자 상태를 GROUP_CONCAT 조인)
    """
    sql = text("""
        SELECT
            u.user_id,
            u.login_id,
            u.user_name,
            u.email,
            u.phone,
            u.user_status,
            ou.org_code,
            ou.org_name,
            GROUP_CONCAT(
                DISTINCT r.role_name
                ORDER BY r.role_name
                SEPARATOR ', '
            ) AS roles,
            sp.seller_id,
            sp.company_name,
            sp.business_number,
            sp.seller_status
        FROM users AS u
        LEFT JOIN org_units AS ou ON u.org_id = ou.org_id
        LEFT JOIN user_roles AS ur ON u.user_id = ur.user_id
        LEFT JOIN roles AS r ON ur.role_id = r.role_id
        LEFT JOIN seller_profiles AS sp ON u.user_id = sp.user_id
        GROUP BY
            u.user_id,
            u.login_id,
            u.user_name,
            u.email,
            u.phone,
            u.user_status,
            ou.org_code,
            ou.org_name,
            sp.seller_id,
            sp.company_name,
            sp.business_number,
            sp.seller_status
        ORDER BY u.user_id
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


@router.get("/api/users/{user_id}/addresses", summary="특정 회원의 배송지 조회")
def get_user_addresses(user_id: int, db: Session = Depends(get_db)):
    """관리자가 특정 회원의 배송지 목록을 조회합니다."""
    sql = text("""
        SELECT
            address_id, user_id, receiver_name, receiver_phone, address1, default_yn
        FROM user_addresses
        WHERE user_id = :user_id
        ORDER BY default_yn DESC, address_id
    """)
    result = db.execute(sql, {"user_id": user_id})
    return [dict(row) for row in result.mappings().all()]


@router.get("/users/{user_id}/roles", summary="특정 회원 권한 조회 (호환용)")
@router.get("/api/users/{user_id}/roles", summary="특정 회원 권한 조회 (표준)")
def get_user_roles(user_id: int, db: Session = Depends(get_db)):
    """특정 회원의 부여된 권한 목록 반환"""
    sql = text("""
        SELECT r.role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = :user_id
    """)
    roles = [row[0] for row in db.execute(sql, {"user_id": user_id}).all()]
    return {
        "message": f"user_id {user_id}의 권한 조회 성공",
        "data": {
            "user_id": user_id,
            "roles": roles if roles else ["구매자"]
        }
    }


@router.patch("/users/{user_id}/role", summary="특정 회원 권한 변경 (호환용)")
@router.patch("/api/users/{user_id}/role", summary="특정 회원 권한 변경 (표준)")
def update_user_role(user_id: int, body: schemas.RoleUpdate, db: Session = Depends(get_db)):
    """
    특정 회원의 권한을 변경합니다.
    - 역할명('관리자', '판매자', '구매자' 등)을 role_id로 매핑하여 user_roles 갱신
    """
    role_map = {"관리자": 3, "판매자": 2, "구매자": 1, "손님": 1}
    target_role_id = role_map.get(body.role, 1)

    db.execute(text("DELETE FROM user_roles WHERE user_id = :user_id"), {"user_id": user_id})
    db.execute(
        text("INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (:user_id, :role_id, NOW())"),
        {"user_id": user_id, "role_id": target_role_id}
    )
    db.commit()
    return {
        "message": f"user_id {user_id}의 권한이 {body.role}(으)로 변경되었습니다.",
        "user_id": user_id,
        "new_role": body.role
    }


# =========================================================
# 4. 회사 정책 (CompanyPolicies.jsx)
# =========================================================
@router.get("/api/company-policies", summary="회사 운영 정책 목록 조회")
def get_company_policies(db: Session = Depends(get_db)):
    """회사 정책 및 약관 목록 조회"""
    sql = text("""
        SELECT
            cp.policy_id,
            cp.org_id,
            ou.org_name,
            cp.policy_code,
            cp.policy_name,
            cp.policy_version,
            cp.policy_content,
            DATE_FORMAT(cp.effective_from, '%Y-%m-%d') as effective_from,
            cp.active_yn
        FROM company_policies AS cp
        LEFT JOIN org_units AS ou ON cp.org_id = ou.org_id
        ORDER BY cp.policy_id
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


# =========================================================
# 5. 레거시/탐색용 원천 테이블 조회 API 지원
#    (song/frontend/src/App.jsx에서 호출하는 20여 개 테이블 조회)
# =========================================================
RAW_TABLES = [
    "order-items", "payments", "payment-transactions", "payment-webhook-events",
    "refund-policies", "refund-items", "buyer-inquiries", "inquiry-files",
    "policy-files", "product-variants", "inventories", "file-assets",
    "product-images", "product-files", "ai-providers", "rag-documents",
    "rag-document-files", "rag-chunks", "rag-embeddings", "rag-query-logs"
]

for table_slug in RAW_TABLES:
    actual_table = table_slug.replace("-", "_")

    def make_handler(t_name: str):
        def handler(db: Session = Depends(get_db)):
            try:
                res = db.execute(text(f"SELECT * FROM {t_name} LIMIT 100"))
                return [dict(row) for row in res.mappings().all()]
            except Exception:
                return []
        return handler

    router.add_api_route(
        f"/api/{table_slug}",
        make_handler(actual_table),
        methods=["GET"],
        summary=f"DB 테이블 탐색 ({actual_table})"
    )

