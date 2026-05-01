"""Integration tests for the authentication endpoints."""

from __future__ import annotations

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

LOGIN_URL = "/api/auth/login/"
LOGOUT_URL = "/api/auth/logout/"
ME_URL = "/api/auth/me/"


@pytest.fixture
def credentials() -> dict[str, str]:
    return {"username": "authuser", "password": "securepass99"}


@pytest.fixture
def auth_user(db, credentials: dict[str, str]) -> User:
    return User.objects.create_user(**credentials)


# ── Login ──────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_success(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    response = anon_client.post(LOGIN_URL, credentials, format="json")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == auth_user.pk
    assert data["username"] == auth_user.username


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_sets_session_cookie(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    response = anon_client.post(LOGIN_URL, credentials, format="json")
    assert response.status_code == 200
    assert "sessionid" in response.cookies


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_sets_csrf_cookie(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    response = anon_client.post(LOGIN_URL, credentials, format="json")
    assert response.status_code == 200
    assert "csrftoken" in response.cookies


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_invalid_password(anon_client: APIClient, auth_user: User) -> None:
    response = anon_client.post(
        LOGIN_URL, {"username": auth_user.username, "password": "wrong"}, format="json"
    )
    assert response.status_code == 401


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_unknown_user(anon_client: APIClient, db: None) -> None:
    response = anon_client.post(
        LOGIN_URL, {"username": "nobody", "password": "pass"}, format="json"
    )
    assert response.status_code == 401


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_missing_both_fields(anon_client: APIClient, db: None) -> None:
    response = anon_client.post(LOGIN_URL, {}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_missing_password(anon_client: APIClient, db: None) -> None:
    response = anon_client.post(LOGIN_URL, {"username": "user"}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_missing_username(anon_client: APIClient, db: None) -> None:
    response = anon_client.post(LOGIN_URL, {"password": "pass"}, format="json")
    assert response.status_code == 400


# ── Logout ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_logout_returns_204(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    anon_client.post(LOGIN_URL, credentials, format="json")
    response = anon_client.post(LOGOUT_URL)
    assert response.status_code == 204


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_logout_without_session_returns_204(anon_client: APIClient, db: None) -> None:
    """Logout of an already-expired or non-existent session must not 403."""
    response = anon_client.post(LOGOUT_URL)
    assert response.status_code == 204


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_logout_invalidates_session(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    anon_client.post(LOGIN_URL, credentials, format="json")
    anon_client.post(LOGOUT_URL)
    response = anon_client.get(ME_URL)
    # SessionAuthentication does not send WWW-Authenticate, so DRF returns 403
    # (not 401) for unauthenticated requests — both indicate access is denied.
    assert response.status_code == 403


# ── Me ─────────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_me_unauthenticated(anon_client: APIClient, db: None) -> None:
    # SessionAuthentication does not advertise WWW-Authenticate, so DRF returns
    # 403 (not 401) for unauthenticated session-based requests per RFC 7235.
    response = anon_client.get(ME_URL)
    assert response.status_code == 403


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_me_after_login(
    anon_client: APIClient, auth_user: User, credentials: dict[str, str]
) -> None:
    anon_client.post(LOGIN_URL, credentials, format="json")
    response = anon_client.get(ME_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == auth_user.pk
    assert data["username"] == auth_user.username


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_me_force_authenticated(api_client: APIClient, user: User) -> None:
    """me/ returns the correct user identity when force-authenticated."""
    response = api_client.get(ME_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user.pk
    assert data["username"] == user.username


# ── Rate limiting ──────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_login_rate_limit_after_five_attempts(db: None) -> None:
    """Login endpoint returns 429 after 5 consecutive attempts from the same IP."""
    from django.core.cache import cache
    from rest_framework.throttling import SimpleRateThrottle

    # disable_throttling (autouse) raises THROTTLE_RATES["login"] to 10000/minute
    # in-place. Lower it to the real limit for this test and start with an empty
    # throttle cache so the counter begins at zero.
    SimpleRateThrottle.THROTTLE_RATES["login"] = "5/minute"
    cache.clear()

    client = APIClient()
    for _ in range(5):
        client.post(LOGIN_URL, {"username": "x", "password": "x"}, format="json")
    response = client.post(LOGIN_URL, {"username": "x", "password": "x"}, format="json")
    assert response.status_code == 429
