from typing import Any

from django.utils import timezone
from rest_framework import serializers

from todo.models import Color, Tag, TodoItem, TodoList
from todo.serializers.color import ColorSerializer
from todo.serializers.tag import TagSerializer


class TodoListSerializer(serializers.ModelSerializer):
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
        # `title` has `unique_for_date="created_date"`, which causes DRF to generate
        # a UniqueForDateValidator that requires `created_date` to be present in the
        # validated data. Because `created_date` is read-only it is never included in
        # `attrs`, so we inject it here before validators run.
        if "created_date" not in value:
            if self.instance is not None:
                value = {**value, "created_date": self.instance.created_date}
            else:
                value = {**value, "created_date": timezone.now()}
        super().run_validators(value)
