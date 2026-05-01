"""TodoList, TodoItem, and supporting models for the todo application."""

from django.conf import settings
from django.db import models

from .color import Color
from .core import EFBase
from .tag import Tag


class Importance(models.IntegerChoices):
    """Task importance, mapped to iCalendar PRIORITY values (RFC 5545).

    1-4 = high, 5 = medium, 6-9 = low, 0 = undefined.
    """

    NONE = 0, "None"
    HIGH = 1, "High"
    MEDIUM = 5, "Medium"
    LOW = 9, "Low"


class TodoList(EFBase):
    """An ordered, named collection of todo items."""

    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256, blank=True, default="")
    color = models.ForeignKey(Color, on_delete=models.PROTECT)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="todo_lists",
    )

    class Meta:
        db_table = "todo_list"
        get_latest_by = "created_date"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_list_name_per_user"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} [{self.color}]"


class TodoItem(EFBase):
    """A single actionable task belonging to a todo list."""

    list = models.ForeignKey(TodoList, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(unique_for_date="created_date", max_length=64)
    description = models.CharField(max_length=256, blank=True, default="")
    tags = models.ManyToManyField(
        Tag, blank=True, through="TodoItemTag", through_fields=("todo_item", "tag")
    )
    due_date = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Event duration in minutes for calendar export. Defaults to 30 if not set.",
    )
    completed = models.BooleanField(default=False)
    synced = models.BooleanField(default=False)
    priority = models.PositiveIntegerField(default=0)
    importance = models.IntegerField(
        choices=Importance,
        default=Importance.NONE,
    )

    class Meta:
        db_table = "todo_item"
        get_latest_by = "created_date"
        ordering = ["list", "priority"]


class TodoItemTag(EFBase):
    """Through-table linking a TodoItem to a Tag."""

    todo_item = models.ForeignKey(TodoItem, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        db_table = "todo_item_tag"
        get_latest_by = "created_date"
        ordering = ["todo_item"]
