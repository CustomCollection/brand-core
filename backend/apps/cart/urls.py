"""Cart URL configuration."""

from django.urls import path

from . import views

app_name = "cart"

urlpatterns = [
    path("", views.CartView.as_view(), name="cart"),
    path("add/", views.CartAddView.as_view(), name="cart-add"),
    path("merge/", views.CartMergeView.as_view(), name="cart-merge"),
    path("items/<int:pk>/", views.CartItemView.as_view(), name="cart-item"),
]
