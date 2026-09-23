from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ---------------------------------------------------------
# 3. 회원 권한 조회 및 변경 API (roles, user_roles)
# ---------------------------------------------------------

# 권한 변경 요청을 위한 Pydantic 모델
class RoleUpdate(BaseModel):
    role: str  # 예: '관리자', '판매자', '손님' 등

# 3-1. 특정 회원의 권한 조회 API
@router.get("/users/{user_id}/roles")
def get_user_roles(user_id: int):
    # TODO: 실제 DB에서 user_id에 해당하는 권한 조회 쿼리 실행
    # SELECT * FROM user_roles WHERE user_id = %s;
    return {
        "message": f"user_id {user_id}의 권한 조회 성공",
        "data": {
            "user_id": user_id,
            "roles": ["판매자"]
        }
    }

# 3-2. 특정 회원의 권한 변경 API
@router.patch("/users/{user_id}/role")
def update_user_role(user_id: int, body: RoleUpdate):
    # TODO: 실제 DB에서 회원의 권한을 업데이트하는 쿼리 실행
    # UPDATE user_roles SET role_name = %s WHERE user_id = %s;
    return {
        "message": f"user_id {user_id}의 권한이 {body.role}(으)로 변경되었습니다.",
        "user_id": user_id,
        "new_role": body.role
    }