"""Integration tests for the Color API endpoints."""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from todo.models import Color, Tag

COLORS_URL = "/api/colors/"


def color_url(pk: int) -> str:
    return f"/api/colors/{pk}/"


# ── List ───────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_list_empty(api_client: APIClient) -> None:
    response = api_client.get(COLORS_URL)
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_list_returns_existing(api_client: APIClient, color: Color) -> None:
    response = api_client.get(COLORS_URL)
    assert response.status_code == 200
    data = response.json()["results"]
    assert len(data) == 1
    assert data[0]["id"] == color.pk
    assert data[0]["name"] == color.name
    assert data[0]["hex_code"] == color.hex_code


# ── Create ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_create(api_client: APIClient) -> None:
    response = api_client.post(
        COLORS_URL, {"name": "Blue", "hex_code": "#0000FF"}, format="json"
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Blue"
    assert data["hex_code"] == "#0000FF"
    assert "id" in data
    assert "created_date" in data


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_create_requires_name(api_client: APIClient) -> None:
    response = api_client.post(COLORS_URL, {"hex_code": "#0000FF"}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_create_requires_hex_code(api_client: APIClient) -> None:
    response = api_client.post(COLORS_URL, {"name": "Blue"}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_create_rejects_invalid_hex(api_client: APIClient) -> None:
    response = api_client.post(
        COLORS_URL, {"name": "Bad", "hex_code": "not-a-color"}, format="json"
    )
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_create_rejects_duplicate_name(
    api_client: APIClient, color: Color
) -> None:
    response = api_client.post(
        COLORS_URL, {"name": color.name, "hex_code": "#AABBCC"}, format="json"
    )
    assert response.status_code == 400


# ── Retrieve ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_retrieve(api_client: APIClient, color: Color) -> None:
    response = api_client.get(color_url(color.pk))
    assert response.status_code == 200
    assert response.json()["id"] == color.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_retrieve_not_found(api_client: APIClient) -> None:
    response = api_client.get(color_url(999))
    assert response.status_code == 404


# ── Update ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_update(api_client: APIClient, color: Color) -> None:
    response = api_client.patch(
        color_url(color.pk), {"name": "Dark Red"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Dark Red"


# ── Delete ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_delete(api_client: APIClient) -> None:
    c = Color.objects.create(name="Temporary", hex_code="#CCCCCC")
    response = api_client.delete(color_url(c.pk))
    assert response.status_code == 204
    assert not Color.objects.filter(pk=c.pk).exists()


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_color_delete_rejected_when_in_use(api_client: APIClient, tag: Tag) -> None:
    """A color referenced by a tag must not be deleted (PROTECT)."""
    response = api_client.delete(color_url(tag.color.pk))
    assert response.status_code == 400
