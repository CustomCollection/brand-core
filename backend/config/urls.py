"""
URL configuration for CustomCollection project.

API v1 routes for all apps, admin panel, health check,
and drf-spectacular schema/docs endpoints.
"""

from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({"status": "healthy", "service": "CustomCollection API"})


_cached_favicon_bytes = None
_cached_favicon_url = None
_cached_favicon_mime = "image/png"


def favicon_redirect(request):
    """Serve brand favicon directly with image bytes, avoiding browser 302 favicon drop."""
    global _cached_favicon_bytes, _cached_favicon_url, _cached_favicon_mime
    fav_url = ""
    try:
        from apps.cms.models import SiteConfig

        config = SiteConfig.get_config()
        fav_url = config.favicon_url or config.logo_url
        if fav_url:
            if _cached_favicon_bytes and _cached_favicon_url == fav_url:
                return HttpResponse(_cached_favicon_bytes, content_type=_cached_favicon_mime)
            import urllib.request

            req = urllib.request.Request(fav_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                _cached_favicon_bytes = resp.read()
                _cached_favicon_url = fav_url
                _cached_favicon_mime = resp.headers.get_content_type() or "image/png"
                return HttpResponse(_cached_favicon_bytes, content_type=_cached_favicon_mime)
    except Exception:
        pass
    if fav_url:
        return redirect(fav_url)
    return HttpResponse(status=204)


api_v1_patterns = [
    path("health/", health_check, name="api-health-check"),
    path("accounts/", include("apps.accounts.urls")),
    path("products/", include("apps.products.urls")),
    path("collections/", include("apps.collections.urls")),
    path("tags/", include("apps.tags.urls")),
    path("cart/", include("apps.cart.urls")),
    path("orders/", include("apps.orders.urls")),
    path("payments/", include("apps.payments.urls")),
    path("reviews/", include("apps.reviews.urls")),
    path("wishlist/", include("apps.wishlist.urls")),
    path("cms/", include("apps.cms.urls")),
    # Search
    path("search/", include("apps.products.urls_search")),
]

urlpatterns = [
    # Favicon
    path("favicon.ico", favicon_redirect, name="favicon"),
    # Admin
    path("admin/", admin.site.urls),
    # Health check
    path("health/", health_check, name="health-check"),
    # API v1
    path("api/v1/", include(api_v1_patterns)),
    # API Schema & Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
