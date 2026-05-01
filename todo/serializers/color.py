"""Serializer for the Color model."""

from rest_framework import serializers

from todo.models import Color


class ColorSerializer(serializers.ModelSerializer):
    """Serializer for the Color model."""

    class Meta:
        model = Color
        fields = [
            "id",
            "name",
            "hex_code",
            "created_date",
            "updated_date",
        ]
        read_only_fields = ["created_date", "updated_date"]

    def _user_color_qs(self) -> serializers.QuerySet[Color]:  # type: ignore[name-defined]
        request = self.context.get("request")
        if not (request and request.user.is_authenticated):
            return Color.objects.none()
        qs = Color.objects.filter(owner=request.user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        return qs

    def validate_name(self, value: str) -> str:
        """Reject duplicate names within the same user's palette."""
        if self._user_color_qs().filter(name=value).exists():
            raise serializers.ValidationError(
                "A color with this name already exists."
            )
        return value

    def validate_hex_code(self, value: str) -> str:
        """Reject duplicate hex codes within the same user's palette."""
        if self._user_color_qs().filter(hex_code=value).exists():
            raise serializers.ValidationError(
                "A color with this hex code already exists."
            )
        return value
