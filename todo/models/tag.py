"""Tag model for labelling and categorizing todo items."""

from django.conf import settings
from django.db import models

from todo.models.core import EFBase

from .color import Color


class Tag(EFBase):
    """A label that can be applied to todo items for categorization."""

    name = models.CharField(max_length=32)
    color = models.ForeignKey(Color, on_delete=models.PROTECT)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tags",
    )

    class Meta:
        db_table = "tag"
        get_latest_by = "created_date"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_tag_name_per_user"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} [{self.color}]"
