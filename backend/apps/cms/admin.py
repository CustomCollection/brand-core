"""
CMS Django Admin — manage all dynamic site content.

This is where the admin controls everything the customer sees:
hero banners, homepage sections, announcements, brand info, social links,
contact details, and footer content — all without code changes.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import AnnouncementBar, HeroBanner, HomepageSection, SiteConfig


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    """Singleton site configuration — all brand and contact info."""

    fieldsets = (
        (
            "Brand Identity",
            {"fields": ("brand_name", "brand_tagline", "brand_description", "logo_url", "favicon_url")},
        ),
        (
            "Contact Information",
            {"fields": ("contact_email", "contact_phone", "address")},
        ),
        (
            "Social Media",
            {"fields": ("instagram_url", "twitter_url", "facebook_url", "youtube_url")},
        ),
        (
            "Footer",
            {"fields": ("footer_text",)},
        ),
        (
            "SEO",
            {"fields": ("meta_title", "meta_description")},
        ),
    )

    def has_add_permission(self, request):
        return not SiteConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "sort_order", "image_preview", "created_at")
    list_filter = ("is_active",)
    list_editable = ("is_active", "sort_order")
    ordering = ("sort_order",)

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 50px; border-radius: 4px;" />', obj.image_url
            )
        return "—"

    image_preview.short_description = "Preview"


@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = ("section_type", "title", "is_active", "sort_order")
    list_filter = ("is_active", "section_type")
    list_editable = ("is_active", "sort_order")
    ordering = ("sort_order",)

    fieldsets = (
        (None, {"fields": ("section_type", "title", "subtitle")}),
        ("Content", {"fields": ("content", "image_url"), "classes": ("collapse",)}),
        ("Display", {"fields": ("is_active", "sort_order")}),
    )


@admin.register(AnnouncementBar)
class AnnouncementBarAdmin(admin.ModelAdmin):
    list_display = ("text", "link_url", "is_active", "created_at")
    list_filter = ("is_active",)
    list_editable = ("is_active",)
