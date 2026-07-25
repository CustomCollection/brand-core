"""
Development-specific Django settings for CustomCollection.
"""
from decouple import config

# Debug
DEBUG = True

ALLOWED_HOSTS = ["*"]

# CORS — allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email — use SMTP if credentials are provided, otherwise console
_email_host_user = config("EMAIL_HOST_USER", default="")
_email_host_password = config("EMAIL_HOST_PASSWORD", default="")

if _email_host_user and _email_host_password:
    # Real SMTP credentials configured — use them even in development
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
    EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
    EMAIL_HOST_USER = _email_host_user
    EMAIL_HOST_PASSWORD = _email_host_password
    EMAIL_USE_TLS = True
    DEFAULT_FROM_EMAIL = config(
        "DEFAULT_FROM_EMAIL",
        default=f"CustomCollection <{_email_host_user}>",
    )
else:
    # No credentials — fall back to console (prints to stdout)
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
