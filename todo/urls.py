"""URL routing for the todo application API."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from todo import auth_views, views

router = DefaultRouter()
router.register(r"colors", views.ColorViewSet, basename="color")
router.register(r"tags", views.TagViewSet, basename="tag")
router.register(r"lists", views.TodoListViewSet, basename="todolist")

# Manual nesting for TodoItems under their parent list
item_list = views.TodoItemViewSet.as_view({"get": "list", "post": "create"})
item_detail = views.TodoItemViewSet.as_view(
    {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
)
item_reorder = views.TodoItemViewSet.as_view({"post": "reorder"})
item_export = views.TodoItemViewSet.as_view({"get": "export"})

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", auth_views.login_view, name="auth-login"),
    path("auth/logout/", auth_views.logout_view, name="auth-logout"),
    path("auth/me/", auth_views.me_view, name="auth-me"),
    path("stats/", views.stats, name="stats"),
    path("lists/<int:list_pk>/items/", item_list, name="todolist-items-list"),
    path(
        "lists/<int:list_pk>/items/reorder/",
        item_reorder,
        name="todolist-items-reorder",
    ),
    path(
        "lists/<int:list_pk>/items/<int:pk>/", item_detail, name="todolist-items-detail"
    ),
    path(
        "lists/<int:list_pk>/items/<int:pk>/export/",
        item_export,
        name="todolist-items-export",
    ),
]
