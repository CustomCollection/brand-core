"""
Custom JWT authentication that reads tokens from httpOnly cookies
instead of the Authorization header.

This is the core of our cookie-based JWT auth strategy. The access token
is read from a cookie set by the login/refresh endpoints, making it
immune to XSS attacks (JavaScript cannot access httpOnly cookies).
"""

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT authentication backend that reads the access token from an
    httpOnly cookie instead of the Authorization header.

    Falls back to header-based auth if no cookie is found, allowing
    both cookie-based (browser) and header-based (API client) access.
    """

    def authenticate(self, request):
        """
        Attempt to authenticate using the access token cookie.

        Returns:
            A (user, validated_token) tuple if authentication succeeds.
            None if no token cookie is present (allows other auth backends to try).
        """
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token")
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            # No cookie found — fall back to header-based auth
            return super().authenticate(request)

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
