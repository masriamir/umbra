from django.db import models

from .tag import Tag
from .color import Color
from .core import EFBase


class TodoList(EFBase):
    name = models.CharField(unique=True, max_length=32)
    description = models.CharField(max_length=256, blank=True, default="")
    color = models.ForeignKey(Color, on_delete=models.PROTECT)

    class Meta:
        db_table = 'todo_list'
        get_latest_by = 'created_date'
        ordering = ['name']

    def __str__(self) -> str:
        return f'{self.name} [{self.color}]'


class TodoItem(EFBase):
    list = models.ForeignKey(TodoList, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(unique_for_date='created_date', max_length=64)
    description = models.CharField(max_length=256, blank=True, default="")
    tags = models.ManyToManyField(Tag, blank=True, through='TodoItemTag', through_fields=('todo_item', 'tag'))
    due_date = models.DateTimeField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    synced = models.BooleanField(default=False)
    priority = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'todo_item'
        get_latest_by = 'created_date'
        ordering = ['list', 'priority']


class TodoItemTag(EFBase):
    todo_item = models.ForeignKey(TodoItem, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        db_table = 'todo_item_tag'
        get_latest_by = 'created_date'
        ordering = ['todo_item']
