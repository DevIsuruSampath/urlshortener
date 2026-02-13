from __future__ import annotations

import os
import sys

import psycopg
from psycopg import OperationalError
from psycopg.sql import SQL, Identifier
from sqlalchemy.engine import make_url


def _to_psycopg_dsn(url: str) -> str:
    return url.replace("postgresql+psycopg://", "postgresql://", 1)


def ensure_database_exists() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("[bootstrap] DATABASE_URL is not set; skip DB bootstrap")
        return

    url = make_url(database_url)
    target_db = url.database
    if not target_db:
        print("[bootstrap] DATABASE_URL has no database name; skip DB bootstrap")
        return

    target_dsn = _to_psycopg_dsn(url.render_as_string(hide_password=False))

    # Fast path: DB already exists and is reachable.
    try:
        with psycopg.connect(target_dsn, connect_timeout=5) as conn:
            conn.execute("SELECT 1")
        print(f"[bootstrap] Database '{target_db}' is reachable")
        return
    except OperationalError as exc:
        msg = str(exc)
        if "does not exist" not in msg:
            raise

    admin_db = os.getenv("POSTGRES_ADMIN_DB", "postgres")
    admin_url = url.set(database=admin_db)
    admin_dsn = _to_psycopg_dsn(admin_url.render_as_string(hide_password=False))

    print(f"[bootstrap] Creating database '{target_db}' using admin DB '{admin_db}'")
    with psycopg.connect(admin_dsn, autocommit=True, connect_timeout=10) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
            exists = cur.fetchone() is not None
            if not exists:
                cur.execute(SQL("CREATE DATABASE {}").format(Identifier(target_db)))
                print(f"[bootstrap] Database '{target_db}' created")
            else:
                print(f"[bootstrap] Database '{target_db}' already exists")


def main() -> None:
    try:
        ensure_database_exists()
    except Exception as exc:  # pragma: no cover
        print(f"[bootstrap] Failed: {exc}", file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
