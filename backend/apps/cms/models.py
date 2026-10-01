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

    # First-Visit Registration Popup
    register_popup_enabled = models.BooleanField(
        default=True,
        help_text="Show first-visit registration reminder popup to unauthenticated visitors.",
    )
    register_popup_title = models.CharField(
        max_length=200,
        blank=True,
        default="DON'T FORGET TO REGISTER",
        help_text="Catchy headline for the first-visit registration prompt.",
    )
    register_popup_subtitle = models.CharField(
        max_length=300,
        blank=True,
        default="Create an account to track your orders, save items to your wishlist, and enjoy a seamless shopping experience.",
        help_text="Subtext shown on the popup.",
    )
    register_popup_bg_image = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Background image URL for the registration popup modal.",
    )
    register_popup_btn_text = models.CharField(
        max_length=50,
        blank=True,
        default="CREATE AN ACCOUNT",
        help_text="Button text redirecting user to the register page.",
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

    title = models.CharField(max_length=200, blank=True, default="")
    subtitle = models.CharField(max_length=300, blank=True, default="")
    image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Cloudinary URL for the banner image.",
    )
    link_url = models.URLField(max_length=500, blank=True, default="")
    link_text = models.CharField(max_length=100, blank=True, default="")
    show_content = models.BooleanField(
        default=True,
        verbose_name="Show Title & Subtitle on Banner",
        help_text="Uncheck to hide title, subtitle, and CTA button, and keep the original clean image without dark shading.",
    )
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
    Configurable homepage sections linked to a collection.

    Displays 4 products from the selected collection with a custom/default title,
    subtitle, and a link to view all products in the collection.
    """

    collection = models.ForeignKey(
        "collections.Collection",
        on_delete=models.CASCADE,
        related_name="homepage_sections",
        null=True,
        blank=False,
        help_text="Select a collection to display in this homepage section.",
    )
    title = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Custom title. If left blank, defaults to the collection name.",
    )
    subtitle = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Optional subtitle or tagline displayed above the section title.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Toggle to show or hide this section on the homepage.",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first on the homepage.",
    )

    class Meta:
        verbose_name = "homepage section"
        verbose_name_plural = "homepage sections"
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title or (self.collection.name if self.collection else "Unnamed Section")

    def save(self, *args, **kwargs):
        """Auto-populate title from collection if not specified."""
        if not self.title and self.collection_id:
            self.title = self.collection.name
        super().save(*args, **kwargs)


class AnnouncementBar(TimeStampedModel):
    """
    Announcement bar displayed as a floating card from the bottom of the screen.

    Displays active announcements sequentially in sort_order.
    """

    text = models.CharField(max_length=300)
    link_url = models.URLField(max_length=500, blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Display priority (lower numbers appear first).",
    )

    class Meta:
        verbose_name = "announcement"
        verbose_name_plural = "announcements"
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.text[:60]


class ContactMessage(TimeStampedModel):
    """
    Customer inquiry messages submitted via the Contact modal.
    """

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=25, blank=True, default="")
    subject = models.CharField(max_length=200, blank=True, default="")
    message = models.TextField()
    is_read = models.BooleanField(
        default=False,
        help_text="Mark as read once reviewed by admin.",
    )

    class Meta:
        verbose_name = "contact message"
        verbose_name_plural = "contact messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.subject or 'Inquiry'}"


class NewsletterSubscriber(TimeStampedModel):
    """
    Subscribers who joined the newsletter / email updates via footer.
    """

    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "newsletter subscriber"
        verbose_name_plural = "newsletter subscribers"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email
