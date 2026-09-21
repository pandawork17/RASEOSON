from __future__ import annotations

import json
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import HTTPException
from sqlalchemy import BigInteger, Boolean, Date, DateTime, Float, Integer, MetaData, Numeric, String, Table, Text, cast, delete, func, inspect, or_, select, update
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.engine import RowMapping
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from sqlalchemy.sql.schema import Column

from app.schemas.admin import (
    AdminTableColumn,
    AdminTableCreateRequest,
    AdminTableDefinition,
    AdminTableDeleteRequest,
    AdminTableMutationResponse,
    AdminTableRowsResponse,
    AdminTableUpdateRequest,
)


ALLOWED_ADMIN_TABLES: tuple[str, ...] = (
    "org_units",
    "users",
    "roles",
    "user_roles",
    "seller_profiles",
    "user_addresses",
    "categories",
    "products",
    "file_assets",
    "product_images",
    "product_files",
    "product_variants",
    "inventories",
    "orders",
    "order_items",
    "payments",
    "payment_transactions",
    "payment_webhook_events",
    "company_policies",
    "policy_files",
    "refund_policies",
    "refund_requests",
    "refund_items",
    "ai_providers",
    "rag_documents",
    "rag_document_files",
    "rag_chunks",
    "rag_embeddings",
    "rag_query_logs",
)


def _serialize_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def _serialize_row(row: RowMapping) -> dict[str, Any]:
    return {key: _serialize_value(value) for key, value in row.items()}


def _column_schema(column: Column[Any]) -> AdminTableColumn:
    return AdminTableColumn(
        name=column.name,
        type=str(column.type),
        nullable=bool(column.nullable),
        default_value=str(column.default.arg) if column.default is not None and getattr(column.default, "arg", None) is not None else None,
        is_primary_key=bool(column.primary_key),
        is_auto_increment=bool(column.autoincrement and column.autoincrement != False),
    )


def _load_table(db: Session, table_name: str) -> Table:
    if table_name not in ALLOWED_ADMIN_TABLES:
        raise HTTPException(status_code=404, detail="Table is not allowed for admin CRUD.")

    bind = db.get_bind()
    inspector = inspect(bind)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table does not exist in the current database.")

    return Table(table_name, MetaData(), autoload_with=bind)


def _table_definition(db: Session, table: Table) -> AdminTableDefinition:
    row_count = int(db.scalar(select(func.count()).select_from(table)) or 0)
    return AdminTableDefinition(
        table_name=table.name,
        row_count=row_count,
        primary_keys=[column.name for column in table.primary_key.columns],
        columns=[_column_schema(column) for column in table.columns],
    )


def list_admin_table_definitions(db: Session) -> list[AdminTableDefinition]:
    bind = db.get_bind()
    available_tables = set(inspect(bind).get_table_names())
    definitions: list[AdminTableDefinition] = []

    for table_name in ALLOWED_ADMIN_TABLES:
        if table_name not in available_tables:
            continue
        table = Table(table_name, MetaData(), autoload_with=bind)
        definitions.append(_table_definition(db, table))

    return definitions


def _build_search_clause(table: Table, search: str, search_column: str):
    normalized = search.strip()
    if not normalized:
        return None

    if search_column != "_all" and search_column not in table.c:
        raise HTTPException(status_code=400, detail=f"Unknown search column `{search_column}`.")

    columns = list(table.columns) if search_column == "_all" else [table.c[search_column]]
    search_pattern = f"%{normalized}%"
    return or_(*[cast(column, String).ilike(search_pattern) for column in columns])


def get_admin_table_rows(
    db: Session,
    table_name: str,
    limit: int = 20,
    offset: int = 0,
    search: str = "",
    search_column: str = "_all",
) -> AdminTableRowsResponse:
    table = _load_table(db, table_name)
    definition = _table_definition(db, table)
    search_clause = _build_search_clause(table, search, search_column)

    pk_columns = list(table.primary_key.columns)
    order_by_columns = pk_columns or list(table.columns)[:1]
    stmt = select(table).limit(limit).offset(offset)
    filtered_count_stmt = select(func.count()).select_from(table)
    if search_clause is not None:
        stmt = stmt.where(search_clause)
        filtered_count_stmt = filtered_count_stmt.where(search_clause)
    for column in order_by_columns:
        stmt = stmt.order_by(column.asc())

    rows = db.execute(stmt).mappings().all()
    filtered_row_count = int(db.scalar(filtered_count_stmt) or 0)
    return AdminTableRowsResponse(
        table_name=table.name,
        row_count=definition.row_count,
        filtered_row_count=filtered_row_count,
        primary_keys=definition.primary_keys,
        columns=definition.columns,
        rows=[_serialize_row(row) for row in rows],
        limit=limit,
        offset=offset,
        search=search.strip(),
        search_column=search_column,
    )


def _parse_datetime(value: str) -> datetime:
    normalized = value.strip().replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed


