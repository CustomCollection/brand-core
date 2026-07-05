"""
Development-specific Django settings for CustomCollection.
"""

# Debug
DEBUG = True

ALLOWED_HOSTS = ["*"]

# CORS — allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email — use console backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Simplified logging for development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
