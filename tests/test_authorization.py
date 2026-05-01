"""Cross-user authorization tests.

Verifies that a second authenticated user cannot read, write, or reference
data that belongs to the first user. Every resource type (Color, Tag, TodoList,
TodoItem) and the stats aggregation endpoint are covered.
"""

from __future__ import annotations

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from todo.models import Color, Tag, TodoItem, TodoList

# ── Fixtures ───────────────────────────────────────────────────────────────────
# The `color`, `tag`, `todo_list`, and `todo_item` conftest fixtures are all
# owned by `user` (the default test user). `other_api_client` is authenticated
# as `other_user`, who owns none of those objects.


# ── Colors ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_list_hidden_from_other_user(
    other_api_client: APIClient, color: Color
) -> None:
    """other_user's color list is empty even though user's color exists."""
    response = other_api_client.get("/api/colors/")
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_retrieve_returns_404_for_other_user(
    other_api_client: APIClient, color: Color
) -> None:
    response = other_api_client.get(f"/api/colors/{color.pk}/")
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_update_returns_404_for_other_user(
    other_api_client: APIClient, color: Color
) -> None:
    response = other_api_client.patch(
        f"/api/colors/{color.pk}/", {"name": "Hijacked"}, format="json"
    )
    assert response.status_code == 404
    color.refresh_from_db()
    assert color.name != "Hijacked"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_delete_returns_404_for_other_user(
    other_api_client: APIClient, color: Color
) -> None:
    response = other_api_client.delete(f"/api/colors/{color.pk}/")
    assert response.status_code == 404
    assert Color.objects.filter(pk=color.pk).exists()


# ── Tags ───────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_list_hidden_from_other_user(other_api_client: APIClient, tag: Tag) -> None:
    response = other_api_client.get("/api/tags/")
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_retrieve_returns_404_for_other_user(
    other_api_client: APIClient, tag: Tag
) -> None:
    response = other_api_client.get(f"/api/tags/{tag.pk}/")
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_update_returns_404_for_other_user(
    other_api_client: APIClient, tag: Tag
) -> None:
    response = other_api_client.patch(
        f"/api/tags/{tag.pk}/", {"name": "hijacked"}, format="json"
    )
    assert response.status_code == 404
    tag.refresh_from_db()
    assert tag.name != "hijacked"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_delete_returns_404_for_other_user(
    other_api_client: APIClient, tag: Tag
) -> None:
    response = other_api_client.delete(f"/api/tags/{tag.pk}/")
    assert response.status_code == 404
    assert Tag.objects.filter(pk=tag.pk).exists()


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_create_rejects_foreign_color(
    other_api_client: APIClient, color: Color, other_user: User
) -> None:
    """other_user cannot create a tag referencing user's color."""
    response = other_api_client.post(
        "/api/tags/", {"name": "stealth-tag", "color_id": color.pk}, format="json"
    )
    assert response.status_code == 400


# ── TodoLists ──────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_list_hidden_from_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.get("/api/lists/")
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_retrieve_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.get(f"/api/lists/{todo_list.pk}/")
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_update_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.patch(
        f"/api/lists/{todo_list.pk}/", {"name": "Hijacked"}, format="json"
    )
    assert response.status_code == 404
    todo_list.refresh_from_db()
    assert todo_list.name != "Hijacked"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_delete_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.delete(f"/api/lists/{todo_list.pk}/")
    assert response.status_code == 404
    assert TodoList.objects.filter(pk=todo_list.pk).exists()


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_create_rejects_foreign_color(
    other_api_client: APIClient, color: Color
) -> None:
    """other_user cannot create a list referencing user's color."""
    response = other_api_client.post(
        "/api/lists/", {"name": "Stealth List", "color_id": color.pk}, format="json"
    )
    assert response.status_code == 400


# ── TodoItems ──────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_list_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    """Listing items on another user's list returns 404, not an empty result."""
    response = other_api_client.get(f"/api/lists/{todo_list.pk}/items/")
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.post(
        f"/api/lists/{todo_list.pk}/items/", {"title": "Stealth item"}, format="json"
    )
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_retrieve_returns_404_for_other_user(
    other_api_client: APIClient, todo_item: TodoItem
) -> None:
    response = other_api_client.get(
        f"/api/lists/{todo_item.list.pk}/items/{todo_item.pk}/"
    )
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_update_returns_404_for_other_user(
    other_api_client: APIClient, todo_item: TodoItem
) -> None:
    response = other_api_client.patch(
        f"/api/lists/{todo_item.list.pk}/items/{todo_item.pk}/",
        {"title": "Hijacked"},
        format="json",
    )
    assert response.status_code == 404
    todo_item.refresh_from_db()
    assert todo_item.title != "Hijacked"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_delete_returns_404_for_other_user(
    other_api_client: APIClient, todo_item: TodoItem
) -> None:
    response = other_api_client.delete(
        f"/api/lists/{todo_item.list.pk}/items/{todo_item.pk}/"
    )
    assert response.status_code == 404
    assert TodoItem.objects.filter(pk=todo_item.pk).exists()


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_reorder_returns_404_for_other_user(
    other_api_client: APIClient, todo_list: TodoList
) -> None:
    response = other_api_client.post(
        f"/api/lists/{todo_list.pk}/items/reorder/", {"order": []}, format="json"
    )
    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_item_create_rejects_foreign_tag(
    other_api_client: APIClient, tag: Tag, other_user: User, color: Color
) -> None:
    """other_user cannot tag their own item with user's tag."""
    other_color = Color.objects.create(
        name="Other Blue", hex_code="#0000AA", owner=other_user
    )
    other_list = TodoList.objects.create(
        name="Other List", color=other_color, owner=other_user
    )
    response = other_api_client.post(
        f"/api/lists/{other_list.pk}/items/",
        {"title": "Sneaky item", "tag_ids": [tag.pk]},
        format="json",
    )
    assert response.status_code == 400


# ── Stats ──────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_stats_isolated_per_user(
    api_client: APIClient, other_api_client: APIClient, todo_item: TodoItem
) -> None:
    """other_user's stats are zero even when user has data."""
    user_data = api_client.get("/api/stats/").json()
    assert user_data["totals"]["items"] == 1

    other_data = other_api_client.get("/api/stats/").json()
    assert other_data["totals"]["items"] == 0
    assert other_data["totals"]["lists"] == 0
    assert other_data["totals"]["colors"] == 0
    assert other_data["totals"]["tags"] == 0
