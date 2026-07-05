"""Search URL — separate from product URLs for cleaner routing."""

from django.urls import path

from .views import ProductSearchView

urlpatterns = [
    path("", ProductSearchView.as_view(), name="product-search"),
]
