"""Integration tests for the GET /api/stats/ endpoint."""

from __future__ import annotations

from datetime import timedelta

import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient

from todo.models import Color, Importance, Tag, TodoItem, TodoItemTag, TodoList

STATS_URL = "/api/stats/"


# ── Helpers ────────────────────────────────────────────────────────────────────


def make_color(owner: User, name: str = "c", hex_code: str = "#AABBCC") -> Color:
    return Color.objects.create(name=name, hex_code=hex_code, owner=owner)


def make_list(owner: User, name: str, color: Color) -> TodoList:
    return TodoList.objects.create(name=name, color=color, owner=owner)


def make_item(
    title: str,
    todo_list: TodoList,
    *,
    completed: bool = False,
    importance: int = Importance.NONE,
    due_date=None,
) -> TodoItem:
    return TodoItem.objects.create(
        title=title,
        list=todo_list,
        completed=completed,
        importance=importance,
        due_date=due_date,
    )


# ── Smoke ──────────────────────────────────────────────────────────────────────


@pytest.mark.smoke
@pytest.mark.django_db
def test_stats_endpoint_available(api_client: APIClient) -> None:
    assert api_client.get(STATS_URL).status_code == 200


# ── Empty state ────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_empty_db(api_client: APIClient) -> None:
    """All numeric stats are zero when the database is empty."""
    data = api_client.get(STATS_URL).json()

    totals = data["totals"]
    assert totals["lists"] == 0
    assert totals["items"] == 0
    assert totals["completed_items"] == 0
    assert totals["active_items"] == 0
    assert totals["colors"] == 0
    assert totals["tags"] == 0

    assert data["items_due_this_week"] == 0
    assert data["overdue_items"] == 0
    assert data["items_without_due_date"] == 0

    importance = data["importance_breakdown"]
    assert importance["none"] == 0
    assert importance["high"] == 0
    assert importance["medium"] == 0
    assert importance["low"] == 0

    assert data["top_lists"] == []
    assert data["top_tags"] == []


# ── Totals ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_totals(api_client: APIClient, user: User) -> None:
    """Totals correctly reflect the number of each resource in the database."""
    c1 = make_color(user, "Red", "#FF0000")
    c2 = make_color(user, "Blue", "#0000FF")
    tag1 = Tag.objects.create(name="t1", color=c1, owner=user)
    Tag.objects.create(name="t2", color=c2, owner=user)
    lst = make_list(user, "List A", c1)
    make_item("Item 1", lst)
    make_item("Item 2", lst)
    make_item("Item 3", lst, completed=True)

    data = api_client.get(STATS_URL).json()
    totals = data["totals"]

    assert totals["colors"] == 2
    assert totals["tags"] == 2
    assert totals["lists"] == 1
    assert totals["items"] == 3
    assert totals["completed_items"] == 1
    assert totals["active_items"] == 2

    # Tags count is total tags, not tag usage
    assert totals["tags"] == 2
    del tag1  # suppress unused variable warning


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_response_shape(api_client: APIClient) -> None:
    """Response contains all expected top-level keys."""
    data = api_client.get(STATS_URL).json()
    assert "totals" in data
    assert "items_due_this_week" in data
    assert "overdue_items" in data
    assert "items_without_due_date" in data
    assert "importance_breakdown" in data
    assert "top_lists" in data
    assert "top_tags" in data

    totals = data["totals"]
    for key in ("lists", "items", "completed_items", "active_items", "colors", "tags"):
        assert key in totals, f"Missing totals key: {key}"

    importance = data["importance_breakdown"]
    for key in ("none", "high", "medium", "low"):
        assert key in importance, f"Missing importance_breakdown key: {key}"


# ── Due date windows ───────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_due_this_week(api_client: APIClient, user: User) -> None:
    """Items with a due_date within the next 7 days are counted."""
    now = timezone.now()
    color = make_color(user)
    lst = make_list(user, "L", color)

    make_item("Due tomorrow", lst, due_date=now + timedelta(days=1))
    make_item("Due in 6 days", lst, due_date=now + timedelta(days=6))
    make_item("Due in 8 days", lst, due_date=now + timedelta(days=8))  # outside window
    make_item("No due date", lst)

    data = api_client.get(STATS_URL).json()
    assert data["items_due_this_week"] == 2


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_overdue(api_client: APIClient, user: User) -> None:
    """Incomplete items with a due_date in the past are counted as overdue."""
    now = timezone.now()
    color = make_color(user)
    lst = make_list(user, "L", color)

    make_item("Overdue 1", lst, due_date=now - timedelta(days=1))
    make_item("Overdue 2", lst, due_date=now - timedelta(days=10))
    make_item("Future", lst, due_date=now + timedelta(days=1))
    make_item("No date", lst)

    data = api_client.get(STATS_URL).json()
    assert data["overdue_items"] == 2


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_completed_excluded_from_due_counts(api_client: APIClient, user: User) -> None:
    """Completed items are not counted in overdue or due-this-week totals."""
    now = timezone.now()
    color = make_color(user)
    lst = make_list(user, "L", color)

    # These would be overdue/due-this-week if incomplete, but they're completed.
    make_item("Done overdue", lst, due_date=now - timedelta(days=2), completed=True)
    make_item("Done this week", lst, due_date=now + timedelta(days=1), completed=True)

    # One real overdue item that's still active.
    make_item("Still overdue", lst, due_date=now - timedelta(days=1))

    data = api_client.get(STATS_URL).json()
    assert data["overdue_items"] == 1
    assert data["items_due_this_week"] == 0


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_items_without_due_date(api_client: APIClient, user: User) -> None:
    """Only active items without a due_date are counted."""
    now = timezone.now()
    color = make_color(user)
    lst = make_list(user, "L", color)

    make_item("No date active", lst)
    make_item("No date active 2", lst)
    make_item("No date completed", lst, completed=True)  # excluded
    make_item("Has date", lst, due_date=now + timedelta(days=1))  # excluded

    data = api_client.get(STATS_URL).json()
    assert data["items_without_due_date"] == 2


