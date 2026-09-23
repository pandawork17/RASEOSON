from fastapi import HTTPException
from sqlalchemy import text

from app.database import engine


def add_branch_routes(app):
    # ---------------------------------------------------------
    # 조직 목록 조회
    # ---------------------------------------------------------
    @app.get("/api/org-units")
    def get_org_units():
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

        try:
            with engine.connect() as connection:
                result = connection.execute(sql)
                return [dict(row) for row in result.mappings().all()]

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"조직 목록 조회 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 지사 등록
    # ---------------------------------------------------------
    @app.post("/api/org-units", status_code=201)
    def create_branch(org: dict):
        org_code = org.get("org_code")
        org_name = org.get("org_name")

        if not org_code or not org_name:
            raise HTTPException(
                status_code=400,
                detail="조직 코드와 조직명은 필수입니다.",
            )

        try:
            with engine.begin() as connection:
                duplicate = connection.execute(
                    text("""
                        SELECT org_id
                        FROM org_units
                        WHERE org_code = :org_code
                    """),
                    {"org_code": org_code},
                ).first()

                if duplicate:
                    raise HTTPException(
                        status_code=400,
                        detail="이미 사용 중인 조직 코드입니다.",
                    )

                result = connection.execute(
                    text("""
                        INSERT INTO org_units (
                            org_code,
                            org_name,
                            org_type,
                            parent_org_id,
                            phone,
                            email,
                            address1,
                            active_yn
                        ) VALUES (
                            :org_code,
                            :org_name,
                            'BRANCH',
                            1,
                            :phone,
                            :email,
                            :address1,
                            'Y'
                        )
                    """),
                    {
                        "org_code": org_code,
                        "org_name": org_name,
                        "phone": org.get("phone"),
                        "email": org.get("email"),
                        "address1": org.get("address1"),
                    },
                )

            return {
                "message": "지사가 등록되었습니다.",
                "org_id": result.lastrowid,
            }

        except HTTPException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"지사 등록 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 지사 정보 수정
    # ---------------------------------------------------------
    @app.put("/api/org-units/{org_id}")
    def update_branch(org_id: int, org: dict):
        try:
            with engine.begin() as connection:
                result = connection.execute(
                    text("""
                        UPDATE org_units
                        SET
                            org_name = :org_name,
                            phone = :phone,
                            email = :email,
                            address1 = :address1
                        WHERE org_id = :org_id
                    """),
                    {
                        "org_id": org_id,
                        "org_name": org.get("org_name"),
                        "phone": org.get("phone"),
                        "email": org.get("email"),
                        "address1": org.get("address1"),
                    },
                )

                if result.rowcount == 0:
                    raise HTTPException(
                        status_code=404,
                        detail="수정할 조직을 찾지 못했습니다.",
                    )

            return {
                "message": "지사 정보가 수정되었습니다.",
                "org_id": org_id,
            }

        except HTTPException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"지사 수정 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 지사 비활성화
    # ---------------------------------------------------------
    @app.patch("/api/org-units/{org_id}/deactivate")
    def deactivate_branch(org_id: int):
        try:
            with engine.begin() as connection:
                result = connection.execute(
                    text("""
                        UPDATE org_units
                        SET active_yn = 'N'
                        WHERE org_id = :org_id
                    """),
                    {"org_id": org_id},
                )

                if result.rowcount == 0:
                    raise HTTPException(
                        status_code=404,
                        detail="비활성화할 조직을 찾지 못했습니다.",
                    )

            return {
                "message": "지사가 비활성화되었습니다.",
                "org_id": org_id,
            }

        except HTTPException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"지사 비활성화 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 지사 재활성화
    # ---------------------------------------------------------
    @app.patch("/api/org-units/{org_id}/activate")
    def activate_branch(org_id: int):
        try:
            with engine.begin() as connection:
                result = connection.execute(
                    text("""
                        UPDATE org_units
                        SET active_yn = 'Y'
                        WHERE org_id = :org_id
                    """),
                    {"org_id": org_id},
                )

                if result.rowcount == 0:
                    raise HTTPException(
                        status_code=404,
                        detail="재활성화할 조직을 찾지 못했습니다.",
                    )

            return {
                "message": "지사가 재활성화되었습니다.",
                "org_id": org_id,
            }

        except HTTPException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"지사 재활성화 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 회원 목록 조회
    # ---------------------------------------------------------
    @app.get("/api/users")
    def get_users():
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
            LEFT JOIN org_units AS ou
                ON u.org_id = ou.org_id
            LEFT JOIN user_roles AS ur
                ON u.user_id = ur.user_id
            LEFT JOIN roles AS r
                ON ur.role_id = r.role_id
            LEFT JOIN seller_profiles AS sp
                ON u.user_id = sp.user_id
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

        try:
            with engine.connect() as connection:
                result = connection.execute(sql)
                return [dict(row) for row in result.mappings().all()]

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"회원 목록 조회 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 회원 배송지 조회
    # ---------------------------------------------------------
    @app.get("/api/users/{user_id}/addresses")
    def get_user_addresses(user_id: int):
        sql = text("""
            SELECT
                address_id,
                user_id,
                receiver_name,
                receiver_phone,
                address1,
                default_yn
            FROM user_addresses
            WHERE user_id = :user_id
            ORDER BY default_yn DESC, address_id
        """)

        try:
            with engine.connect() as connection:
                result = connection.execute(sql, {"user_id": user_id})
                return [dict(row) for row in result.mappings().all()]

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"회원 배송지 조회 중 오류가 발생했습니다: {error}",
            )

    # ---------------------------------------------------------
    # 회사 정책 목록 조회
    # ---------------------------------------------------------
    @app.get("/api/company-policies")
    def get_company_policies():
        sql = text("""
            SELECT
                cp.policy_id,
                cp.org_id,
                ou.org_name,
                cp.policy_code,
                cp.policy_name,
                cp.policy_version,
                cp.policy_content,
                cp.effective_from,
                cp.active_yn
            FROM company_policies AS cp
            LEFT JOIN org_units AS ou
                ON cp.org_id = ou.org_id
            ORDER BY cp.policy_id
        """)

        try:
            with engine.connect() as connection:
                result = connection.execute(sql)
                return [dict(row) for row in result.mappings().all()]

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"회사 정책 목록 조회 중 오류가 발생했습니다: {error}",
            )