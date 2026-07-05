"""Order views."""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CheckoutSerializer, OrderDetailSerializer, OrderListSerializer
from .services import create_order, get_order_detail, get_user_orders


class CheckoutView(APIView):
    """Create an order from the user's cart."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = create_order(
            user=request.user,
            address_id=serializer.validated_data["address_id"],
            payment_method=serializer.validated_data["payment_method"],
        )

        order_data = OrderDetailSerializer(order).data
        return Response(
            {"message": "Order placed successfully.", "order": order_data},
            status=status.HTTP_201_CREATED,
        )


class OrderListView(generics.ListAPIView):
    """List the authenticated user's orders."""

    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_user_orders(self.request.user)


class OrderDetailView(APIView):
    """Retrieve a specific order by order number."""

    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = get_order_detail(request.user, order_number)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)
