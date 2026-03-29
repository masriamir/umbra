"""ViewSets for the Color, Tag, TodoList, and TodoItem resources."""

from django.db import models, transaction
from django.db.models import QuerySet
from django.db.models.deletion import ProtectedError
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from todo.ics import _sanitize_filename, build_calendar
from todo.models import Color, Tag, TodoItem, TodoList
from todo.serializers import (
    ColorSerializer,
    TagSerializer,
    TodoItemSerializer,
    TodoListSerializer,
)


class ColorViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Color resources."""

    queryset = Color.objects.all()
    serializer_class = ColorSerializer

    def destroy(self, request: Request, *args: object, **kwargs: object) -> Response:
        """Delete a color, returning 400 if it is still referenced by a list or tag."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "This color is in use by a list or tag and cannot be deleted."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class TagViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for Tag resources."""

    queryset = Tag.objects.select_related("color").all()
    serializer_class = TagSerializer


class TodoListViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for TodoList resources, including ICS calendar export."""

    queryset = TodoList.objects.select_related("color").all()
    serializer_class = TodoListSerializer

    @action(detail=True, methods=["get"], url_path="export")  # type: ignore[untyped-decorator]
    def export(self, request: Request, pk: int | None = None) -> HttpResponse:
        """Export all incomplete, dated items in the list as an ICS calendar file."""
        todo_list = self.get_object()
        items = list(
            TodoItem.objects.filter(list=todo_list, completed=False)
            .exclude(due_date=None)
            .prefetch_related("tags")
        )
        cal = build_calendar(todo_list, items)
        filename = _sanitize_filename(todo_list.name) + ".ics"
        response = HttpResponse(
            cal.to_ical(), content_type="text/calendar; charset=utf-8"
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class TodoItemViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for TodoItem resources, scoped to a parent list."""

    serializer_class = TodoItemSerializer

    def get_queryset(self) -> QuerySet[TodoItem]:
        """Return items belonging to the parent list, ordered by priority."""
        return (
            TodoItem.objects.filter(list_id=self.kwargs["list_pk"])
            .select_related("list")
            .prefetch_related("tags__color")
            .order_by("priority")
        )

    def perform_create(self, serializer: drf_serializers.BaseSerializer) -> None:
        """Save a new item, assigning the parent list and auto-incrementing priority."""
        todo_list = get_object_or_404(TodoList, pk=self.kwargs["list_pk"])
        current_max = TodoItem.objects.filter(list=todo_list).aggregate(
            max_priority=models.Max("priority")
        )["max_priority"]
        next_priority = 0 if current_max is None else current_max + 1
        serializer.save(list=todo_list, priority=next_priority)

    @action(detail=True, methods=["get"], url_path="export")  # type: ignore[untyped-decorator]
    def export(
        self, request: Request, list_pk: int | None = None, pk: int | None = None
    ) -> HttpResponse:
        """Export a single item as an ICS calendar event."""
        item = self.get_object()
        if item.due_date is None:
            return HttpResponse(
                "This item has no due date and cannot be exported.",
                status=400,
                content_type="text/plain",
            )
        todo_list = item.list
        cal = build_calendar(todo_list, [item])
        filename = _sanitize_filename(item.title) + ".ics"
        response = HttpResponse(
            cal.to_ical(), content_type="text/calendar; charset=utf-8"
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    @action(detail=False, methods=["post"], url_path="reorder")  # type: ignore[untyped-decorator]
    def reorder(self, request: Request, list_pk: int | None = None) -> Response:
        """Reassign priority values atomically based on the supplied ID order."""
        order = request.data.get("order", [])
        if not isinstance(order, list) or not all(isinstance(i, int) for i in order):
            raise drf_serializers.ValidationError(
                {"order": "Must be a list of integer IDs."}
            )

        items = list(TodoItem.objects.filter(list_id=list_pk, pk__in=order))
        if len(items) != len(order):
            raise drf_serializers.ValidationError(
                {"order": "Some IDs are invalid or do not belong to this list."}
            )

        id_to_priority = {item_id: idx for idx, item_id in enumerate(order)}
        with transaction.atomic():
            for item in items:
                item.priority = id_to_priority[item.pk]
            TodoItem.objects.bulk_update(items, ["priority"])

        return Response(status=status.HTTP_204_NO_CONTENT)
