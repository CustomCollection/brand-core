"""Cart serializers."""

from rest_framework import serializers

from apps.products.serializers import ColorSerializer, SizeSerializer

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for individual cart items with computed line total."""

    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image = serializers.CharField(source="product.primary_image", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )
    product_discount_price = serializers.DecimalField(
        source="product.discount_price", max_digits=10, decimal_places=2, read_only=True
    )
    effective_price = serializers.DecimalField(
        source="product.effective_price", max_digits=10, decimal_places=2, read_only=True
    )
    size = SizeSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_slug",
            "product_image",
            "product_price",
            "product_discount_price",
            "effective_price",
            "size",
            "color",
            "quantity",
            "line_total",
        ]


class CartSerializer(serializers.ModelSerializer):
    """Full cart serializer with items and totals."""

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "subtotal"]


class AddToCartSerializer(serializers.Serializer):
    """Validates add-to-cart request data."""

    product_id = serializers.IntegerField()
    size_id = serializers.IntegerField()
    color_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Validates cart item quantity update."""

    quantity = serializers.IntegerField(min_value=1)


class MergeCartSerializer(serializers.Serializer):
    """Validates guest cart merge request on login."""

    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=True,
    )
