"""Shared pytest fixtures for the todo application test suite."""

from __future__ import annotations

import os

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from todo.models import Color, Tag, TodoItem, TodoList


@pytest.fixture(scope="session")
def django_db_setup(
    request,
    django_test_environment,
    django_db_blocker,
):
    """Override database settings to use explicit env vars instead of the service file.

    Makes tests portable across environments that may not have a pg_service.conf file.
    """
    from django.conf import settings
    from django.test.utils import setup_databases, teardown_databases

    # Update in-place to preserve Django's ensure_defaults values (e.g.
    # ATOMIC_REQUESTS, AUTOCOMMIT) while swapping the service-file-based
    # connection params for explicit env-var equivalents.
    settings.DATABASES["default"].update(
        {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "postgres"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
            "PORT": os.environ.get("DB_PORT", "5432"),
            "ATOMIC_REQUESTS": False,
            "AUTOCOMMIT": True,
            "CONN_MAX_AGE": 0,
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": {},  # clear service / passfile entries
            "TIME_ZONE": None,
            "DISABLE_SERVER_SIDE_CURSORS": False,
        }
    )

    # Reset any connections that cached the original service-file settings.
    from django.db import connections

    connections.close_all()

    with django_db_blocker.unblock():
        old_config = setup_databases(verbosity=0, interactive=False)

    def teardown() -> None:
        with django_db_blocker.unblock():
            teardown_databases(old_config, verbosity=0)

    request.addfinalizer(teardown)


@pytest.fixture(autouse=True)
def disable_throttling(settings) -> None:
    """Disable DRF throttling for all tests to prevent rate-limit interference.

    Clears the cache (resets throttle counters) and raises all rates to an
    effectively unlimited ceiling. This handles both DEFAULT_THROTTLE_CLASSES
    and view-level @throttle_classes decorators (e.g. LoginRateThrottle).

    SimpleRateThrottle.THROTTLE_RATES is a class-level attribute captured at
    module import time and is not updated by setting_changed. It is mutated
    in-place here so that LoginRateThrottle (bound via @throttle_classes) also
    sees the unlimited ceiling.
    """
    from django.core.cache import cache
    from rest_framework.throttling import SimpleRateThrottle

    cache.clear()
    current_rates = settings.REST_FRAMEWORK.get("DEFAULT_THROTTLE_RATES", {})
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {
            **current_rates,
            "anon": "10000/minute",
            "user": "10000/minute",
            "login": "10000/minute",
        },
    }
    SimpleRateThrottle.THROTTLE_RATES["login"] = "10000/minute"


@pytest.fixture
def user(db) -> User:
    """Default test user. All api_client requests run as this user."""
    return User.objects.create_user(username="testuser", password="testpass123")


@pytest.fixture
def api_client(user: User) -> APIClient:
    """APIClient force-authenticated as the default test user.

    Uses force_authenticate to bypass the session mechanism — tests using this
    client focus on endpoint business logic, not the auth flow itself.
    """
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client() -> APIClient:
    """Unauthenticated APIClient for testing the auth endpoints directly."""
    return APIClient()


@pytest.fixture
def color(db, user: User) -> Color:
    return Color.objects.create(name="Test Red", hex_code="#FF0000", owner=user)


@pytest.fixture
def tag(db, user: User, color: Color) -> Tag:
    return Tag.objects.create(name="urgent", color=color, owner=user)


@pytest.fixture
def todo_list(db, user: User, color: Color) -> TodoList:
    return TodoList.objects.create(name="Test List", color=color, owner=user)


@pytest.fixture
def todo_item(db, todo_list: TodoList) -> TodoItem:
    return TodoItem.objects.create(title="Test Item", list=todo_list)