# ── Importance breakdown ───────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_importance_breakdown(api_client: APIClient, user: User) -> None:
    """Importance breakdown counts only active items for each level."""
    color = make_color(user)
    lst = make_list(user, "L", color)

    make_item("High 1", lst, importance=Importance.HIGH)
    make_item("High 2", lst, importance=Importance.HIGH)
    make_item("Medium", lst, importance=Importance.MEDIUM)
    make_item("Low", lst, importance=Importance.LOW)
    make_item("None", lst, importance=Importance.NONE)
    # Completed — must not appear in breakdown
    make_item("Done High", lst, importance=Importance.HIGH, completed=True)

    data = api_client.get(STATS_URL).json()
    breakdown = data["importance_breakdown"]

    assert breakdown["high"] == 2
    assert breakdown["medium"] == 1
    assert breakdown["low"] == 1
    assert breakdown["none"] == 1


# ── Top lists ──────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_lists_ordered_by_item_count(api_client: APIClient, user: User) -> None:
    """top_lists is sorted descending by item_count."""
    color = make_color(user)
    small = make_list(user, "Small", color)
    large = make_list(user, "Large", color)

    make_item("A", large)
    make_item("B", large)
    make_item("C", large)
    make_item("D", small)

    data = api_client.get(STATS_URL).json()
    top = data["top_lists"]

    assert len(top) == 2
    assert top[0]["id"] == large.pk
    assert top[0]["item_count"] == 3
    assert top[1]["id"] == small.pk
    assert top[1]["item_count"] == 1


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_lists_completed_count(api_client: APIClient, user: User) -> None:
    """top_lists entry includes the correct completed_count for each list."""
    color = make_color(user)
    lst = make_list(user, "L", color)

    make_item("Active", lst)
    make_item("Done 1", lst, completed=True)
    make_item("Done 2", lst, completed=True)

    data = api_client.get(STATS_URL).json()
    entry = next(e for e in data["top_lists"] if e["id"] == lst.pk)

    assert entry["item_count"] == 3
    assert entry["completed_count"] == 2


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_lists_shape(api_client: APIClient, todo_list: TodoList) -> None:
    """Each entry in top_lists has the expected keys."""
    make_item("X", todo_list)
    data = api_client.get(STATS_URL).json()
    entry = data["top_lists"][0]
    for key in ("id", "name", "item_count", "completed_count"):
        assert key in entry, f"Missing top_lists key: {key}"


# ── Top tags ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_tags_ordered_by_usage(api_client: APIClient, user: User) -> None:
    """top_tags is sorted descending by usage_count."""
    color = make_color(user)
    lst = make_list(user, "L", color)

    tag_rare = Tag.objects.create(name="rare", color=color, owner=user)
    tag_common = Tag.objects.create(name="common", color=color, owner=user)

    item1 = make_item("Item 1", lst)
    item2 = make_item("Item 2", lst)
    item3 = make_item("Item 3", lst)

    TodoItemTag.objects.create(todo_item=item1, tag=tag_common)
    TodoItemTag.objects.create(todo_item=item2, tag=tag_common)
    TodoItemTag.objects.create(todo_item=item3, tag=tag_common)
    TodoItemTag.objects.create(todo_item=item1, tag=tag_rare)

    data = api_client.get(STATS_URL).json()
    top = data["top_tags"]

    assert len(top) == 2
    assert top[0]["id"] == tag_common.pk
    assert top[0]["usage_count"] == 3
    assert top[1]["id"] == tag_rare.pk
    assert top[1]["usage_count"] == 1


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_tags_unused_tag_included(api_client: APIClient, user: User) -> None:
    """Tags with zero usage still appear in top_tags with usage_count 0."""
    color = make_color(user)
    tag = Tag.objects.create(name="unused", color=color, owner=user)

    data = api_client.get(STATS_URL).json()
    top = data["top_tags"]

    assert len(top) == 1
    assert top[0]["id"] == tag.pk
    assert top[0]["usage_count"] == 0


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_top_tags_shape(api_client: APIClient, user: User) -> None:
    """Each entry in top_tags has the expected keys."""
    color = make_color(user)
    Tag.objects.create(name="t", color=color, owner=user)

    data = api_client.get(STATS_URL).json()
    entry = data["top_tags"][0]
    for key in ("id", "name", "usage_count"):
        assert key in entry, f"Missing top_tags key: {key}"
