"""Integration tests for the TodoList API endpoints."""

from __future__ import annotations

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from todo.models import Color, TodoList

LISTS_URL = "/api/lists/"


def list_url(pk: int) -> str:
    return f"/api/lists/{pk}/"


# ── List ───────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_list_empty(api_client: APIClient) -> None:
    response = api_client.get(LISTS_URL)
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_list_returns_existing(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.get(LISTS_URL)
    assert response.status_code == 200
    data = response.json()["results"]
    assert len(data) == 1
    assert data[0]["id"] == todo_list.pk
    assert data[0]["name"] == todo_list.name


# ── Create ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_create(api_client: APIClient, color: Color) -> None:
    response = api_client.post(
        LISTS_URL, {"name": "Shopping", "color_id": color.pk}, format="json"
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Shopping"
    assert data["color"]["id"] == color.pk
    assert data["description"] == ""


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_create_with_description(api_client: APIClient, color: Color) -> None:
    response = api_client.post(
        LISTS_URL,
        {"name": "Shopping", "description": "Weekly groceries", "color_id": color.pk},
        format="json",
    )
    assert response.status_code == 201
    assert response.json()["description"] == "Weekly groceries"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_create_requires_name(api_client: APIClient, color: Color) -> None:
    response = api_client.post(LISTS_URL, {"color_id": color.pk}, format="json")
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_create_requires_color_id(api_client: APIClient) -> None:
    response = api_client.post(LISTS_URL, {"name": "Shopping"}, format="json")
    assert response.status_code == 400


# ── Retrieve ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_retrieve(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.get(list_url(todo_list.pk))
    assert response.status_code == 200
    assert response.json()["id"] == todo_list.pk


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_retrieve_not_found(api_client: APIClient) -> None:
    response = api_client.get(list_url(999))
    assert response.status_code == 404


# ── Update ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_update_name(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.patch(
        list_url(todo_list.pk), {"name": "Renamed List"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed List"


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_update_description(api_client: APIClient, todo_list: TodoList) -> None:
    response = api_client.patch(
        list_url(todo_list.pk), {"description": "A new description"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["description"] == "A new description"


# ── Delete ─────────────────────────────────────────────────────────────────────


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.django_db
def test_list_delete(api_client: APIClient, color: Color, user: User) -> None:
    lst = TodoList.objects.create(name="Temporary", color=color, owner=user)
    response = api_client.delete(list_url(lst.pk))
    assert response.status_code == 204
    assert not TodoList.objects.filter(pk=lst.pk).exists()
