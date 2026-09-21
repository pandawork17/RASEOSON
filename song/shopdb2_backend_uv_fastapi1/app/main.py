import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import ensure_runtime_schema


logger = logging.getLogger("shopdb2.backend")
upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.schema_ready = False
    app.state.schema_error = ""
    try:
        ensure_runtime_schema()
        app.state.schema_ready = True
    except Exception as exc:
        app.state.schema_error = str(exc)
        logger.exception("Runtime schema initialization failed.")
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    if getattr(app.state, "schema_ready", False):
        return {"status": "ok", "database": "ready"}
    return {
        "status": "degraded",
        "database": "unavailable",
        "detail": getattr(app.state, "schema_error", "Runtime schema initialization failed."),
    }


app.mount(settings.public_upload_base, StaticFiles(directory=upload_dir), name="uploads")
app.include_router(api_router, prefix=settings.api_v1_prefix)
