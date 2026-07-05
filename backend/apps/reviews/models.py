"""
Review model — verified purchase reviews with admin moderation.
"""

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel
from apps.products.models import Product


class Review(TimeStampedModel):
    """
    Product review submitted by a verified purchaser.

    Reviews require admin approval (is_approved) before being publicly visible.
    Each user can submit only one review per product.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    title = models.CharField(max_length=200, blank=True, default="")
    text = models.TextField()
    is_approved = models.BooleanField(
        default=False,
        help_text="Only approved reviews are shown on the storefront.",
    )

    class Meta:
        verbose_name = "review"
        verbose_name_plural = "reviews"
        unique_together = ("product", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by {self.user.email} on {self.product.name} ({self.rating}★)"
