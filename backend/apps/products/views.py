"""
Product views — catalog listing, detail, and option endpoints.

All views are read-only for the public storefront. Product management
happens exclusively through Django Admin.
"""

from django.db import models as db_models
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilter
from .models import Color, Product, Size
from .serializers import (
    ColorSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    SizeSerializer,
)


class ProductListView(generics.ListAPIView):
    """
    List published products with filtering, searching, and ordering.

    Query params:
    - collection, tag, color, size: Filter by slug/name
    - min_price, max_price: Price range
    - is_featured, is_best_seller, is_new_arrival: Boolean flags
    - search: Search by name, description, tag, collection
    - ordering: price, -price, created_at, -created_at, name
    """

    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "tags__name", "collections__name"]
    ordering_fields = ["price", "created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Product.objects.filter(status="published")
            .select_related()
            .prefetch_related("images", "collections", "tags", "reviews")
            .distinct()
        )


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve full product details by slug."""

    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Product.objects.filter(status="published").prefetch_related(
            "images", "collections", "tags", "sizes", "colors", "reviews"
        )


class SizeListView(generics.ListAPIView):
    """List all available sizes."""

    serializer_class = SizeSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Size.objects.all()
    pagination_class = None


class ColorListView(generics.ListAPIView):
    """List all available colors."""

    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Color.objects.all()
    pagination_class = None


class ProductSearchView(generics.ListAPIView):
    """
    Search products across name, collections, tags, and description.

    Endpoint: GET /api/v1/search/?q=<query>
    """

    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        if not query:
            return Product.objects.none()

        return (
            Product.objects.filter(status="published")
            .filter(
                db_models.Q(name__icontains=query)
                | db_models.Q(description__icontains=query)
                | db_models.Q(collections__name__icontains=query)
                | db_models.Q(tags__name__icontains=query)
            )
            .prefetch_related("images", "collections", "tags", "reviews")
            .distinct()
        )
