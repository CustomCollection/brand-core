"""Wishlist URL configuration."""

from django.urls import path

from . import views

app_name = "wishlist"

urlpatterns = [
    path("", views.WishlistView.as_view(), name="wishlist"),
    path("<int:pk>/", views.WishlistItemView.as_view(), name="wishlist-item"),
]
