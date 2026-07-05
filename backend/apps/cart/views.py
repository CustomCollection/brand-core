"""Cart views — CRUD operations for authenticated user carts."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    MergeCartSerializer,
    UpdateCartItemSerializer,
)
from .services import (
    add_to_cart,
    clear_cart,
    get_or_create_cart,
    merge_guest_cart,
    remove_from_cart,
    update_cart_item,
)


class CartView(APIView):
    """Get the current user's cart or clear it."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        clear_cart(request.user)
        return Response({"message": "Cart cleared."}, status=status.HTTP_200_OK)


class CartAddView(APIView):
    """Add an item to the cart."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        add_to_cart(
            user=request.user,
            product_id=serializer.validated_data["product_id"],
            size_id=serializer.validated_data["size_id"],
            color_id=serializer.validated_data["color_id"],
            quantity=serializer.validated_data["quantity"],
        )

        # Return updated cart
        cart = get_or_create_cart(request.user)
        cart_data = CartSerializer(cart).data
        return Response(
            {"message": "Item added to cart.", **cart_data},
            status=status.HTTP_201_CREATED,
        )


class CartItemView(APIView):
    """Update or remove a specific cart item."""

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        update_cart_item(
            user=request.user,
            item_id=pk,
            quantity=serializer.validated_data["quantity"],
        )

        cart = get_or_create_cart(request.user)
        cart_data = CartSerializer(cart).data
        return Response({"message": "Cart updated.", **cart_data})

    def delete(self, request, pk):
        remove_from_cart(user=request.user, item_id=pk)

        cart = get_or_create_cart(request.user)
        cart_data = CartSerializer(cart).data
        return Response({"message": "Item removed.", **cart_data})


class CartMergeView(APIView):
    """Merge guest cart (localStorage) into authenticated cart on login."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MergeCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        merge_guest_cart(request.user, serializer.validated_data["items"])

        cart = get_or_create_cart(request.user)
        cart_data = CartSerializer(cart).data
        return Response({"message": "Cart merged successfully.", **cart_data})
