"""Payment views."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order

from .serializers import CreatePaymentSerializer, VerifyPaymentSerializer
from .services import create_payment, verify_razorpay_payment


class CreatePaymentView(APIView):
    """Create a payment for an order (Razorpay or COD)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(
                order_number=serializer.validated_data["order_number"],
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"message": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            payment_data = create_payment(
                order=order,
                payment_method=serializer.validated_data["payment_method"],
            )
        except Exception as exc:
            import logging
            logging.getLogger(__name__).error(
                "Payment creation failed for order %s: %s",
                order.order_number,
                exc,
            )
            return Response(
                {"message": f"Payment gateway error: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(payment_data, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """Verify a Razorpay payment after completion."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        verify_razorpay_payment(
            razorpay_order_id=serializer.validated_data["razorpay_order_id"],
            razorpay_payment_id=serializer.validated_data["razorpay_payment_id"],
            razorpay_signature=serializer.validated_data["razorpay_signature"],
        )

        return Response({"message": "Payment verified successfully."})
