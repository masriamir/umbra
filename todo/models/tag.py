from django.db import models

from .color import Color
from todo.models.core import EFBase


class Tag(EFBase):
    name = models.CharField(unique=True, max_length=32)
    color = models.ForeignKey(Color, on_delete=models.PROTECT)

    class Meta:
        db_table = 'tag'
        get_latest_by = 'created_date'
        ordering = ['name']

    def __str__(self) -> str:
        return f'{self.name} [{self.color}]'
