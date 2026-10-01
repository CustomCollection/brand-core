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


def favicon_redirect(request):
    """Redirect /favicon.ico to brand logo or favicon configured in SiteConfig."""
    try:
        from apps.cms.models import SiteConfig
        config = SiteConfig.get_config()
        fav_url = config.favicon_url or config.logo_url
        if fav_url:
            return redirect(fav_url)
    except Exception:
        pass
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
