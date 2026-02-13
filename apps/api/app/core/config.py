from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")

    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/paidlink"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    jwt_secret: str = os.getenv("JWT_SECRET", "change_me")
    jwt_alg: str = os.getenv("JWT_ALG", "HS256")

    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    session_token_expire_minutes: int = int(os.getenv("SESSION_TOKEN_EXPIRE_MINUTES", "30"))
    redirect_token_expire_minutes: int = int(os.getenv("REDIRECT_TOKEN_EXPIRE_MINUTES", "10"))

    first_step_min_seconds: int = int(os.getenv("FIRST_STEP_MIN_SECONDS", "8"))
    next_step_min_seconds: int = int(os.getenv("NEXT_STEP_MIN_SECONDS", "3"))
    step_rate_limit_per_minute: int = int(os.getenv("STEP_RATE_LIMIT_PER_MINUTE", "60"))

    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))

    public_web_base_url: str = os.getenv("PUBLIC_WEB_BASE_URL", "http://localhost")
    public_api_base_url: str = os.getenv("PUBLIC_API_BASE_URL", "http://localhost/api")


settings = Settings()


def tiers_file_path() -> Path | None:
    env_path = os.getenv("TIERS_FILE_PATH")
    candidates = []
    if env_path:
        candidates.append(Path(env_path))

    resolved = Path(__file__).resolve()
    candidates.extend(
        [
            # host workspace layout
            resolved.parents[4] / "packages" / "shared" / "tiers.json",
            # container mounts
            Path("/packages/shared/tiers.json"),
            Path("/app/packages/shared/tiers.json"),
        ]
    )

    for path in candidates:
        if path.exists():
            return path
    return None


def load_tiers() -> dict:
    path = tiers_file_path()
    if not path:
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)
