"""Wishlist views — add, remove, and list saved products."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import BadRequest, NotFound
from apps.products.models import Product

from .models import WishlistItem
from .serializers import WishlistAddSerializer, WishlistItemSerializer


class WishlistView(APIView):
    """List all wishlist items or add a product."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related(
            "product"
        ).prefetch_related(
            "product__images", "product__collections", "product__tags", "product__reviews"
        )
        serializer = WishlistItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WishlistAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            product = Product.objects.get(
                pk=serializer.validated_data["product_id"],
                status="published",
            )
        except Product.DoesNotExist:
            raise NotFound("Product not found.")

        _, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
        )

        if not created:
            raise BadRequest("Product is already in your wishlist.")

        return Response(
            {"message": "Added to wishlist."},
            status=status.HTTP_201_CREATED,
        )


class WishlistItemView(APIView):
    """Remove a product from the wishlist."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = WishlistItem.objects.get(pk=pk, user=request.user)
        except WishlistItem.DoesNotExist:
            raise NotFound("Wishlist item not found.")

        item.delete()
        return Response({"message": "Removed from wishlist."})
