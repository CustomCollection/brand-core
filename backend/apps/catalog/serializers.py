"""
Serializers for Catalog & Provider Mapping.
"""

from rest_framework import serializers

from apps.products.models import Color, Size
from .models import Category, CategoryPlacementConfig, PrintingMethod, ProviderProductMapping


class SizeCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ("id", "name", "sort_order")


class ColorCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("id", "name", "hex_code", "sort_order")


class PrintingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintingMethod
        fields = (
            "id",
            "name",
            "code",
            "qikink_print_type_id",
            "description",
            "max_width_inches",
            "max_height_inches",
            "additional_cost",
        )


class CategoryPlacementConfigSerializer(serializers.ModelSerializer):
    placement_label = serializers.CharField(source="get_placement_display", read_only=True)

    class Meta:
        model = CategoryPlacementConfig
        fields = (
            "placement",
            "placement_label",
            "is_enabled",
            "max_width_inches",
            "max_height_inches",
            "print_area_top_pct",
            "print_area_left_pct",
            "print_area_width_pct",
            "print_area_height_pct",
            "custom_mockup_url",
        )


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category cards on the design studio hub."""

    colors_count = serializers.IntegerField(source="colors.count", read_only=True)
    sizes_count = serializers.IntegerField(source="sizes.count", read_only=True)
    printing_methods = PrintingMethodSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "short_description",
            "base_price",
            "front_mockup",
            "back_mockup",
            "colors_count",
            "sizes_count",
            "printing_methods",
        )


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer loaded by the Fabric.js interactive canvas editor."""

    sizes = SizeCatalogSerializer(many=True, read_only=True)
    colors = ColorCatalogSerializer(many=True, read_only=True)
    default_color = ColorCatalogSerializer(read_only=True)
    printing_methods = PrintingMethodSerializer(many=True, read_only=True)
    placements = serializers.SerializerMethodField()
    mockups = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "base_price",
            "sizes",
            "colors",
            "default_color",
            "printing_methods",
            "mockups",
            "placements",
            "default_print_width_inches",
            "default_print_height_inches",
        )

    def get_mockups(self, obj):
        return {
            "fr": obj.front_mockup,
            "bk": obj.back_mockup,
            "lp": obj.left_pocket_mockup,
            "rp": obj.right_pocket_mockup,
            "ls": obj.left_sleeve_mockup,
            "rs": obj.right_sleeve_mockup,
        }

    def get_placements(self, obj):
        """
        Return the 6 placement definitions, merging explicit CategoryPlacementConfig
        rows with sensible defaults for any unconfigured placement.
        """
        existing = {pc.placement: pc for pc in obj.placement_configs.all()}
        all_placements = [
            ("fr", "Front", 12.0, 16.0, 24.0, 28.0, 44.0, 52.0),
            ("bk", "Back", 12.0, 16.0, 24.0, 28.0, 44.0, 52.0),
            ("lp", "Left Pocket", 4.0, 4.0, 26.0, 58.0, 18.0, 20.0),
            ("rp", "Right Pocket", 4.0, 4.0, 26.0, 24.0, 18.0, 20.0),
            ("ls", "Left Sleeve", 4.0, 4.0, 35.0, 65.0, 20.0, 22.0),
            ("rs", "Right Sleeve", 4.0, 4.0, 35.0, 15.0, 20.0, 22.0),
        ]

        result = []
        for code, label, w, h, top, left, width_pct, height_pct in all_placements:
            if code in existing:
                cfg = existing[code]
                result.append(
                    {
                        "placement": cfg.placement,
                        "placement_label": cfg.get_placement_display(),
                        "is_enabled": cfg.is_enabled,
                        "max_width_inches": float(cfg.max_width_inches),
                        "max_height_inches": float(cfg.max_height_inches),
                        "print_area_top_pct": float(cfg.print_area_top_pct),
                        "print_area_left_pct": float(cfg.print_area_left_pct),
                        "print_area_width_pct": float(cfg.print_area_width_pct),
                        "print_area_height_pct": float(cfg.print_area_height_pct),
                        "mockup_url": cfg.custom_mockup_url or obj.get_mockup_for_placement(code),
                    }
                )
            else:
                result.append(
                    {
                        "placement": code,
                        "placement_label": label,
                        "is_enabled": True,
                        "max_width_inches": float(w),
                        "max_height_inches": float(h),
                        "print_area_top_pct": float(top),
                        "print_area_left_pct": float(left),
                        "print_area_width_pct": float(width_pct),
                        "print_area_height_pct": float(height_pct),
                        "mockup_url": obj.get_mockup_for_placement(code),
                    }
                )
        return result
