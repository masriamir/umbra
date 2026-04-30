"""Integration tests for the Tag API endpoints."""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from todo.models import Color, Tag

TAGS_URL = "/api/tags/"


def tag_url(pk: int) -> str:
    return f"/api/tags/{pk}/"


# ── List ───────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_list_empty(api_client: APIClient) -> None:
    response = api_client.get(TAGS_URL)
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_list_returns_existing(api_client: APIClient, tag: Tag) -> None:
    response = api_client.get(TAGS_URL)
    assert response.status_code == 200
    data = response.json()["results"]
    assert len(data) == 1
    assert data[0]["id"] == tag.pk
    assert data[0]["name"] == tag.name
    # Read response nests the full color object
    assert data[0]["color"]["id"] == tag.color.pk


# ── Create ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_create(api_client: APIClient, color: Color) -> None:
    response = api_client.post(
        TAGS_URL, {"name": "work", "color_id": color.pk}, format="json"
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "work"
    assert data["color"]["id"] == color.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_create_requires_name(api_client: APIClient, color: Color) -> None:
    response = api_client.post(TAGS_URL, {"color_id": color.pk}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_create_requires_color_id(api_client: APIClient) -> None:
    response = api_client.post(TAGS_URL, {"name": "work"}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_create_rejects_invalid_color_id(api_client: APIClient) -> None:
    response = api_client.post(
        TAGS_URL, {"name": "work", "color_id": 999}, format="json"
    )
    assert response.status_code == 400


# ── Retrieve ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_retrieve(api_client: APIClient, tag: Tag) -> None:
    response = api_client.get(tag_url(tag.pk))
    assert response.status_code == 200
    assert response.json()["id"] == tag.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_retrieve_not_found(api_client: APIClient) -> None:
    response = api_client.get(tag_url(999))
    assert response.status_code == 404


# ── Update ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_update(api_client: APIClient, tag: Tag) -> None:
    response = api_client.patch(tag_url(tag.pk), {"name": "critical"}, format="json")
    assert response.status_code == 200
    assert response.json()["name"] == "critical"


# ── Delete ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_tag_delete(api_client: APIClient, color: Color) -> None:
    t = Tag.objects.create(name="temporary", color=color)
    response = api_client.delete(tag_url(t.pk))
    assert response.status_code == 204
    assert not Tag.objects.filter(pk=t.pk).exists()
