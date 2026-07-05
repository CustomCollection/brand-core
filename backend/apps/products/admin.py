"""
Product Django Admin configuration.

Professional admin setup with image previews, inline images,
filters, search, and proper field grouping for efficient product management.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import Color, Product, ProductImage, Size


class ProductImageInline(admin.TabularInline):
    """Inline for managing product images within the product form."""

    model = ProductImage
    extra = 1
    fields = ("image_url", "alt_text", "is_primary", "sort_order", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 80px; border-radius: 4px;" />',
                obj.image_url,
            )
        return "No image"

    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Comprehensive product admin with all management features."""

    list_display = (
        "name",
        "status",
        "price",
        "discount_price",
        "is_featured",
        "is_best_seller",
        "is_new_arrival",
        "thumbnail_preview",
        "created_at",
    )
    list_filter = (
        "status",
        "is_featured",
        "is_best_seller",
        "is_new_arrival",
        "collections",
        "tags",
        "created_at",
    )
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("-created_at",)
    list_editable = ("status", "is_featured", "is_best_seller", "is_new_arrival")
    filter_horizontal = ("collections", "tags", "sizes", "colors")
    inlines = [ProductImageInline]
    list_per_page = 25

    fieldsets = (
        (
            None,
            {"fields": ("name", "slug", "status")},
        ),
        (
            "Pricing",
            {"fields": ("price", "discount_price")},
        ),
        (
            "Description",
            {
                "fields": ("short_description", "description"),
            },
        ),
        (
            "Classification",
            {
                "fields": ("collections", "tags", "sizes", "colors"),
                "description": "Assign this product to collections and tags for organization.",
            },
        ),
        (
            "Visibility Flags",
            {
                "fields": ("is_featured", "is_best_seller", "is_new_arrival"),
                "description": "Toggle sections where this product appears on the homepage.",
            },
        ),
        (
            "Additional Information",
            {
                "fields": ("wash_care", "shipping_info"),
                "classes": ("collapse",),
            },
        ),
        (
            "SEO",
            {
                "fields": ("meta_title", "meta_description"),
                "classes": ("collapse",),
            },
        ),
    )

    def thumbnail_preview(self, obj):
        img = obj.primary_image
        if img:
            return format_html(
                '<img src="{}" style="max-height: 50px; border-radius: 4px;" />',
                img,
            )
        return "—"

    thumbnail_preview.short_description = "Thumbnail"

    # Bulk actions
    actions = ["publish_products", "archive_products", "mark_featured"]

    @admin.action(description="Publish selected products")
    def publish_products(self, request, queryset):
        updated = queryset.update(status="published")
        self.message_user(request, f"{updated} product(s) published.")

    @admin.action(description="Archive selected products")
    def archive_products(self, request, queryset):
        updated = queryset.update(status="archived")
        self.message_user(request, f"{updated} product(s) archived.")

    @admin.action(description="Mark as Featured")
    def mark_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"{updated} product(s) marked as featured.")


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ("name", "sort_order")
    ordering = ("sort_order",)
    list_editable = ("sort_order",)


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "hex_code", "color_swatch", "sort_order")
    ordering = ("sort_order",)
    list_editable = ("sort_order",)

    def color_swatch(self, obj):
        return format_html(
            '<div style="width: 24px; height: 24px; background-color: {}; '
            'border-radius: 50%; border: 1px solid #ddd;"></div>',
            obj.hex_code,
        )

    color_swatch.short_description = "Color"
