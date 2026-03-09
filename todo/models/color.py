from django.db import models

from todo.models.validators import HexCodeValidator
from todo.models.core import EFBase


class Color(EFBase):
    name = models.CharField(unique=True, max_length=32)
    hex_code = models.CharField(unique=True, max_length=7, validators=[HexCodeValidator()])

    class Meta:
        db_table = 'color'
        get_latest_by = 'created_date'
        ordering = ['name']

    def __str__(self) -> str:
        return f'{self.name} ({self.hex_code})'
