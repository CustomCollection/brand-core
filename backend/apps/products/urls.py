"""Product URL configuration."""

from django.urls import path

from . import views

app_name = "products"

urlpatterns = [
    path("", views.ProductListView.as_view(), name="product-list"),
    path("sizes/", views.SizeListView.as_view(), name="size-list"),
    path("colors/", views.ColorListView.as_view(), name="color-list"),
    path("<slug:slug>/", views.ProductDetailView.as_view(), name="product-detail"),
]
