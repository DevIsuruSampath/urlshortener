from __future__ import annotations

import argparse
import secrets
import string
import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.services.admin_user_service import get_primary_admin_user

SYMBOLS = "!@#$%^&*-_=+"


def _generate_password(length: int = 18) -> str:
    alphabet = string.ascii_letters + string.digits + SYMBOLS

    while True:
        password = "".join(secrets.choice(alphabet) for _ in range(length))
        if (
            any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in SYMBOLS for c in password)
        ):
            return password


def reset_admin_password() -> int:
    with SessionLocal() as db:
        user = get_primary_admin_user(db)
        if not user:
            print("Admin user not found. Run /admin/setup first.", file=sys.stderr)
            return 1

        new_password = _generate_password()
        user.password_hash = hash_password(new_password)
        db.commit()

    print(f"New admin password: {new_password} (copy this)")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="PaidLink admin utility commands")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("reset-admin-password", help="Generate and set a new random admin password")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "reset-admin-password":
        return reset_admin_password()

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
