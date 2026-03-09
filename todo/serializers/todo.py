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
            "completed",
            "synced",
            "priority",
            "created_date",
            "updated_date",
        ]
        read_only_fields = ["list", "priority", "synced"]
