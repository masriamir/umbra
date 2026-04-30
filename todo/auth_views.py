"""Authentication views: login, logout, and current-user identity."""

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from umbra.throttles import LoginRateThrottle


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request: Request) -> Response:
    """Authenticate a user and open a session.

    Args:
        request: Must contain ``username`` and ``password`` in the request body.

    Returns:
        Response with ``{id, username}`` on success.
        400 if fields are missing; 401 if credentials are invalid.
    """
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request._request, username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request._request, user)
    # Ensure the csrftoken cookie is issued so the SPA can read it and attach
    # X-CSRFToken on subsequent mutating requests (required by SessionAuthentication).
    get_token(request._request)

    return Response({"id": user.pk, "username": user.username})


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request: Request) -> Response:
    """End the current user's session.

    Accepts unauthenticated requests so that an expired-session logout attempt
    from the frontend does not produce a 403.

    Args:
        request: The incoming request.

    Returns:
        204 No Content.
    """
    logout(request._request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def me_view(request: Request) -> Response:
    """Return the identity of the currently authenticated user.

    Uses the project-wide ``IsAuthenticated`` default — unauthenticated
    callers receive a 403 (DRF returns 403, not 401, when SessionAuthentication
    is used because no ``WWW-Authenticate`` header is advertised).

    Args:
        request: The incoming request. Must be authenticated.

    Returns:
        Response with ``{id, username}``.
    """
    return Response({"id": request.user.pk, "username": request.user.username})
