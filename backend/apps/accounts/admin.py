"""
Django Admin configuration for User, Profile, and Address models.

Customized for usability as the business operations panel with:
- Search, filters, list display
- Profile inline on User
- Proper field grouping
- Bulk actions
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, Profile, User


class ProfileInline(admin.StackedInline):
    """Inline Profile editing within the User admin."""

    model = Profile
    can_delete = False
    verbose_name = "Profile"
    verbose_name_plural = "Profile"
    fields = ("phone", "avatar_url")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model using email as the identifier."""

    model = User
    inlines = [ProfileInline]

    # List view
    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_email_verified",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = (
        "is_email_verified",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)

    # Detail view
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Information",
            {"fields": ("first_name", "last_name")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_email_verified",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Important Dates",
            {"fields": ("last_login", "date_joined")},
        ),
    )
    readonly_fields = ("date_joined", "last_login")

    # Add user form
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_email_verified",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    # Bulk actions
    actions = ["verify_emails", "deactivate_users"]

    @admin.action(description="Mark selected users as email verified")
    def verify_emails(self, request, queryset):
        updated = queryset.update(is_email_verified=True)
        self.message_user(request, f"{updated} user(s) marked as email verified.")

    @admin.action(description="Deactivate selected users")
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} user(s) deactivated.")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin configuration for user addresses."""

    list_display = (
        "full_name",
        "user",
        "city",
        "state",
        "pincode",
        "is_default",
        "created_at",
    )
    list_filter = ("state", "is_default", "created_at")
    search_fields = ("full_name", "user__email", "city", "pincode")
    ordering = ("-created_at",)
    raw_id_fields = ("user",)

    fieldsets = (
        (
            "User",
            {"fields": ("user",)},
        ),
        (
            "Address Details",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "address_line_1",
                    "address_line_2",
                    "city",
                    "state",
                    "pincode",
                ),
            },
        ),
        (
            "Settings",
            {"fields": ("is_default",)},
        ),
    )
