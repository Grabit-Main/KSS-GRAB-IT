from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException, Header
from .config import settings


def create_token(profile: dict) -> str:
    now = datetime.now(timezone.utc)
    claims = {"sub": str(profile["id"]), "role": profile["role"], "iat": now, "exp": now + timedelta(days=7)}
    return jwt.encode(claims, settings().jwt_secret, algorithm="HS256")


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        return jwt.decode(authorization[7:], settings().jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(401, "Session expired or invalid") from exc


def require_roles(*roles):
    def check(user: dict = __import__("fastapi").Depends(current_user)):
        if user["role"] not in roles: raise HTTPException(403, "Insufficient permissions")
        return user
    return check
