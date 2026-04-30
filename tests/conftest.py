"""Shared pytest fixtures for the todo application test suite."""

from __future__ import annotations

import os

import pytest
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
    """Disable DRF throttling for all tests to prevent rate-limit interference."""
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_CLASSES": [],
    }


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def color(db) -> Color:
    return Color.objects.create(name="Test Red", hex_code="#FF0000")


@pytest.fixture
def tag(db, color: Color) -> Tag:
    return Tag.objects.create(name="urgent", color=color)


@pytest.fixture
def todo_list(db, color: Color) -> TodoList:
    return TodoList.objects.create(name="Test List", color=color)


@pytest.fixture
def todo_item(db, todo_list: TodoList) -> TodoItem:
    return TodoItem.objects.create(title="Test Item", list=todo_list)
