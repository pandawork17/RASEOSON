from functools import cached_property

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "shopdb2 platform api"
    api_v1_prefix: str = "/api/v1"
    debug: bool = True
    secret_key: str = "change-this-to-a-32-char-secret-key"
    access_token_expire_minutes: int = 720

    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "shopdbid2"
    mysql_password: str = "shopdbid2"
    mysql_database: str = "shopdb2"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
    upload_dir: str = "./uploads"
    public_upload_base: str = "/uploads"
    frontend_base_url: str = "http://127.0.0.1:4173"
    toss_payments_client_key: str | None = None
    toss_payments_secret_key: str | None = None

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "y", "on", "dev", "debug", "development"}:
                return True
            if normalized in {"0", "false", "no", "n", "off", "prod", "production", "release"}:
                return False
        return bool(value)

    @cached_property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}?charset=utf8mb4"
        )

    @cached_property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def toss_payments_enabled(self) -> bool:
        return bool(self.toss_payments_client_key and self.toss_payments_secret_key)


settings = Settings()
