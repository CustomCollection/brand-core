"""
Admin configuration for Catalog & Provider Mapping.

Includes:
- Two-box filter_horizontal picker for Sizes, Colors, and Printing Methods (matching reference).
- Inlines for Placement Configurations and Provider Product/SKU Mappings.
- Image previews for all 6 placement mockups.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import Category, CategoryPlacementConfig, PrintingMethod, ProviderProductMapping


class CategoryPlacementConfigInline(admin.TabularInline):
    """Inline for managing the 6 placement boundaries and dimensions."""

    model = CategoryPlacementConfig
    extra = 0
    fields = (
        "placement",
        "is_enabled",
        "max_width_inches",
        "max_height_inches",
        "print_area_top_pct",
        "print_area_left_pct",
        "print_area_width_pct",
        "print_area_height_pct",
        "custom_mockup_url",
    )


class ProviderProductMappingInline(admin.TabularInline):
    """Inline for mapping category color/size variants to provider SKUs."""

    model = ProviderProductMapping
    extra = 1
    fields = ("provider", "color", "size", "provider_sku", "provider_product_id")


@admin.register(PrintingMethod)
class PrintingMethodAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "qikink_print_type_id",
        "max_width_inches",
        "max_height_inches",
        "additional_cost",
        "is_active",
        "sort_order",
    )
    list_editable = ("is_active", "sort_order", "additional_cost")
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}
    ordering = ("sort_order", "name")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "base_price",
        "default_color",
        "is_active",
        "sort_order",
        "front_preview",
        "created_at",
    )
    list_editable = ("base_price", "is_active", "sort_order")
    list_filter = ("is_active", "printing_methods", "created_at")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "-created_at")

    # Double-box multi-select as requested in reference image 2
    filter_horizontal = ("sizes", "colors", "printing_methods")

    inlines = [CategoryPlacementConfigInline, ProviderProductMappingInline]

    fieldsets = (
        (
            "General Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "short_description",
                    "description",
                    "base_price",
                    "default_color",
                    "is_active",
                    "sort_order",
                ),
            },
        ),
        (
            "Available Options (Sizes, Colors & Printing)",
            {
                "fields": ("sizes", "colors", "printing_methods"),
                "description": (
                    "Select which canonical sizes, colors, and printing techniques are available for this category. "
                    "In the frontend design studio, customer choices are constrained to these selections."
                ),
            },
        ),
        (
            "Default Print Dimensions",
            {
                "fields": ("default_print_width_inches", "default_print_height_inches"),
                "description": "Default maximum physical dimensions in inches across placements.",
            },
        ),
        (
            "The 6 Placement Mockup Images",
            {
                "fields": (
                    ("front_mockup", "back_mockup"),
                    ("left_pocket_mockup", "right_pocket_mockup"),
                    ("left_sleeve_mockup", "right_sleeve_mockup"),
                ),
                "description": (
                    "Provide image URLs for the 6 garment placements (fr, bk, lp, rp, ls, rs). "
                    "Fabric.js applies customer color tinting dynamically across these views."
                ),
            },
        ),
    )

    def front_preview(self, obj):
        if obj.front_mockup:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; border-radius: 4px; object-fit: contain;" />',
                obj.front_mockup,
            )
        return "No mockup"

    front_preview.short_description = "Front Mockup"


@admin.register(CategoryPlacementConfig)
class CategoryPlacementConfigAdmin(admin.ModelAdmin):
    list_display = (
        "category",
        "placement",
        "is_enabled",
        "max_width_inches",
        "max_height_inches",
        "print_area_top_pct",
        "print_area_left_pct",
        "print_area_width_pct",
        "print_area_height_pct",
    )
    list_filter = ("placement", "is_enabled", "category")
    list_editable = ("is_enabled", "max_width_inches", "max_height_inches")
    search_fields = ("category__name", "placement")


@admin.register(ProviderProductMapping)
class ProviderProductMappingAdmin(admin.ModelAdmin):
    list_display = ("category", "provider", "color", "size", "provider_sku", "provider_product_id")
    list_filter = ("provider", "category")
    search_fields = ("category__name", "provider_sku", "provider_product_id")
