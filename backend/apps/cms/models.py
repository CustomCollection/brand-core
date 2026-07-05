"""
CMS models — all dynamic content managed from Django Admin.

Everything the customer sees on the homepage and site-wide is stored here
and served via APIs. No code changes needed to update content.

Models:
- SiteConfig: Singleton with brand info, social links, contact details
- HeroBanner: Rotating hero banners
- HomepageSection: Configurable homepage sections (custom design, featured, etc.)
- AnnouncementBar: Top-of-page announcements
"""

from django.db import models

from apps.common.models import TimeStampedModel


class SiteConfig(models.Model):
    """
    Singleton model for site-wide configuration.

    All brand information, contact details, social links, and footer
    content are managed here. Only one instance can exist.
    """

    # Brand
    brand_name = models.CharField(max_length=100, default="CustomCollection")
    brand_tagline = models.CharField(max_length=200, blank=True, default="Premium Clothing Brand")
    brand_description = models.TextField(
        blank=True,
        default="Discover premium T-shirts crafted for those who appreciate quality and style.",
    )
    logo_url = models.URLField(max_length=500, blank=True, default="")
    favicon_url = models.URLField(max_length=500, blank=True, default="")

    # Contact
    contact_email = models.EmailField(blank=True, default="")
    contact_phone = models.CharField(max_length=20, blank=True, default="")
    address = models.TextField(blank=True, default="")

    # Social Links
    instagram_url = models.URLField(max_length=500, blank=True, default="")
    twitter_url = models.URLField(max_length=500, blank=True, default="")
    facebook_url = models.URLField(max_length=500, blank=True, default="")
    youtube_url = models.URLField(max_length=500, blank=True, default="")

    # Footer
    footer_text = models.TextField(blank=True, default="")

    # SEO
    meta_title = models.CharField(
        max_length=160, blank=True, default="CustomCollection — Premium Clothing Brand"
    )
    meta_description = models.TextField(
        max_length=320,
        blank=True,
        default="Shop premium T-shirts at CustomCollection. Quality designs, crafted just for you.",
    )

    class Meta:
        verbose_name = "site configuration"
        verbose_name_plural = "site configuration"

    def __str__(self):
        return self.brand_name

    def save(self, *args, **kwargs):
        """Enforce singleton — only one config row."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """Get or create the singleton site config."""
        config, _ = cls.objects.get_or_create(pk=1)
        return config


class HeroBanner(TimeStampedModel):
    """
    Hero banner displayed at the top of the homepage.

    Multiple banners can be active for rotation. Sort order controls display.
    """

    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True, default="")
    image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Cloudinary URL for the banner image.",
    )
    link_url = models.URLField(max_length=500, blank=True, default="")
    link_text = models.CharField(max_length=100, blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "hero banner"
        verbose_name_plural = "hero banners"
        ordering = ["sort_order"]

    def __str__(self):
        return self.title


class HomepageSection(TimeStampedModel):
    """
    Configurable homepage sections.

    Each section has a type that determines how the frontend renders it.
    Admin can enable/disable sections and control their order.
    """

    class SectionType(models.TextChoices):
        CUSTOM_DESIGN = "custom_design", "Custom Design (Coming Soon)"
        FEATURED_COLLECTIONS = "featured_collections", "Featured Collections"
        FEATURED_PRODUCTS = "featured_products", "Featured Products"
        BEST_SELLERS = "best_sellers", "Best Sellers"
        NEW_ARRIVALS = "new_arrivals", "New Arrivals"
        ABOUT = "about", "About Brand"
        NEWSLETTER = "newsletter", "Newsletter"

    section_type = models.CharField(
        max_length=30,
        choices=SectionType.choices,
        unique=True,
    )
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True, default="")
    content = models.TextField(
        blank=True,
        default="",
        help_text="Rich text content for sections like About.",
    )
    image_url = models.URLField(max_length=500, blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "homepage section"
        verbose_name_plural = "homepage sections"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.get_section_type_display()} — {self.title}"


class AnnouncementBar(TimeStampedModel):
    """
    Announcement bar displayed at the top of the website.

    Only active announcements are shown. Multiple can be set for rotation.
    """

    text = models.CharField(max_length=300)
    link_url = models.URLField(max_length=500, blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "announcement"
        verbose_name_plural = "announcements"
        ordering = ["-created_at"]

    def __str__(self):
        return self.text[:60]
