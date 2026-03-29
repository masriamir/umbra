"""Abstract base model shared by all todo application models."""

from django.db import models


class EFBase(models.Model):
    """Abstract base model providing created and updated timestamp fields."""

    created_date = models.DateTimeField("Date Created", auto_now_add=True, blank=False)
    updated_date = models.DateTimeField("Date Updated", auto_now=True)

    class Meta:
        abstract = True
