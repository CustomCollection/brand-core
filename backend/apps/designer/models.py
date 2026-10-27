"""
Design editor models for the CustomCollection Design Engine.

Responsible for:
- User design sessions (active category, selected color, selected size, printing method).
- Independent placement canvas states (JSON representation of Fabric.js canvas for fr, bk, lp, rp, ls, rs).
- Tracking live placement metrics (width_inches, height_inches, dpi, rotation_angle, quality_rating).
- Immutable design versions for order reproducibility.
- Artwork asset uploads.
"""

import uuid
from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class DesignSession(TimeStampedModel):
    """
    Active customization session for a user or guest.
    Links the selected garment category with customer selections and per-placement designs.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SAVED = "saved", "Saved"
        ORDERED = "ordered", "Ordered"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="design_sessions",
        null=True,
        blank=True,
    )
    session_key = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Guest anonymous session identifier",
    )
    category = models.ForeignKey(
        "catalog.Category",
        on_delete=models.PROTECT,
        related_name="design_sessions",
    )
    selected_color = models.ForeignKey(
        "products.Color",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    selected_size = models.ForeignKey(
        "products.Size",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    selected_printing_method = models.ForeignKey(
        "catalog.PrintingMethod",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    title = models.CharField(max_length=200, default="Untitled Custom Tee")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    class Meta:
        verbose_name = "design session"
        verbose_name_plural = "design sessions"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.category.name}) [{self.id}]"

    @property
    def active_placements_count(self):
        return self.placements.filter(has_artwork=True).count()


class PlacementDesign(TimeStampedModel):
    """
    Canvas state and live physical dimensions for one placement slot of a design session.
    Matches Qikink placement SKUs: fr, bk, lp, rp, ls, rs.
    """

    class Placement(models.TextChoices):
        FRONT = "fr", "Front"
        BACK = "bk", "Back"
        LEFT_POCKET = "lp", "Left Pocket"
        RIGHT_POCKET = "rp", "Right Pocket"
        LEFT_SLEEVE = "ls", "Left Sleeve"
        RIGHT_SLEEVE = "rs", "Right Sleeve"

    session = models.ForeignKey(
        DesignSession,
        on_delete=models.CASCADE,
        related_name="placements",
    )
    placement = models.CharField(
        max_length=10,
        choices=Placement.choices,
        db_index=True,
    )
    canvas_json = models.JSONField(
        default=dict,
        blank=True,
        help_text="Serialized Fabric.js canvas JSON state",
    )
    has_artwork = models.BooleanField(
        default=False,
        help_text="True if customer has placed any artwork/text on this placement",
    )
    design_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Direct URL to print-ready artwork (S3 or uploaded asset)",
    )
    preview_mockup_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Rendered composite mockup preview image URL",
    )

    # Physical dimensions & metrics tracked live from Fabric.js canvas
    width_inches = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    height_inches = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    dpi = models.PositiveIntegerField(default=300)
    rotation_angle = models.FloatField(default=0.0)
    quality_rating = models.CharField(
        max_length=20,
        default="Good",
        help_text="Calculated resolution quality: Excellent (>=300), Good (150-299), Bad (<150)",
    )

    # Qikink specific code (max 20 characters)
    design_code = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="Unique design code for Qikink orders",
    )

    class Meta:
        verbose_name = "placement design"
        verbose_name_plural = "placement designs"
        unique_together = ("session", "placement")
        ordering = ["session", "placement"]

    def __str__(self):
        return f"{self.session.title} — {self.get_placement_display()} ({'Has Design' if self.has_artwork else 'Empty'})"

    def save(self, *args, **kwargs):
        if not self.design_code:
            # Generate max 20 char design code like DSG_ABC123XYZ
            self.design_code = f"DSG_{uuid.uuid4().hex[:14].upper()}"
        super().save(*args, **kwargs)


class DesignVersion(TimeStampedModel):
    """
    Immutable version snapshot for a design session.
    Locked upon checkout so order history remains exact even if user later modifies the session.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        DesignSession,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField(default=1)
    snapshot = models.JSONField(help_text="Full immutable snapshot of session and placement states")
    is_final_order = models.BooleanField(
        default=False,
        help_text="Marked true when this version was submitted with an order",
    )

    class Meta:
        verbose_name = "design version"
        verbose_name_plural = "design versions"
        ordering = ["session", "-version_number"]
        unique_together = ("session", "version_number")

    def __str__(self):
        return f"{self.session.title} v{self.version_number} ({'Locked Order' if self.is_final_order else 'Draft'})"


class DesignAsset(TimeStampedModel):
    """
    Uploaded artwork files (PNG, JPG, SVG) for use in the design editor.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_design_assets",
    )
    image_url = models.URLField(max_length=500, help_text="Stored image URL (Cloudinary / S3)")
    original_filename = models.CharField(max_length=255, blank=True, default="")
    width_px = models.PositiveIntegerField(default=0)
    height_px = models.PositiveIntegerField(default=0)
    file_size_bytes = models.PositiveIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True, default="image/png")

    class Meta:
        verbose_name = "design asset"
        verbose_name_plural = "design assets"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.original_filename or 'Asset'} ({self.width_px}x{self.height_px})"
