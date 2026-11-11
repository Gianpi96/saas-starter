"""Test di abuso sui token JWT (non servono database ne' Redis).

Esegui da backend/:  pytest tests
Servono le variabili d'ambiente di config.py (DATABASE_URL, REDIS_URL, JWT_SECRET_KEY...).
"""
import time

import jwt
import pytest
from jwt import PyJWTError

import security


def test_roundtrip_access_token():
    payload = security.decode_token(security.create_access_token({"sub": "user-1"}))
    assert payload["sub"] == "user-1"
    assert payload["type"] == "access"


def test_refresh_token_has_refresh_type():
    payload = security.decode_token(security.create_refresh_token({"sub": "user-1"}))
    assert payload["type"] == "refresh"


def test_tampered_token_is_rejected():
    token = security.create_access_token({"sub": "user-1"})
    tampered = token[:-3] + ("AAA" if not token.endswith("AAA") else "BBB")
    with pytest.raises(PyJWTError):
        security.decode_token(tampered)


def test_expired_token_is_rejected():
    expired = jwt.encode(
        {"sub": "user-1", "exp": int(time.time()) - 10},
        security.settings.jwt_secret_key,
        algorithm=security.settings.jwt_algorithm,
    )
    with pytest.raises(PyJWTError):
        security.decode_token(expired)


def test_token_signed_with_other_key_is_rejected():
    forged = jwt.encode({"sub": "user-1"}, "un-altro-segreto-lungo-almeno-32-caratteri!", algorithm="HS256")
    with pytest.raises(PyJWTError):
        security.decode_token(forged)


def test_alg_none_is_rejected():
    unsigned = jwt.encode({"sub": "user-1"}, None, algorithm="none")
    with pytest.raises(PyJWTError):
        security.decode_token(unsigned)
