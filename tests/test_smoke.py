"""Smoke tests verifying core endpoint availability and the full resource chain."""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from todo.models import TodoList

# ── Endpoint availability ──────────────────────────────────────────────────────


@pytest.mark.smoke
@pytest.mark.django_db
def test_colors_endpoint_available(api_client: APIClient) -> None:
    assert api_client.get("/api/colors/").status_code == 200


@pytest.mark.smoke
@pytest.mark.django_db
def test_tags_endpoint_available(api_client: APIClient) -> None:
    assert api_client.get("/api/tags/").status_code == 200


@pytest.mark.smoke
@pytest.mark.django_db
def test_lists_endpoint_available(api_client: APIClient) -> None:
    assert api_client.get("/api/lists/").status_code == 200


@pytest.mark.smoke
@pytest.mark.django_db
def test_items_endpoint_available(api_client: APIClient, todo_list: TodoList) -> None:
    assert api_client.get(f"/api/lists/{todo_list.pk}/items/").status_code == 200


# ── Full resource chain ────────────────────────────────────────────────────────


@pytest.mark.smoke
@pytest.mark.django_db
def test_full_resource_chain(api_client: APIClient) -> None:
    """Create a color → tag → list → item through the API and verify each resource.

    Confirms that every resource in the chain is retrievable after creation.
    """
    color_res = api_client.post(
        "/api/colors/", {"name": "Chain Blue", "hex_code": "#1122FF"}, format="json"
    )
    assert color_res.status_code == 201
    color_id = color_res.json()["id"]

    tag_res = api_client.post(
        "/api/tags/", {"name": "chain-tag", "color_id": color_id}, format="json"
    )
    assert tag_res.status_code == 201
    tag_id = tag_res.json()["id"]

    list_res = api_client.post(
        "/api/lists/",
        {"name": "Chain List", "color_id": color_id},
        format="json",
    )
    assert list_res.status_code == 201
    list_id = list_res.json()["id"]

    item_res = api_client.post(
        f"/api/lists/{list_id}/items/",
        {"title": "Chain Item", "tag_ids": [tag_id]},
        format="json",
    )
    assert item_res.status_code == 201
    item_id = item_res.json()["id"]

    # Verify everything is retrievable
    assert api_client.get(f"/api/colors/{color_id}/").status_code == 200
    assert api_client.get(f"/api/tags/{tag_id}/").status_code == 200
    assert api_client.get(f"/api/lists/{list_id}/").status_code == 200
    assert api_client.get(f"/api/lists/{list_id}/items/{item_id}/").status_code == 200
