"""Review URL configuration."""

from django.urls import path

from . import views

app_name = "reviews"

urlpatterns = [
    path(
        "products/<slug:product_slug>/",
        views.ProductReviewListView.as_view(),
        name="product-reviews",
    ),
    path(
        "products/<slug:product_slug>/create/",
        views.ProductReviewCreateView.as_view(),
        name="product-review-create",
    ),
]
