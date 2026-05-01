"""Serializers for the TodoList and TodoItem models."""

from typing import Any

from django.utils import timezone
from rest_framework import serializers

from todo.models import Color, Tag, TodoItem, TodoList
from todo.serializers.color import ColorSerializer
from todo.serializers.tag import TagSerializer


class TodoListSerializer(serializers.ModelSerializer):
    """Serializer for the TodoList model.

    Accepts ``color_id`` on write and returns the nested color object on read.
    The ``color_id`` queryset is restricted to colors owned by the requesting
    user so that cross-user color references are rejected at validation time.
    """

    color = ColorSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(
        source="color",
        queryset=Color.objects.none(),
        write_only=True,
    )

    class Meta:
        model = TodoList
        fields = [
            "id",
            "name",
            "description",
            "color",
            "color_id",
            "created_date",
            "updated_date",
        ]
        read_only_fields = ["created_date", "updated_date"]

    def get_fields(self) -> dict[str, Any]:
        """Scope color_id to the requesting user's colors."""
        fields: dict[str, Any] = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["color_id"].queryset = Color.objects.filter(owner=request.user)
        return fields

    def validate_name(self, value: str) -> str:
        """Reject duplicate list names within the same user's lists."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            qs = TodoList.objects.filter(owner=request.user, name=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A list with this name already exists."
                )
        return value


class TodoItemSerializer(serializers.ModelSerializer):
    """Serializer for the TodoItem model.

    Accepts ``tag_ids`` on write and returns nested tag objects on read.
    The ``tag_ids`` queryset is restricted to tags owned by the requesting user
    so that cross-user tag references are rejected at validation time.
    """

    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        source="tags",
        many=True,
        queryset=Tag.objects.none(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = TodoItem
        fields = [
            "id",
            "list",
            "title",
            "description",
            "tags",
            "tag_ids",
            "due_date",
            "duration_minutes",
            "completed",
            "synced",
            "priority",
            "importance",
            "created_date",
            "updated_date",
        ]
        read_only_fields = [
            "list",
            "priority",
            "synced",
            "created_date",
            "updated_date",
        ]

    def get_fields(self) -> dict[str, Any]:
        """Scope tag_ids to the requesting user's tags."""
        fields: dict[str, Any] = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["tag_ids"].child_relation.queryset = Tag.objects.filter(
                owner=request.user
            )
        return fields

    def run_validators(self, value: dict[str, Any]) -> None:
        """Inject instance fields required by UniqueForDateValidator before validation.

        DRF 3.17+ calls ``enforce_required_fields()`` unconditionally, requiring
        both ``title`` and ``created_date`` to be present even on partial updates.
        Missing fields are sourced from the existing instance so that unrelated
        partial patches are not rejected.
        """
        if self.instance is not None:
            if "title" not in value:
                value = {**value, "title": self.instance.title}
            if "created_date" not in value:
                value = {**value, "created_date": self.instance.created_date}
        elif "created_date" not in value:
            value = {**value, "created_date": timezone.now()}
        super().run_validators(value)
