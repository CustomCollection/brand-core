"""
Serializers for Design Editor sessions, placements, and canvas objects.
"""

from rest_framework import serializers

from apps.catalog.models import Category, PrintingMethod
from apps.catalog.serializers import CategoryDetailSerializer, ColorCatalogSerializer, PrintingMethodSerializer, SizeCatalogSerializer
from apps.products.models import Color, Size
from .models import DesignAsset, DesignSession, DesignVersion, PlacementDesign


class PlacementDesignSerializer(serializers.ModelSerializer):
    placement_label = serializers.CharField(source="get_placement_display", read_only=True)

    class Meta:
        model = PlacementDesign
        fields = (
            "id",
            "placement",
            "placement_label",
            "has_artwork",
            "canvas_json",
            "design_image_url",
            "preview_mockup_url",
            "width_inches",
            "height_inches",
            "dpi",
            "rotation_angle",
            "quality_rating",
            "design_code",
        )


class DesignSessionSerializer(serializers.ModelSerializer):
    category_detail = CategoryDetailSerializer(source="category", read_only=True)
    selected_color_detail = ColorCatalogSerializer(source="selected_color", read_only=True)
    selected_size_detail = SizeCatalogSerializer(source="selected_size", read_only=True)
    selected_printing_method_detail = PrintingMethodSerializer(
        source="selected_printing_method", read_only=True
    )
    placements = PlacementDesignSerializer(many=True, read_only=True)

    class Meta:
        model = DesignSession
        fields = (
            "id",
            "title",
            "status",
            "category",
            "category_detail",
            "selected_color",
            "selected_color_detail",
            "selected_size",
            "selected_size_detail",
            "selected_printing_method",
            "selected_printing_method_detail",
            "placements",
            "created_at",
            "updated_at",
        )


class SavePlacementDataSerializer(serializers.Serializer):
    placement = serializers.ChoiceField(choices=PlacementDesign.Placement.choices)
    has_artwork = serializers.BooleanField(default=False)
    canvas_json = serializers.JSONField(required=False, default=dict)
    design_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    preview_mockup_url = serializers.CharField(required=False, allow_blank=True, default="")
    width_inches = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=0.00)
    height_inches = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=0.00)
    dpi = serializers.IntegerField(required=False, default=300)
    rotation_angle = serializers.FloatField(required=False, default=0.0)
    quality_rating = serializers.CharField(required=False, default="Good")


class SaveDesignSessionSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, max_length=200)
    selected_color = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), required=False, allow_null=True
    )
    selected_size = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.all(), required=False, allow_null=True
    )
    selected_printing_method = serializers.PrimaryKeyRelatedField(
        queryset=PrintingMethod.objects.all(), required=False, allow_null=True
    )
    placements = SavePlacementDataSerializer(many=True, required=False)


class DesignAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignAsset
        fields = (
            "id",
            "image_url",
            "original_filename",
            "width_px",
            "height_px",
            "file_size_bytes",
            "mime_type",
            "created_at",
        )
