"""Color model used to visually categorize lists and tags."""

from django.conf import settings
from django.db import models

from todo.models.core import EFBase
from todo.models.validators import HexCodeValidator


class Color(EFBase):
    """A named color used to visually categorize lists and tags."""

    name = models.CharField(max_length=32)
    hex_code = models.CharField(max_length=7, validators=[HexCodeValidator()])
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="colors",
    )

    class Meta:
        db_table = "color"
        get_latest_by = "created_date"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_color_name_per_user"
            ),
            models.UniqueConstraint(
                fields=["owner", "hex_code"], name="unique_color_hex_per_user"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.hex_code})"
