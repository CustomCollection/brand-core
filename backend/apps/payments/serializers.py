"""Payment serializers."""

from rest_framework import serializers


class CreatePaymentSerializer(serializers.Serializer):
    """Validates payment creation request."""

    order_number = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=["razorpay", "cod"])


class VerifyPaymentSerializer(serializers.Serializer):
    """Validates Razorpay payment verification."""

    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
