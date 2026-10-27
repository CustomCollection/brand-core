"""
Admin configuration for Fabric.js Design Editor.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import DesignAsset, DesignSession, DesignVersion, PlacementDesign


class PlacementDesignInline(admin.TabularInline):
    model = PlacementDesign
    extra = 0
    fields = (
        "placement",
        "has_artwork",
        "width_inches",
        "height_inches",
        "dpi",
        "quality_rating",
        "rotation_angle",
        "design_code",
        "preview_render",
    )
    readonly_fields = ("preview_render",)

    def preview_render(self, obj):
        if obj.preview_mockup_url:
            return format_html(
                '<img src="{}" style="max-height: 60px; max-width: 60px; border-radius: 4px;" />',
                obj.preview_mockup_url,
            )
        return "No mockup"

    preview_render.short_description = "Preview"


class DesignVersionInline(admin.TabularInline):
    model = DesignVersion
    extra = 0
    fields = ("version_number", "is_final_order", "created_at")
    readonly_fields = ("version_number", "is_final_order", "created_at")


@admin.register(DesignSession)
class DesignSessionAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "category",
        "selected_color",
        "selected_size",
        "selected_printing_method",
        "status",
        "active_placements_display",
        "updated_at",
    )
    list_filter = ("status", "category", "selected_color", "selected_size", "created_at")
    search_fields = ("title", "id", "user__email", "session_key")
    ordering = ("-updated_at",)
    inlines = [PlacementDesignInline, DesignVersionInline]

    def active_placements_display(self, obj):
        count = obj.active_placements_count
        return format_html("<b>{}</b> placement(s)", count)

    active_placements_display.short_description = "Active Placements"


@admin.register(PlacementDesign)
class PlacementDesignAdmin(admin.ModelAdmin):
    list_display = (
        "session",
        "placement",
        "has_artwork",
        "width_inches",
        "height_inches",
        "dpi",
        "quality_rating",
        "design_code",
        "updated_at",
    )
    list_filter = ("placement", "has_artwork", "quality_rating")
    search_fields = ("design_code", "session__title", "session__id")


@admin.register(DesignVersion)
class DesignVersionAdmin(admin.ModelAdmin):
    list_display = ("session", "version_number", "is_final_order", "created_at")
    list_filter = ("is_final_order",)
    search_fields = ("session__title", "session__id")


@admin.register(DesignAsset)
class DesignAssetAdmin(admin.ModelAdmin):
    list_display = (
        "original_filename",
        "user",
        "width_px",
        "height_px",
        "mime_type",
        "file_size_display",
        "preview",
        "created_at",
    )
    search_fields = ("original_filename", "user__email")
    readonly_fields = ("preview",)

    def file_size_display(self, obj):
        if obj.file_size_bytes < 1024:
            return f"{obj.file_size_bytes} B"
        elif obj.file_size_bytes < 1024 * 1024:
            return f"{round(obj.file_size_bytes / 1024, 1)} KB"
        return f"{round(obj.file_size_bytes / (1024 * 1024), 2)} MB"

    file_size_display.short_description = "Size"

    def preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 60px; max-width: 60px; border-radius: 4px;" />',
                obj.image_url,
            )
        return "No image"
