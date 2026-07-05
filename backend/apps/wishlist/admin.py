"""Wishlist Django Admin."""

from django.contrib import admin

from .models import WishlistItem


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    search_fields = ("user__email", "product__name")
    ordering = ("-created_at",)
    raw_id_fields = ("user", "product")