def _coerce_value(column: Column[Any], value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        trimmed = value.strip()
        if trimmed == "" and column.nullable:
            return None
        value = trimmed

    column_type = column.type

    if isinstance(column_type, JSON):
        if isinstance(value, str):
            return json.loads(value)
        return value
    if isinstance(column_type, (Integer, BigInteger)):
        return int(value)
    if isinstance(column_type, (Numeric, Float)):
        return Decimal(str(value))
    if isinstance(column_type, DateTime):
        if isinstance(value, datetime):
            return value
        return _parse_datetime(str(value))
    if isinstance(column_type, Date):
        if isinstance(value, date):
            return value
        return date.fromisoformat(str(value))
    if isinstance(column_type, Boolean):
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in {"1", "true", "y", "yes"}
    if isinstance(column_type, (String, Text)):
        return str(value)
    return value


def _normalize_data(table: Table, payload: dict[str, Any], *, allow_primary_key: bool) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for column in table.columns:
        if column.name not in payload:
            continue
        if not allow_primary_key and column.primary_key and column.autoincrement:
            continue
        raw_value = payload[column.name]
        if isinstance(raw_value, str) and raw_value.strip() == "":
            if column.nullable:
                normalized[column.name] = None
                continue
            if column.default is not None or column.server_default is not None:
                continue
            if isinstance(column.type, (Integer, BigInteger, Numeric, Float, DateTime, Date, JSON, Boolean)):
                continue
        try:
            normalized[column.name] = _coerce_value(column, raw_value)
        except (TypeError, ValueError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=400, detail=f"Invalid value for `{column.name}`: {exc}") from exc
    return normalized


def _pk_payload(table: Table, payload: dict[str, Any]) -> dict[str, Any]:
    primary_key: dict[str, Any] = {}
    for column in table.primary_key.columns:
        if column.name not in payload:
            raise HTTPException(status_code=400, detail=f"Primary key `{column.name}` is required.")
        try:
            primary_key[column.name] = _coerce_value(column, payload[column.name])
        except (TypeError, ValueError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=400, detail=f"Invalid primary key `{column.name}`: {exc}") from exc
    return primary_key


def _get_existing_row(db: Session, table: Table, primary_key: dict[str, Any]) -> RowMapping:
    stmt = select(table)
    for column_name, value in primary_key.items():
        stmt = stmt.where(table.c[column_name] == value)
    row = db.execute(stmt).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Target row was not found.")
    return row


def create_admin_table_row(
    db: Session,
    table_name: str,
    payload: AdminTableCreateRequest,
) -> AdminTableMutationResponse:
    table = _load_table(db, table_name)
    data = _normalize_data(table, payload.data, allow_primary_key=True)
    if not data:
        raise HTTPException(status_code=400, detail="At least one column value is required.")

    try:
        result = db.execute(table.insert().values(**data))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Insert failed: {exc.orig}") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Insert failed: {exc}") from exc

    primary_key = {
        column.name: value
        for column, value in zip(table.primary_key.columns, result.inserted_primary_key, strict=False)
        if value is not None
    }
    if len(primary_key) != len(table.primary_key.columns):
        for column in table.primary_key.columns:
            if column.name in data:
                primary_key[column.name] = data[column.name]

    row = _serialize_row(_get_existing_row(db, table, _pk_payload(table, primary_key)))
    return AdminTableMutationResponse(table_name=table.name, primary_key=primary_key, row=row)


def update_admin_table_row(
    db: Session,
    table_name: str,
    payload: AdminTableUpdateRequest,
) -> AdminTableMutationResponse:
    table = _load_table(db, table_name)
    primary_key = _pk_payload(table, payload.primary_key)
    data = _normalize_data(table, payload.data, allow_primary_key=True)
    if not data:
        raise HTTPException(status_code=400, detail="At least one updated column value is required.")

    _get_existing_row(db, table, primary_key)
    stmt = update(table)
    for column_name, value in primary_key.items():
        stmt = stmt.where(table.c[column_name] == value)

    try:
        db.execute(stmt.values(**data))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Update failed: {exc.orig}") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Update failed: {exc}") from exc

    refreshed_primary_key = {**primary_key}
    for column in table.primary_key.columns:
        if column.name in data:
            refreshed_primary_key[column.name] = data[column.name]

    row = _serialize_row(_get_existing_row(db, table, refreshed_primary_key))
    return AdminTableMutationResponse(table_name=table.name, primary_key=refreshed_primary_key, row=row)


def delete_admin_table_row(
    db: Session,
    table_name: str,
    payload: AdminTableDeleteRequest,
) -> AdminTableMutationResponse:
    table = _load_table(db, table_name)
    primary_key = _pk_payload(table, payload.primary_key)
    existing_row = _serialize_row(_get_existing_row(db, table, primary_key))

    stmt = delete(table)
    for column_name, value in primary_key.items():
        stmt = stmt.where(table.c[column_name] == value)

    try:
        db.execute(stmt)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Delete failed: {exc.orig}") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Delete failed: {exc}") from exc

    return AdminTableMutationResponse(table_name=table.name, primary_key=primary_key, row=existing_row)
