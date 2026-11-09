"""
Admin configuration for AI Design Workspace.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import AIConversation, AIMessage, GeneratedArtwork, TokenPackage, UserTokenAccount


class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0
    fields = ("role", "content", "reference_preview", "artwork_preview", "created_at")
    readonly_fields = ("reference_preview", "artwork_preview", "created_at")

    def reference_preview(self, obj):
        if obj.reference_image_url:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="max-height: 50px; border-radius: 4px;" /></a>',
                obj.reference_image_url,
                obj.reference_image_url,
            )
        return "—"

    def artwork_preview(self, obj):
        if obj.generated_image_url:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="max-height: 50px; border-radius: 4px;" /></a>',
                obj.generated_image_url,
                obj.generated_image_url,
            )
        return "—"


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "session_key", "total_generations", "updated_at", "created_at")
    search_fields = ("title", "user__email", "session_key")
    list_filter = ("created_at", "updated_at")
    inlines = [AIMessageInline]


@admin.register(GeneratedArtwork)
class GeneratedArtworkAdmin(admin.ModelAdmin):
    list_display = ("preview", "prompt_short", "user", "provider", "model_name", "created_at")
    list_filter = ("provider", "created_at")
    search_fields = ("prompt_used", "user__email")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.image_url:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="max-height: 60px; max-width: 60px; border-radius: 6px; object-fit: cover;" /></a>',
                obj.image_url,
                obj.image_url,
            )
        return "No image"

    def prompt_short(self, obj):
        return obj.prompt_used[:60] + "..." if len(obj.prompt_used) > 60 else obj.prompt_used


@admin.register(UserTokenAccount)
class UserTokenAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "session_key", "daily_free_tokens", "purchased_tokens", "total_tokens_used", "last_reset_date")
    search_fields = ("user__email", "session_key")
    list_filter = ("last_reset_date",)


@admin.register(TokenPackage)
class TokenPackageAdmin(admin.ModelAdmin):
    list_display = ("name", "tokens", "price", "badge_text", "is_active", "sort_order")
    list_editable = ("price", "is_active", "sort_order")
    ordering = ("sort_order", "price")
