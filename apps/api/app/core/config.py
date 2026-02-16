from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic import BaseModel


def _parse_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(",") if v.strip()]


def _parse_samesite(value: str | None) -> str:
    normalized = (value or "lax").strip().lower()
    return normalized if normalized in {"lax", "strict", "none"} else "lax"


class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")

    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/paidlink"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Secrets
    admin_jwt_secret: str = os.getenv("ADMIN_JWT_SECRET", os.getenv("JWT_SECRET", "change_me"))
    jwt_alg: str = os.getenv("JWT_ALG", "HS256")

    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    first_step_min_seconds: int = int(os.getenv("FIRST_STEP_MIN_SECONDS", "8"))
    next_step_min_seconds: int = int(os.getenv("NEXT_STEP_MIN_SECONDS", "3"))
    start_rate_limit_per_minute: int = int(os.getenv("START_RATE_LIMIT_PER_MINUTE", "120"))
    step_rate_limit_per_minute: int = int(os.getenv("STEP_RATE_LIMIT_PER_MINUTE", "60"))
    auth_rate_limit_per_minute: int = int(os.getenv("AUTH_RATE_LIMIT_PER_MINUTE", "20"))
    admin_setup_rate_limit_per_minute: int = int(os.getenv("ADMIN_SETUP_RATE_LIMIT_PER_MINUTE", "5"))
    admin_login_rate_limit_per_minute: int = int(os.getenv("ADMIN_LOGIN_RATE_LIMIT_PER_MINUTE", "10"))
    dev_api_rate_limit_per_minute: int = int(os.getenv("DEV_API_RATE_LIMIT_PER_MINUTE", "60"))
    admin_login_lockout_threshold: int = int(os.getenv("ADMIN_LOGIN_LOCKOUT_THRESHOLD", "10"))
    admin_login_lockout_minutes: int = int(os.getenv("ADMIN_LOGIN_LOCKOUT_MINUTES", "15"))
    admin_login_progressive_delay_max_seconds: int = int(os.getenv("ADMIN_LOGIN_PROGRESSIVE_DELAY_MAX_SECONDS", "2"))
    require_https_for_admin_setup: bool = _parse_bool(
        os.getenv("REQUIRE_HTTPS_FOR_ADMIN_SETUP"),
        os.getenv("APP_ENV", "development").lower() == "production",
    )

    admin_setup_token: str = os.getenv("ADMIN_SETUP_TOKEN", "")
    admin_session_cookie_name: str = os.getenv("ADMIN_SESSION_COOKIE_NAME", "paidlink_admin_session")

    cookie_secure: bool = _parse_bool(os.getenv("COOKIE_SECURE"), os.getenv("APP_ENV", "development").lower() == "production")
    cookie_samesite: str = _parse_samesite(os.getenv("COOKIE_SAMESITE"))
    cookie_domain: str | None = os.getenv("COOKIE_DOMAIN") or None
    cookie_httponly: bool = _parse_bool(os.getenv("COOKIE_HTTPONLY"), True)

    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))

    database_auto_create: bool = _parse_bool(os.getenv("DATABASE_AUTO_CREATE"), True)
    run_migrations: bool = _parse_bool(os.getenv("RUN_MIGRATIONS"), True)

    public_web_base_url: str = os.getenv("PUBLIC_WEB_BASE_URL", "http://localhost")
    public_api_base_url: str = os.getenv("PUBLIC_API_BASE_URL", "http://localhost/api")
    short_link_domain: str = os.getenv("SHORT_LINK_DOMAIN", "exa.com")
    interstitial_domain: str = os.getenv("INTERSTITIAL_DOMAIN", "adsexample.com")

    admin_api_tokens: list[str] = (
        _parse_csv(os.getenv("ADMIN_API_TOKENS"))
        or _parse_csv(os.getenv("ADMIN_API_TOKEN"))
        or _parse_csv(os.getenv("PUBLIC_API_TOKEN"))
    )


settings = Settings()


def tiers_file_path() -> Path | None:
    env_path = os.getenv("TIERS_FILE_PATH")
    candidates: list[Path] = []
    if env_path:
        candidates.append(Path(env_path))

    resolved = Path(__file__).resolve()

    # Try parent-relative package paths safely (works in both local repo and container layouts).
    for parent in resolved.parents:
        candidates.append(parent / "packages" / "shared" / "tiers.json")

    # Explicit container mount fallbacks.
    candidates.extend(
        [
            Path("/packages/shared/tiers.json"),
            Path("/app/packages/shared/tiers.json"),
        ]
    )

    seen: set[str] = set()
    for path in candidates:
        key = str(path)
        if key in seen:
            continue
        seen.add(key)

        if path.exists():
            return path
    return None


def load_tiers() -> dict:
    path = tiers_file_path()
    if not path:
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)
