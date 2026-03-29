from rest_framework import serializers

from todo.models import Color


class ColorSerializer(serializers.ModelSerializer):
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
