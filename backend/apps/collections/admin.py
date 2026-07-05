"""Collection Django Admin configuration."""

from django.contrib import admin
from django.utils.html import format_html

from .models import Collection


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order", "product_count", "image_preview")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order",)
    list_editable = ("is_active", "sort_order")

    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "image_url")}),
        ("Display", {"fields": ("is_active", "sort_order")}),
        ("SEO", {"fields": ("meta_title", "meta_description"), "classes": ("collapse",)}),
    )

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 50px; border-radius: 4px;" />', obj.image_url
            )
        return "—"

    image_preview.short_description = "Image"
