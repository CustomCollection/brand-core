"""
Product models — the core of the catalog.

This module defines the Product, ProductImage, Size, and Color models.
Products are always available (Print-on-Demand) — no inventory tracking.
Size and Color are customer selection options, not stock attributes.
"""

from django.db import models
from django.core.validators import MinValueValidator

from apps.common.models import TimeStampedModel


class Size(models.Model):
    """
    Available T-shirt sizes (S, M, L, XL, XXL, etc.).

    These are customer selection options, NOT inventory units.
    Managed via Django Admin.
    """

    name = models.CharField(max_length=10, unique=True)
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Display order. Lower numbers appear first.",
    )

    class Meta:
        verbose_name = "size"
        verbose_name_plural = "sizes"
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class Color(models.Model):
    """
    Available T-shirt colors with hex code for frontend display.

    These are customer selection options, NOT inventory units.
    Managed via Django Admin.
    """

    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(
        max_length=7,
        help_text="Hex color code, e.g. #000000",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Display order. Lower numbers appear first.",
    )

    class Meta:
        verbose_name = "color"
        verbose_name_plural = "colors"
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    """
    Core product model for T-Shirts.

    Products are always available since this is a Print-on-Demand business.
    No inventory, stock, or quantity tracking. Customers select Size and
    Color as preferences when ordering.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    # Basic info
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(help_text="Full product description (supports Markdown).")
    short_description = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Brief description for product cards.",
    )

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="If set, shown as the sale price. Must be less than price.",
    )

    # Classification
    collections = models.ManyToManyField(
        "collections.Collection",
        related_name="products",
        blank=True,
    )
    tags = models.ManyToManyField(
        "tags.Tag",
        related_name="products",
        blank=True,
    )

    # Options (customer selections, NOT inventory)
    sizes = models.ManyToManyField(Size, related_name="products", blank=True)
    colors = models.ManyToManyField(Color, related_name="products", blank=True)

    # Flags
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Show in Featured Products section.",
    )
    is_best_seller = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Show in Best Sellers section.",
    )
    is_new_arrival = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Show in New Arrivals section.",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    # Additional info
    wash_care = models.TextField(
        blank=True,
        default="",
        help_text="Wash and care instructions.",
    )
    shipping_info = models.TextField(
        blank=True,
        default="",
        help_text="Shipping details specific to this product.",
    )

    # SEO
    meta_title = models.CharField(max_length=160, blank=True, default="")
    meta_description = models.TextField(max_length=320, blank=True, default="")

    class Meta:
        verbose_name = "product"
        verbose_name_plural = "products"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        """Return the discount price if available, otherwise the regular price."""
        if self.discount_price and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percentage(self):
        """Calculate discount percentage if a discount price is set."""
        if self.discount_price and self.discount_price < self.price:
            discount = ((self.price - self.discount_price) / self.price) * 100
            return round(discount)
        return 0

    @property
    def primary_image(self):
        """Return the primary image URL or None."""
        img = self.images.filter(is_primary=True).first()
        if img:
            return img.image_url
        img = self.images.first()
        return img.image_url if img else None

    @property
    def average_rating(self):
        """Calculate average rating from approved reviews."""
        from django.db.models import Avg

        result = self.reviews.filter(is_approved=True).aggregate(avg=Avg("rating"))
        return round(result["avg"], 1) if result["avg"] else None

    @property
    def review_count(self):
        """Count of approved reviews."""
        return self.reviews.filter(is_approved=True).count()


class ProductImage(TimeStampedModel):
    """
    Product images stored as Cloudinary URLs.

    Shared gallery for all color variants (per business requirement).
    Supports unlimited images with one marked as primary.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image_url = models.URLField(
        max_length=500,
        help_text="Cloudinary URL for the image.",
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Alt text for accessibility.",
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Primary image shown on product cards.",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Display order in the gallery.",
    )

    class Meta:
        verbose_name = "product image"
        verbose_name_plural = "product images"
        ordering = ["-is_primary", "sort_order"]

    def __str__(self):
        return f"Image for {self.product.name} ({'Primary' if self.is_primary else self.sort_order})"

    def save(self, *args, **kwargs):
        """Ensure only one primary image per product."""
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
