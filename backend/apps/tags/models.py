"""
Tag models — flexible product labels like Minimal, Graphic, Anime.

Tags provide a secondary classification system that complements collections.
A product can have many tags, and tags are used for filtering.
"""

from django.db import models

from apps.common.models import TimeStampedModel


class Tag(TimeStampedModel):
    """
    Product tag for flexible categorization.

    Tags like 'Minimal', 'Graphic', 'Anime', 'Cotton' allow customers
    to filter products by design style, material, or theme.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Only active tags are shown on the storefront.",
    )

    class Meta:
        verbose_name = "tag"
        verbose_name_plural = "tags"
        ordering = ["name"]

    def __str__(self):
        return self.name
