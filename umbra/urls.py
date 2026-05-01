"""Root URL configuration for the Umbra project."""

from django.contrib import admin
from django.http import HttpRequest, HttpResponse
from django.urls import include, path, re_path
from django.views.generic import TemplateView


def _health(request: HttpRequest) -> HttpResponse:
    """Return 200 OK for Railway's health check."""
    return HttpResponse("ok", content_type="text/plain")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("todo.urls")),
    path("health/", _health),
    # Catch-all: serve the React SPA's index.html for every route that isn't
    # handled above. React Router then takes over client-side navigation.
    # This must be last so it doesn't shadow the API or admin routes.
    re_path(r"^(?!api/|admin/|health/).*$", TemplateView.as_view(template_name="index.html")),
]
