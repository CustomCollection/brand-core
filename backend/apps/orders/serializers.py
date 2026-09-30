"""Order serializers."""

from rest_framework import serializers

from .models import Order, OrderItem, Shipment


class OrderItemSerializer(serializers.ModelSerializer):
    """Snapshot order item — read-only."""

    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_slug",
            "product_image_url",
            "price",
            "size",
            "color",
            "quantity",
            "line_total",
        ]


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = ["courier", "tracking_number", "shipped_at", "delivered_at"]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order listing."""

    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "total",
            "item_count",
            "created_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full order detail with items, shipment, payment, and refund status."""

    items = OrderItemSerializer(many=True, read_only=True)
    shipment = ShipmentSerializer(read_only=True)
    payment = serializers.SerializerMethodField()
    refund = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "shipping_address",
            "subtotal",
            "shipping_cost",
            "total",
            "items",
            "shipment",
            "payment",
            "refund",
            "notes",
            "created_at",
            "updated_at",
        ]

    def get_payment(self, obj):
        try:
            p = getattr(obj, "payment", None)
            if not p:
                return None
            return {
                "method": p.method,
                "status": p.status,
                "amount": str(p.amount),
                "is_paid": p.status == "paid",
            }
        except Exception:
            return None

    def get_refund(self, obj):
        try:
            r = getattr(obj, "refund", None)
            if not r:
                return None
            return {
                "id": r.id,
                "amount": str(r.amount),
                "upi_id": r.upi_id,
                "status": r.status,
                "status_display": r.get_status_display(),
                "admin_notes": r.admin_notes,
                "processed_at": r.processed_at,
                "created_at": r.created_at,
            }
        except Exception:
            return None


class CheckoutSerializer(serializers.Serializer):
    """Validates checkout request."""

    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=["razorpay", "cod"])
