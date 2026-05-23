import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta

from app.core.config import settings


PASSWORD_HASH_PREFIX = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 120000


class AuthTokenError(Exception):
    pass


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("utf-8"))


def hash_password(password: str, *, iterations: int = PASSWORD_HASH_ITERATIONS) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return f"{PASSWORD_HASH_PREFIX}${iterations}${salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt, expected_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != PASSWORD_HASH_PREFIX:
        return False

    iterations = int(iterations_text)
    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return hmac.compare_digest(actual_digest, expected_digest)


def create_access_token(
    *,
    user_id: int,
    username: str,
    role_name: str,
    employee_id: int | None,
) -> tuple[str, int]:
    expires_in = settings.auth_token_ttl_minutes * 60
    expires_at = datetime.now(UTC) + timedelta(seconds=expires_in)
    payload = {
        "sub": user_id,
        "username": username,
        "role": role_name,
        "employee_id": employee_id,
        "exp": int(expires_at.timestamp()),
    }
    payload_text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    encoded_payload = _b64url_encode(payload_text.encode("utf-8"))
    signature = hmac.new(
        settings.auth_secret_key.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    encoded_signature = _b64url_encode(signature)
    return f"{encoded_payload}.{encoded_signature}", expires_in


def decode_access_token(token: str) -> dict:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
    except ValueError as exc:
        raise AuthTokenError("Invalid token format") from exc

    expected_signature = hmac.new(
        settings.auth_secret_key.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    actual_signature = _b64url_decode(encoded_signature)

    if not hmac.compare_digest(actual_signature, expected_signature):
        raise AuthTokenError("Invalid token signature")

    try:
        payload = json.loads(_b64url_decode(encoded_payload).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as exc:
        raise AuthTokenError("Invalid token payload") from exc

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise AuthTokenError("Token expiration is missing")
    if expires_at < int(datetime.now(UTC).timestamp()):
        raise AuthTokenError("Token has expired")

    return payload
