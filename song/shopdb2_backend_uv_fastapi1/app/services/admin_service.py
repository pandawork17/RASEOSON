from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import CompanyPolicy, Order, OrgUnit, Payment, RefundPolicy, RefundRequest, Role, User, UserRole
from app.schemas.admin import AdminDashboard, AdminPaymentRow, AdminPoliciesResponse, AdminRefundRow, AdminUserRow
from app.schemas.common import CompanyPolicySummary, OrgSummary, ProductCard, RefundPolicySummary
from app.services.common_service import list_product_cards, money


def get_admin_dashboard(db: Session) -> AdminDashboard:
    total_users = db.scalar(select(func.count(User.user_id))) or 0
    total_sellers = db.scalar(
        select(func.count(func.distinct(UserRole.user_id)))
        .join(Role, Role.role_id == UserRole.role_id)
        .where(Role.role_code == "SELLER")
    ) or 0
    total_buyers = db.scalar(
        select(func.count(func.distinct(UserRole.user_id)))
        .join(Role, Role.role_id == UserRole.role_id)
        .where(Role.role_code == "BUYER")
    ) or 0
    total_sales = db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.order_status.in_(("PAID", "SHIPPING", "DELIVERED", "COMPLETED")))
    ) or 0
    pending_refunds = db.scalar(
        select(func.count(RefundRequest.refund_request_id)).where(RefundRequest.refund_status.in_(("REQUESTED", "REVIEWING")))
    ) or 0

    monthly_sales_stmt = (
        select(func.date_format(Order.ordered_at, "%Y-%m"), func.count(Order.order_id), func.coalesce(func.sum(Order.total_amount), 0))
        .group_by(func.date_format(Order.ordered_at, "%Y-%m"))
        .order_by(func.date_format(Order.ordered_at, "%Y-%m").desc())
        .limit(6)
    )
    monthly_sales = [
        {"sales_month": month, "order_count": int(order_count), "sales_amount": money(sales_amount)}
        for month, order_count, sales_amount in db.execute(monthly_sales_stmt).all()
    ]
    monthly_sales.reverse()

    branch_sales_stmt = (
        select(OrgUnit.org_name, func.count(Order.order_id), func.coalesce(func.sum(Order.total_amount), 0))
        .outerjoin(Order, Order.org_id == OrgUnit.org_id)
        .group_by(OrgUnit.org_id, OrgUnit.org_name)
        .order_by(func.coalesce(func.sum(Order.total_amount), 0).desc())
    )
    branch_sales = [
        {"org_name": org_name, "order_count": int(order_count), "total_sales": money(total_sales)}
        for org_name, order_count, total_sales in db.execute(branch_sales_stmt).all()
    ]

    return AdminDashboard(
        stats={
            "total_users": int(total_users),
            "total_sellers": int(total_sellers),
            "total_buyers": int(total_buyers),
            "total_sales": money(total_sales),
            "pending_refunds": int(pending_refunds),
        },
        monthly_sales=monthly_sales,
        branch_sales=branch_sales,
    )


def get_admin_users(db: Session) -> list[AdminUserRow]:
    stmt = (
        select(User, OrgUnit, func.group_concat(Role.role_code))
        .outerjoin(OrgUnit, OrgUnit.org_id == User.org_id)
        .outerjoin(UserRole, UserRole.user_id == User.user_id)
        .outerjoin(Role, Role.role_id == UserRole.role_id)
        .group_by(User.user_id, OrgUnit.org_id)
        .order_by(User.user_id.asc())
    )
    rows = []
    for user, org, role_codes in db.execute(stmt).all():
        roles = role_codes.split(",") if role_codes else []
        rows.append(
            AdminUserRow(
                user_id=user.user_id,
                login_id=user.login_id,
                user_name=user.user_name,
                email=user.email,
                phone=user.phone,
                org=OrgSummary(org_id=org.org_id, org_name=org.org_name, org_type=org.org_type) if org else None,
                roles=roles,
                role_names=roles,
            )
        )
    return rows


def get_admin_payments(db: Session) -> list[AdminPaymentRow]:
    stmt = (
        select(Payment, Order.order_no, User.user_name)
        .join(Order, Order.order_id == Payment.order_id)
        .join(User, User.user_id == Order.buyer_user_id)
        .order_by(Payment.created_at.desc(), Payment.payment_id.desc())
    )
    return [
        AdminPaymentRow(
            payment_id=payment.payment_id,
            order_no=order_no,
            buyer_name=buyer_name,
            pg_provider=payment.pg_provider,
            payment_method=payment.payment_method,
            payment_status=payment.payment_status,
            requested_amount=money(payment.requested_amount),
            approved_amount=money(payment.approved_amount),
            approved_at=payment.approved_at,
        )
        for payment, order_no, buyer_name in db.execute(stmt).all()
    ]


def get_admin_refunds(db: Session) -> list[AdminRefundRow]:
    stmt = (
        select(RefundRequest, Order.order_no, User.user_name, RefundPolicy.policy_name)
        .join(Order, Order.order_id == RefundRequest.order_id)
        .join(User, User.user_id == RefundRequest.buyer_user_id)
        .outerjoin(RefundPolicy, RefundPolicy.refund_policy_id == RefundRequest.refund_policy_id)
        .order_by(RefundRequest.requested_at.desc(), RefundRequest.refund_request_id.desc())
    )
    return [
        AdminRefundRow(
            refund_request_id=refund.refund_request_id,
            order_no=order_no,
            buyer_name=buyer_name,
            policy_name=policy_name,
            refund_reason=refund.refund_reason,
            refund_status=refund.refund_status,
            requested_amount=money(refund.requested_amount),
            approved_amount=money(refund.approved_amount),
            requested_at=refund.requested_at,
        )
        for refund, order_no, buyer_name, policy_name in db.execute(stmt).all()
    ]


def get_admin_policies(db: Session) -> AdminPoliciesResponse:
    company_policies = [
        CompanyPolicySummary(
            policy_id=policy.policy_id,
            policy_code=policy.policy_code,
            policy_name=policy.policy_name,
            policy_version=policy.policy_version,
            policy_type=policy.policy_type,
            effective_from=policy.effective_from,
            effective_to=policy.effective_to,
        )
        for policy in db.scalars(select(CompanyPolicy).order_by(CompanyPolicy.effective_from.desc())).all()
    ]
    refund_policies = [
        RefundPolicySummary(
            refund_policy_id=policy.refund_policy_id,
            policy_name=policy.policy_name,
            allowed_days=policy.allowed_days,
            shipping_fee_payer=policy.shipping_fee_payer,
            refund_policy_text=policy.refund_policy_text,
            effective_from=policy.effective_from,
            effective_to=policy.effective_to,
        )
        for policy in db.scalars(select(RefundPolicy).order_by(RefundPolicy.effective_from.desc())).all()
    ]
    return AdminPoliciesResponse(company_policies=company_policies, refund_policies=refund_policies)


def get_admin_products(
    db: Session,
    *,
    search: str = "",
    product_status: str | None = None,
    category_id: int | None = None,
) -> list[ProductCard]:
    return list_product_cards(
        db,
        search=search,
        product_status=product_status,
        category_id=category_id,
        public_only=False,
    )


def list_orgs(db: Session) -> list[OrgSummary]:
    stmt = select(OrgUnit).order_by(OrgUnit.org_type.asc(), OrgUnit.org_name.asc())
    return [
        OrgSummary(org_id=org.org_id, org_name=org.org_name, org_type=org.org_type)
        for org in db.scalars(stmt).all()
    ]
