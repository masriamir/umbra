"""Serializer for the Tag model."""

from rest_framework import serializers

from todo.models import Color, Tag
from todo.serializers.color import ColorSerializer


class TagSerializer(serializers.ModelSerializer):
    """Serializer for the Tag model.

    Accepts ``color_id`` on write and returns the nested color object on read.
    """

    color = ColorSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(
        source="color",
        queryset=Color.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "color",
            "color_id",
            "created_date",
            "updated_date",
        ]
        read_only_fields = ["created_date", "updated_date"]
