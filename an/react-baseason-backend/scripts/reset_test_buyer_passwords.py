"""Dev convenience: set a known password for the seeded demo buyer accounts.

The shopdb3jo backup ships buyer accounts (buyer01, buyer02, buyer03, buyer96,
buyer5) with placeholder/unusable password hashes, so nobody can actually log
in as them. This script overwrites just those hashes with a fixed, documented
test password so the storefront's "quick login" buyer picker works.

Run with: uv run python scripts/reset_test_buyer_passwords.py
"""

import datetime
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from sqlalchemy import select

from react_baseason_backend.database import SessionLocal
from react_baseason_backend.models import User
from react_baseason_backend.security import hash_password

TEST_PASSWORD = "buyer1234"
TARGET_LOGIN_IDS = ["buyer01", "buyer02", "buyer03", "buyer96", "buyer5"]


def main() -> None:
    db = SessionLocal()
    try:
        users = db.execute(select(User).where(User.login_id.in_(TARGET_LOGIN_IDS))).scalars().all()
        password_hash = hash_password(TEST_PASSWORD)

        for user in users:
            user.password_hash = password_hash
            user.updated_at = datetime.datetime.utcnow()
            print(f"reset password for {user.login_id} ({user.user_name})")

        db.commit()
        print(f"\nDone. {len(users)} buyer accounts now use password: {TEST_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
