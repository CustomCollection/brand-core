"""
Collection models — product groupings like Oversized, Regular Fit.

A product can belong to multiple collections. Collections are displayed
on the homepage and used as primary navigation/filter categories.
"""

from django.db import models

from apps.common.models import TimeStampedModel


class Collection(TimeStampedModel):
    """
    Product collection representing a category like 'Oversized' or 'Regular Fit'.

    Collections are managed via Django Admin and surfaced through the API
    for navigation, filtering, and homepage display.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Cloudinary URL for the collection image.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only active collections are shown on the storefront.",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first.",
    )
    meta_title = models.CharField(max_length=160, blank=True, default="")
    meta_description = models.TextField(max_length=320, blank=True, default="")

    class Meta:
        verbose_name = "collection"
        verbose_name_plural = "collections"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    @property
    def product_count(self):
        """Return the number of published products in this collection."""
        return self.products.filter(status="published").count()
