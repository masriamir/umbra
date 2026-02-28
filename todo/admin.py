from django.contrib import admin

from .models import Color, Tag, TodoItem, TodoList


class ColorAdmin(admin.ModelAdmin):
    list_display = ['name', 'hex_code']
    search_fields = ['name']
    # list_filter = ['name']
    ordering = ['name']


class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name', 'color']
    list_filter = ['name', 'color']
    ordering = ['name']


class TodoListAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    list_filter = ['name', 'color']


admin.site.register(Color, ColorAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(TodoItem)
admin.site.register(TodoList, TodoListAdmin)
