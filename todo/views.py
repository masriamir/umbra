from django.db import models, transaction
from django.db.models import QuerySet
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from todo.models import Color, Tag, TodoItem, TodoList
from todo.serializers import (
    ColorSerializer,
    TagSerializer,
    TodoItemSerializer,
    TodoListSerializer,
)


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer

    def destroy(self, request: Request, *args: object, **kwargs: object) -> Response:
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "This color is in use by a list or tag and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.select_related("color").all()
    serializer_class = TagSerializer


class TodoListViewSet(viewsets.ModelViewSet):
    queryset = TodoList.objects.select_related("color").all()
    serializer_class = TodoListSerializer


class TodoItemViewSet(viewsets.ModelViewSet):
    serializer_class = TodoItemSerializer

    def get_queryset(self) -> QuerySet[TodoItem]:
        return (
            TodoItem.objects.filter(list_id=self.kwargs["list_pk"])
            .select_related("list")
            .prefetch_related("tags__color")
            .order_by("priority")
        )

    def perform_create(self, serializer: drf_serializers.BaseSerializer) -> None:
        todo_list = get_object_or_404(TodoList, pk=self.kwargs["list_pk"])
        current_max = TodoItem.objects.filter(list=todo_list).aggregate(
            max_priority=models.Max("priority")
        )["max_priority"]
        next_priority = 0 if current_max is None else current_max + 1
        serializer.save(list=todo_list, priority=next_priority)

    @action(detail=False, methods=["post"], url_path="reorder")  # type: ignore[untyped-decorator]
    def reorder(self, request: Request, list_pk: int | None = None) -> Response:
        order = request.data.get("order", [])
        if not isinstance(order, list) or not all(isinstance(i, int) for i in order):
            raise drf_serializers.ValidationError({"order": "Must be a list of integer IDs."})

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
