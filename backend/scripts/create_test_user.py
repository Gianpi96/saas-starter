"""
Creates a test user for E2E / CI runs.
Usage: python scripts/create_test_user.py --email test@example.com --password secret
"""
import asyncio
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from database import AsyncSessionLocal, create_tables
from models import User
from security import hash_password


async def create_test_user(email: str, password: str) -> None:
    await create_tables()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            print(f"User {email} already exists — skipping")
            return

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name="Test User",
            is_active=True,
            is_verified=True,
        )
        session.add(user)
        await session.commit()
        print(f"Created test user: {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    asyncio.run(create_test_user(args.email, args.password))
