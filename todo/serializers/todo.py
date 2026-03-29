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
    """

    color = ColorSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(
        source="color",
        queryset=Color.objects.all(),
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


class TodoItemSerializer(serializers.ModelSerializer):
    """Serializer for the TodoItem model.

    Accepts ``tag_ids`` on write and returns nested tag objects on read.
    """

    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        source="tags",
        many=True,
        queryset=Tag.objects.all(),
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
