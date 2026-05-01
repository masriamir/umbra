"""Serializer for the Tag model."""

from rest_framework import serializers

from todo.models import Color, Tag
from todo.serializers.color import ColorSerializer


class TagSerializer(serializers.ModelSerializer):
    """Serializer for the Tag model.

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

    def get_fields(self) -> dict:
        """Scope color_id to the requesting user's colors."""
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["color_id"].queryset = Color.objects.filter(owner=request.user)
        return fields

    def validate_name(self, value: str) -> str:
        """Reject duplicate tag names within the same user's tag set."""
        from todo.models import Tag

        request = self.context.get("request")
        if request and request.user.is_authenticated:
            qs = Tag.objects.filter(owner=request.user, name=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A tag with this name already exists."
                )
        return value
