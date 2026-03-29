"""Custom field validators for todo application models."""

from django.core.validators import RegexValidator


class HexCodeValidator(RegexValidator):
    """Validates that a string is a valid CSS hex color code (#RGB or #RRGGBB)."""

    def __init__(self) -> None:
        super().__init__(regex=r"^#([0-9A-Fa-f]{3}){1,2}$")
