"""
Product serializers for catalog listing, detail, and admin-facing representations.
"""

from rest_framework import serializers

from apps.collections.serializers import CollectionMinimalSerializer
from apps.tags.serializers import TagSerializer

from .models import Color, Product, ProductImage, Size


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ["id", "name", "sort_order"]


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ["id", "name", "hex_code", "sort_order"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_url", "alt_text", "is_primary", "sort_order"]


class ProductListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for product listing pages.

    Includes only the data needed for product cards: image, price,
    discount info, and basic metadata.
    """

    primary_image = serializers.CharField(read_only=True)
    effective_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    discount_percentage = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    collections = CollectionMinimalSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "price",
            "discount_price",
            "effective_price",
            "discount_percentage",
            "primary_image",
            "is_featured",
            "is_best_seller",
            "is_new_arrival",
            "average_rating",
            "review_count",
            "collections",
            "tags",
            "created_at",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Full product detail serializer with all images, options, and metadata.
    """

    images = ProductImageSerializer(many=True, read_only=True)
    collections = CollectionMinimalSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    colors = ColorSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    discount_percentage = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "price",
            "discount_price",
            "effective_price",
            "discount_percentage",
            "images",
            "collections",
            "tags",
            "sizes",
            "colors",
            "is_featured",
            "is_best_seller",
            "is_new_arrival",
            "wash_care",
            "shipping_info",
            "average_rating",
            "review_count",
            "meta_title",
            "meta_description",
            "created_at",
            "updated_at",
        ]
