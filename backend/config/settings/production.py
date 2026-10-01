"""
Production-specific Django settings for CustomCollection.
"""

from decouple import Csv, config

# Debug
DEBUG = False

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default=".koyeb.app,.onrender.com,localhost,127.0.0.1",
    cast=Csv(),
)

# CORS — allow all origins by default to reduce overhead
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=True, cast=bool)
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())

# CSRF — trusted origins for cross-domain requests (auto-trusts Vercel & Render + any custom domain)
_default_csrf = ["https://*.vercel.app", "https://*.onrender.com", "http://localhost:3000"]
_custom_csrf = [x.strip() for x in config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv()) if x.strip()]
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(_default_csrf + _custom_csrf))

# Email — use SMTP if credentials provided, otherwise fallback to console (no crash)
if config("EMAIL_HOST_USER", default=""):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = config(
        "EMAIL_BACKEND",
        default="django.core.mail.backends.console.EmailBackend",
    )

# Security settings
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Cross-site cookie configuration (Required when frontend on Vercel and backend on Render)
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = config("SESSION_COOKIE_SAMESITE", default="None")
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = config("CSRF_COOKIE_SAMESITE", default="None")

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# JWT cookies — secure in production (SameSite=None for cross-domain cookie delivery)
SIMPLE_JWT = {
    "AUTH_COOKIE_SECURE": True,
    "AUTH_COOKIE_SAMESITE": config("JWT_COOKIE_SAMESITE", default="None"),
}
