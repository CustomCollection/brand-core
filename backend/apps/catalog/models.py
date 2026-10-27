"""
Catalog models for the CustomCollection Design Engine.

Responsible for:
- Garment categories available for custom designing (e.g. Unisex Classic Crew T-Shirt | UC21, Oversized T-Shirt, Hoodie).
- Allowed canonical color and size mappings per category via filter_horizontal in Django admin.
- Printing methods supported by fulfillment providers (DTG, DTF, Sublimation, etc.) with physical constraint limits.
- Placement compatibility and printable area bounding box parameters per category (fr, bk, lp, rp, ls, rs).
- Provider SKU and product mappings (e.g. Qikink catalog SKU mappings).
"""

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class PrintingMethod(TimeStampedModel):
    """
    Printing techniques supported by fulfillment providers.

    Managed via Django Admin so admins can add new techniques (e.g. Sublimation,
    Embroidery, Puff) without code changes.
    """

    name = models.CharField(max_length=100, unique=True, help_text="e.g. DTG Printing, DTF Printing")
    code = models.SlugField(max_length=50, unique=True, help_text="e.g. dtg, dtf, sublimation")
    qikink_print_type_id = models.PositiveIntegerField(
        help_text="Qikink print_type_id enum (e.g. 1=DTG, 17=DTF, 2=All Over Print, 3=Embroidery, 23=Sublimation)"
    )
    description = models.TextField(blank=True, default="")
    max_width_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=16.00,
        help_text="Max print width allowed by provider in inches (e.g. 16.0 for DTG, 18.0 for DTF)",
    )
    max_height_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.00,
        help_text="Max print height allowed by provider in inches (e.g. 20.0 for DTG, 20.0 for DTF)",
    )
    additional_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        help_text="Additional base cost for this printing technique (in INR)",
    )
    is_active = models.BooleanField(default=True, help_text="Show as available option in design editor")
    sort_order = models.PositiveIntegerField(default=0, help_text="Display order in design editor")

    class Meta:
        verbose_name = "printing method"
        verbose_name_plural = "printing methods"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return f"{self.name} (Qikink ID: {self.qikink_print_type_id})"


class Category(TimeStampedModel):
    """
    Customizable garment category (e.g. Unisex Classic Crew T-Shirt | UC21, Oversized T-Shirt).

    Distinct from collections.Collection:
    - Collection: for predefined graphic t-shirts displayed on the storefront.
    - Category: for blank customizable apparel with 6 printable placement mockups.
    """

    name = models.CharField(max_length=200, help_text="e.g. Unisex Classic Crew T-Shirt | UC21")
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(blank=True, default="", help_text="Garment fabric specs, GSM, fit details")
    short_description = models.CharField(max_length=300, blank=True, default="")
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=499.00,
        validators=[MinValueValidator(0)],
        help_text="Base plain garment price in INR",
    )
    is_active = models.BooleanField(default=True, db_index=True, help_text="Whether this category can be designed")
    sort_order = models.PositiveIntegerField(default=0, help_text="Display priority in category selector")

    # Options: Customer selections picked in Django admin via filter_horizontal
    sizes = models.ManyToManyField(
        "products.Size",
        related_name="custom_categories",
        blank=True,
        help_text="Available sizes for this category (XS, S, M, L, XL, XXL, etc.)",
    )
    colors = models.ManyToManyField(
        "products.Color",
        related_name="custom_categories",
        blank=True,
        help_text="Available colors for this category with hex codes",
    )
    default_color = models.ForeignKey(
        "products.Color",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        help_text="Initial color shown when opening the design editor",
    )
    printing_methods = models.ManyToManyField(
        PrintingMethod,
        related_name="categories",
        blank=True,
        help_text="Printing techniques supported for this garment type",
    )

    # Placement Mockup Images (The 6 placements for this garment style)
    front_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Front placement (fr) base mockup image URL",
    )
    back_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Back placement (bk) base mockup image URL",
    )
    left_pocket_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Left pocket placement (lp) base mockup image URL",
    )
    right_pocket_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Right pocket placement (rp) base mockup image URL",
    )
    left_sleeve_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Left sleeve/shoulder placement (ls) base mockup image URL",
    )
    right_sleeve_mockup = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Right sleeve/shoulder placement (rs) base mockup image URL",
    )

    # Default printable area dimensions (inches)
    default_print_width_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=12.00,
        help_text="Default print area width in inches (e.g. 12.0)",
    )
    default_print_height_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=16.00,
        help_text="Default print area height in inches (e.g. 16.0)",
    )

    class Meta:
        verbose_name = "category"
        verbose_name_plural = "categories"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    def get_mockup_for_placement(self, placement_code):
        """Return the mockup URL for a specific placement code."""
        mapping = {
            "fr": self.front_mockup,
            "bk": self.back_mockup,
            "lp": self.left_pocket_mockup,
            "rp": self.right_pocket_mockup,
            "ls": self.left_sleeve_mockup,
            "rs": self.right_sleeve_mockup,
        }
        return mapping.get(placement_code, self.front_mockup)


