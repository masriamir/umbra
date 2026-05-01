"""Django settings for the Umbra project.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/6.0/ref/settings/
"""

from pathlib import Path

import environ

env = environ.Env(
    DEBUG=(bool, False),
)

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env in development. In production (Railway), vars are injected directly
# into the environment — the file won't exist and that's fine.
_env_file = BASE_DIR / ".env"
if _env_file.is_file():
    environ.Env.read_env(_env_file)

# SECRET_KEY is required — no fallback. Raise ImproperlyConfigured if absent.
SECRET_KEY = env("SECRET_KEY")

DEBUG = env("DEBUG")

# In dev, defaults to localhost. In production, must be set explicitly via ALLOWED_HOSTS env var.
ALLOWED_HOSTS: list[str] = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "todo.apps.TodoConfig",
]

_whitenoise = (
    # WhiteNoise must come directly after SecurityMiddleware so it can serve
    # static files and the React SPA before any other middleware runs.
    # Not needed in development — Django's runserver handles static files.
    ["whitenoise.middleware.WhiteNoiseMiddleware"]
    if not DEBUG
    else []
)

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    *_whitenoise,
    "csp.middleware.CSPMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "umbra.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Include the React build output so TemplateView can serve index.html
        # for the SPA catch-all route.
        "DIRS": [BASE_DIR / "frontend" / "dist"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "umbra.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
#
# Railway injects DATABASE_URL automatically when a PostgreSQL plugin is attached.
# For local development, fall back to individual DB_* environment variables.

if env("DATABASE_URL", default=None):
    DATABASES = {"default": env.db("DATABASE_URL")}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME", default="postgres"),
            "USER": env("DB_USER", default="postgres"),
            "PASSWORD": env("DB_PASSWORD", default=""),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="5432"),
            "CONN_MAX_AGE": 0,
            "CONN_HEALTH_CHECKS": True,
        },
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "/static/"

# collectstatic writes Django's own static files (admin CSS/JS) here.
STATIC_ROOT = BASE_DIR / "staticfiles"

# Serve the React SPA from the build output directory.
# WhiteNoiseMiddleware intercepts requests for files found here before URL
# routing, so /assets/main.js etc. are served without hitting Django views.
# Only activate when the build directory exists (not in a fresh dev checkout).
_frontend_dist = BASE_DIR / "frontend" / "dist"
if _frontend_dist.is_dir():
    WHITENOISE_ROOT = _frontend_dist

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- Security (production only) -----------------------------------------------
#
# Railway terminates TLS at its edge proxy. Django sits behind it over plain
# HTTP, so SECURE_SSL_REDIRECT must stay False — Railway already redirects
# HTTP → HTTPS before the request reaches Django.

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # With SECURE_PROXY_SSL_HEADER set, Django treats proxied requests as HTTPS,
    # so SECURE_SSL_REDIRECT is a safe no-op for traffic from Railway's edge.
    SECURE_SSL_REDIRECT = True
    CSRF_COOKIE_SECURE = True
    # Keep False so the SPA can read the csrftoken cookie via JS and attach
    # the X-CSRFToken header on mutating requests.
    CSRF_COOKIE_HTTPONLY = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

    # Use WhiteNoise's compressed+hashed storage in production for long-lived
    # browser caching of Django's own static files (admin CSS/JS).
    STORAGES = {
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }


# --- Django REST Framework ----------------------------------------------------

_renderers = ["rest_framework.renderers.JSONRenderer"]
if DEBUG:
    # Browsable API is useful during development but must not ship to production.
    _renderers.append("rest_framework.renderers.BrowsableAPIRenderer")

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": _renderers,
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",  # unauthenticated requests (login page, etc.)
        "user": "300/minute",  # authenticated API calls
        "login": "5/minute",  # login endpoint — tight to block brute-force
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}


# --- CORS ---------------------------------------------------------------------
# Only required in development, where the Vite dev server (port 5173) is a
# different origin from the Django API (port 8000). In production both are
# served from the same origin, so CORS is irrelevant.

CORS_ALLOWED_ORIGINS = ["http://localhost:5173"] if DEBUG else []


# --- Content Security Policy --------------------------------------------------

CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        # unsafe-inline is required for Tailwind CSS utility classes that are
        # applied via the style attribute at runtime.
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
    },
}
