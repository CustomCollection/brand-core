"""
Account models: User, Profile, and Address.

User is a custom model using email as the primary identifier.
Profile is auto-created via a post_save signal when a User is created.
Address stores shipping/billing addresses with one-default-per-user logic.
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.common.models import TimeStampedModel

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email instead of username for authentication.

    This model replaces Django's default User. The email field is the unique
    identifier, and first_name/last_name are required.
    """

    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
        db_index=True,
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_email_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this user has verified their email address.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active.",
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into the admin site.",
    )
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()


class Profile(TimeStampedModel):
    """
    Extended user profile.

    Stores optional information like phone number and avatar.
    Auto-created when a User is created (via post_save signal).
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Cloudinary URL for the user's avatar image.",
    )

    class Meta:
        verbose_name = "profile"
        verbose_name_plural = "profiles"

    def __str__(self):
        return f"Profile of {self.user.email}"


class Address(TimeStampedModel):
    """
    Shipping/billing address for a user.

    Each user can have multiple addresses, but only one can be marked
    as the default. The save() method enforces this constraint.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "address"
        verbose_name_plural = "addresses"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.full_name}, {self.city} — {self.pincode}"

    def save(self, *args, **kwargs):
        """
        Ensure only one default address per user.

        If this address is being set as default, un-default all other
        addresses for the same user. If this is the user's first address,
        automatically make it the default.
        """
        if self.is_default:
            # Un-default all other addresses for this user
            Address.objects.filter(user=self.user, is_default=True).exclude(
                pk=self.pk
            ).update(is_default=False)
        elif not Address.objects.filter(user=self.user).exclude(pk=self.pk).exists():
            # First address for this user — auto-set as default
            self.is_default = True

        super().save(*args, **kwargs)
