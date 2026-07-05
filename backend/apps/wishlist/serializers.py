"""Wishlist serializers."""

from rest_framework import serializers

from apps.products.serializers import ProductListSerializer

from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    """Wishlist item with full product data for display."""

    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]


class WishlistAddSerializer(serializers.Serializer):
    """Validates adding a product to the wishlist."""

    product_id = serializers.IntegerField()
