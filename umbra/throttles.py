"""Custom DRF throttle classes for the Umbra API."""

from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Throttle for the login endpoint: 5 requests per minute per IP address."""

    scope = "login"
