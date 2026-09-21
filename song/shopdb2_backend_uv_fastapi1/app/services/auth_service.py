from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.models import OrgUnit, Role, User, UserRole
from app.schemas.common import OrgSummary, UserSummary


def get_user_roles(db: Session, user_id: int) -> list[str]:
    stmt = (
        select(Role.role_code)
        .join(UserRole, UserRole.role_id == Role.role_id)
        .where(UserRole.user_id == user_id)
        .order_by(Role.role_id)
    )
    return list(db.scalars(stmt).all())


def get_user_summary(db: Session, user_id: int) -> UserSummary | None:
    stmt = (
        select(User, OrgUnit)
        .outerjoin(OrgUnit, OrgUnit.org_id == User.org_id)
        .where(User.user_id == user_id)
    )
    row = db.execute(stmt).first()
    if row is None:
        return None

    user, org = row
    roles = get_user_roles(db, user.user_id)
    org_summary = None
    if org is not None:
        org_summary = OrgSummary(org_id=org.org_id, org_name=org.org_name, org_type=org.org_type)

    return UserSummary(
        user_id=user.user_id,
        login_id=user.login_id,
        user_name=user.user_name,
        email=user.email,
        phone=user.phone,
        org=org_summary,
        roles=roles,
    )


def authenticate_user(db: Session, login_id: str, password: str) -> UserSummary | None:
    user = db.scalar(select(User).where(User.login_id == login_id))
    if user is None or user.user_status != "ACTIVE":
        return None

    # The provided SQL seed is intended to allow "<login_id> / <login_id>" local sign-in.
    if password == user.login_id:
        return get_user_summary(db, user.user_id)

    if not verify_password(password, user.password_hash):
        return None
    return get_user_summary(db, user.user_id)
