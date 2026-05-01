"""Integration tests for the TodoItem API endpoints."""

from __future__ import annotations

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from todo.models import Color, Importance, Tag, TodoItem, TodoList


def items_url(list_pk: int) -> str:
    return f"/api/lists/{list_pk}/items/"


def item_url(list_pk: int, item_pk: int) -> str:
    return f"/api/lists/{list_pk}/items/{item_pk}/"


def reorder_url(list_pk: int) -> str:
    return f"/api/lists/{list_pk}/items/reorder/"


# ── List ───────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_list_empty(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.get(items_url(todo_list.pk))
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_list_returns_existing(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.get(items_url(todo_item.list.pk))
    assert response.status_code == 200
    data = response.json()["results"]
    assert len(data) == 1
    assert data[0]["id"] == todo_item.pk
    assert data[0]["title"] == todo_item.title


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_list_scoped_to_list(
    api_client: APIClient, color: Color, todo_item: TodoItem, user: User
) -> None:
    """Items from a different list must not appear."""
    other_list = TodoList.objects.create(name="Other List", color=color, owner=user)
    TodoItem.objects.create(title="Other Item", list=other_list)

    response = api_client.get(items_url(todo_item.list.pk))
    assert response.status_code == 200
    assert len(response.json()["results"]) == 1


# ── Create ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.post(
        items_url(todo_list.pk), {"title": "Buy milk"}, format="json"
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy milk"
    assert data["completed"] is False
    assert data["priority"] == 0


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create_with_tags(
    api_client: APIClient, todo_list: TodoList, tag: Tag
) -> None:
    response = api_client.post(
        items_url(todo_list.pk),
        {"title": "Tagged item", "tag_ids": [tag.pk]},
        format="json",
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["tags"]) == 1
    assert data["tags"][0]["id"] == tag.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create_requires_title(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.post(items_url(todo_list.pk), {}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create_priority_auto_increments(
    api_client: APIClient, todo_list: TodoList
) -> None:
    api_client.post(items_url(todo_list.pk), {"title": "First"}, format="json")
    response = api_client.post(
        items_url(todo_list.pk), {"title": "Second"}, format="json"
    )
    assert response.json()["priority"] == 1


# ── Retrieve ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_retrieve(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.get(item_url(todo_item.list.pk, todo_item.pk))
    assert response.status_code == 200
    assert response.json()["id"] == todo_item.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_retrieve_not_found(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.get(item_url(todo_list.pk, 999))
    assert response.status_code == 404


# ── Update ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_update_title(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.patch(
        item_url(todo_item.list.pk, todo_item.pk),
        {"title": "Updated title"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_mark_complete(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.patch(
        item_url(todo_item.list.pk, todo_item.pk),
        {"completed": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["completed"] is True


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_set_importance(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.patch(
        item_url(todo_item.list.pk, todo_item.pk),
        {"importance": Importance.HIGH},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["importance"] == Importance.HIGH


# ── Delete ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_delete(api_client: APIClient, todo_item: TodoItem) -> None:
    response = api_client.delete(item_url(todo_item.list.pk, todo_item.pk))
    assert response.status_code == 204
    assert not TodoItem.objects.filter(pk=todo_item.pk).exists()


# ── Reorder ────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_reorder(api_client: APIClient, todo_list: TodoList) -> None:
    a = TodoItem.objects.create(title="A", list=todo_list, priority=0)
    b = TodoItem.objects.create(title="B", list=todo_list, priority=1)
    c = TodoItem.objects.create(title="C", list=todo_list, priority=2)

    response = api_client.post(
        reorder_url(todo_list.pk),
        {"order": [c.pk, a.pk, b.pk]},
        format="json",
    )
    assert response.status_code == 204

    a.refresh_from_db()
    b.refresh_from_db()
    c.refresh_from_db()
    assert c.priority == 0
    assert a.priority == 1
    assert b.priority == 2


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_reorder_rejects_invalid_ids(
    api_client: APIClient, todo_list: TodoList
) -> None:
    response = api_client.post(
        reorder_url(todo_list.pk), {"order": [999, 1000]}, format="json"
    )
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_reorder_rejects_non_list_payload(
    api_client: APIClient, todo_list: TodoList
) -> None:
    response = api_client.post(
        reorder_url(todo_list.pk), {"order": "not-a-list"}, format="json"
    )
    assert response.status_code == 400
