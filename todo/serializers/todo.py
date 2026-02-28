from rest_framework import serializers

from models import TodoItem, TodoItemTag, TodoList


class TodoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoList
        fields = [
            'id',
            'name',
            'color',
            'created_date',
            'updated_date',
        ]


class TodoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItem
        fields = [
            'id',
            'list',
            'title',
            'description',
            'tags',
            'due_date',
            'completed',
            'synced',
            'priority',
            'created_date',
            'updated_date',
        ]


class TodoItemTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItemTag
        fields = [
            'id',
            'todo_item',
            'tag',
            'created_date',
            'updated_date',
        ]
