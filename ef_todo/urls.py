"""Root URL configuration for the ef_todo project."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("todo.urls")),
]