class CategoryPlacementConfig(TimeStampedModel):
    """
    Detailed printable area bounding box and dimension configuration for a placement.

    Controls where the red dashed bounding box appears on the mockup and the maximum
    print dimensions allowed for that placement (e.g. Pocket is 4x4 in, Front is 12x16 in).
    """

    class PlacementChoice(models.TextChoices):
        FRONT = "fr", "Front"
        BACK = "bk", "Back"
        LEFT_POCKET = "lp", "Left Pocket"
        RIGHT_POCKET = "rp", "Right Pocket"
        LEFT_SLEEVE = "ls", "Left Sleeve"
        RIGHT_SLEEVE = "rs", "Right Sleeve"

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="placement_configs",
    )
    placement = models.CharField(
        max_length=10,
        choices=PlacementChoice.choices,
        help_text="Placement SKU code conforming to Qikink (fr, bk, lp, rp, ls, rs)",
    )
    is_enabled = models.BooleanField(
        default=True,
        help_text="Enable or disable this placement for this category",
    )
    max_width_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=12.00,
        help_text="Maximum printable width in inches (e.g. 12.00 for Front, 4.00 for Pocket)",
    )
    max_height_inches = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=16.00,
        help_text="Maximum printable height in inches (e.g. 16.00 for Front, 4.00 for Pocket)",
    )

    # Bounding box relative positioning on the mockup canvas (percentages 0-100)
    print_area_top_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=25.00,
        help_text="Top percentage of bounding box on mockup (e.g. 25.0%)",
    )
    print_area_left_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=28.00,
        help_text="Left percentage of bounding box on mockup (e.g. 28.0%)",
    )
    print_area_width_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=44.00,
        help_text="Width percentage of bounding box on mockup (e.g. 44.0%)",
    )
    print_area_height_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.00,
        help_text="Height percentage of bounding box on mockup (e.g. 50.0%)",
    )
    custom_mockup_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Optional custom mockup URL overriding Category default for this placement",
    )

    class Meta:
        verbose_name = "category placement configuration"
        verbose_name_plural = "category placement configurations"
        unique_together = ("category", "placement")
        ordering = ["category", "placement"]

    def __str__(self):
        return f"{self.category.name} — {self.get_placement_display()} ({self.placement})"


class ProviderProductMapping(TimeStampedModel):
    """
    Maps an internal category, color, and size combination to a fulfillment provider SKU.

    Example:
    Category="Unisex Classic Crew T-Shirt", Color="White", Size="S" -> Provider SKU "MVnHs-Wh-S"
    Used in Phase 5 when constructing Qikink order payloads.
    """

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="provider_mappings",
    )
    color = models.ForeignKey(
        "products.Color",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Leave blank if provider SKU applies to all colors",
    )
    size = models.ForeignKey(
        "products.Size",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Leave blank if provider SKU applies to all sizes",
    )
    provider = models.CharField(
        max_length=50,
        default="qikink",
        help_text="Fulfillment provider identifier",
    )
    provider_sku = models.CharField(
        max_length=100,
        help_text="SKU recognized by provider (e.g. MVnHs-Wh-S, UC21-WHT-S)",
    )
    provider_product_id = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional external provider product ID",
    )

    class Meta:
        verbose_name = "provider product mapping"
        verbose_name_plural = "provider product mappings"
        unique_together = ("category", "color", "size", "provider")
        ordering = ["category", "provider", "provider_sku"]

    def __str__(self):
        c_name = self.color.name if self.color else "Any"
        s_name = self.size.name if self.size else "Any"
        return f"{self.category.name} [{c_name}/{s_name}] -> {self.provider}:{self.provider_sku}"
