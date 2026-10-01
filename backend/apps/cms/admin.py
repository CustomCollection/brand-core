"""
CMS Django Admin — manage all dynamic site content.

This is where the admin controls everything the customer sees:
hero banners, homepage sections, announcements, brand info, social links,
contact details, and footer content — all without code changes.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    AnnouncementBar,
    ContactMessage,
    HeroBanner,
    HomepageSection,
    NewsletterSubscriber,
    SiteConfig,
)


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
        (
            "First-Visit Registration Modal",
            {
                "fields": (
                    "register_popup_enabled",
                    "register_popup_title",
                    "register_popup_subtitle",
                    "register_popup_bg_image",
                    "register_popup_btn_text",
                ),
                "description": "Customize the popup prompt shown once to new visitors inviting them to register.",
            },
        ),
    )

    def has_add_permission(self, request):
        return not SiteConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "show_content", "is_active", "sort_order", "image_preview", "created_at")
    list_filter = ("is_active", "show_content")
    list_editable = ("show_content", "is_active", "sort_order")
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
    list_display = ("title", "collection", "subtitle", "is_active", "sort_order")
    list_filter = ("is_active", "collection")
    list_editable = ("is_active", "sort_order")
    ordering = ("sort_order", "-created_at")
    fields = ("collection", "title", "subtitle", "is_active", "sort_order")


@admin.register(AnnouncementBar)
class AnnouncementBarAdmin(admin.ModelAdmin):
    list_display = ("text", "link_url", "sort_order", "is_active", "created_at")
    list_filter = ("is_active",)
    list_editable = ("sort_order", "is_active")
    ordering = ("sort_order", "-created_at")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "subject", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    list_editable = ("is_read",)
    search_fields = ("name", "email", "phone", "subject", "message")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    list_editable = ("is_active",)
    search_fields = ("email",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
