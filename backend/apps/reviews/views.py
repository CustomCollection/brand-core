"""Review views."""

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import ReviewCreateSerializer, ReviewSerializer
from .services import create_review, get_product_reviews


class ProductReviewListView(generics.ListAPIView):
    """List approved reviews for a product."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return get_product_reviews(self.kwargs["product_slug"])


class ProductReviewCreateView(generics.CreateAPIView):
    """Submit a review for a product (verified purchasers only)."""

    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = create_review(
            user=request.user,
            product_slug=self.kwargs["product_slug"],
            validated_data=serializer.validated_data,
        )

        return Response(
            {"message": "Review submitted. It will be visible after approval."},
            status=status.HTTP_201_CREATED,
        )
