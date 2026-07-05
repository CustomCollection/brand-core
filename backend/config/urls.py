"""
URL configuration for CustomCollection project.

API v1 routes for all apps, admin panel, health check,
and drf-spectacular schema/docs endpoints.
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({"status": "healthy", "service": "CustomCollection API"})


api_v1_patterns = [
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
