"""
Views and API endpoints for Catalog & Provider Mapping.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Category, PrintingMethod
from .serializers import CategoryDetailSerializer, CategoryListSerializer, PrintingMethodSerializer


class CategoryListView(ListAPIView):
    """List all active customizable garment categories."""

    serializer_class = CategoryListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .prefetch_related("colors", "sizes", "printing_methods")
            .order_by("sort_order", "name")
        )


class CategoryDetailView(RetrieveAPIView):
    """Retrieve full category specifications, allowable colors, sizes, and 6 placement mockups."""

    serializer_class = CategoryDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.filter(is_active=True).prefetch_related(
            "colors", "sizes", "printing_methods", "placement_configs"
        )


class PrintingMethodListView(ListAPIView):
    """List active printing methods supported (DTG, DTF, etc.)."""

    serializer_class = PrintingMethodSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return PrintingMethod.objects.filter(is_active=True).order_by("sort_order", "name")
