"""Wishlist model — authenticated users can save favorite products."""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel
from apps.products.models import Product


class WishlistItem(TimeStampedModel):
    """
    A product saved to a user's wishlist.

    Each user can save a product only once (unique_together constraint).
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )

    class Meta:
        verbose_name = "wishlist item"
        verbose_name_plural = "wishlist items"
        unique_together = ("user", "product")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.product.name}"
