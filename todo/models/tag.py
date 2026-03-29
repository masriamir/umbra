"""Tag model for labelling and categorizing todo items."""

from django.db import models

from todo.models.core import EFBase

from .color import Color


class Tag(EFBase):
    """A label that can be applied to todo items for categorization."""

    name = models.CharField(unique=True, max_length=32)
    color = models.ForeignKey(Color, on_delete=models.PROTECT)

    class Meta:
        db_table = "tag"
        get_latest_by = "created_date"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} [{self.color}]"
