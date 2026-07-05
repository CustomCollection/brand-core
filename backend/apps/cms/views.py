"""
CMS views — public endpoints for dynamic site content.

These endpoints power the entire frontend without any hardcoded content.
"""

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product
from apps.products.serializers import ProductListSerializer

from .models import AnnouncementBar, HeroBanner, HomepageSection, SiteConfig
from .serializers import (
    AnnouncementBarSerializer,
    HeroBannerSerializer,
    HomepageSectionSerializer,
    SiteConfigSerializer,
)


class SiteConfigView(APIView):
    """
    Get site-wide configuration: brand info, social links, contact details.

    This endpoint is called once on initial page load and cached on the frontend.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        config = SiteConfig.get_config()
        serializer = SiteConfigSerializer(config)
        return Response(serializer.data)


class HomepageView(APIView):
    """
    Get all homepage data in a single API call.

    Returns banners, sections, announcements, and product lists
    (featured, best sellers, new arrivals) in one response to minimize
    frontend API calls for the homepage.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Banners
        banners = HeroBanner.objects.filter(is_active=True)
        banners_data = HeroBannerSerializer(banners, many=True).data

        # Sections
        sections = HomepageSection.objects.filter(is_active=True)
        sections_data = HomepageSectionSerializer(sections, many=True).data

        # Announcements
        announcements = AnnouncementBar.objects.filter(is_active=True)
        announcements_data = AnnouncementBarSerializer(announcements, many=True).data

        # Featured products
        featured = Product.objects.filter(
            status="published", is_featured=True
        ).prefetch_related("images", "collections", "tags", "reviews")[:8]
        featured_data = ProductListSerializer(featured, many=True).data

        # Best sellers
        best_sellers = Product.objects.filter(
            status="published", is_best_seller=True
        ).prefetch_related("images", "collections", "tags", "reviews")[:8]
        best_sellers_data = ProductListSerializer(best_sellers, many=True).data

        # New arrivals
        new_arrivals = Product.objects.filter(
            status="published", is_new_arrival=True
        ).prefetch_related("images", "collections", "tags", "reviews")[:8]
        new_arrivals_data = ProductListSerializer(new_arrivals, many=True).data

        return Response(
            {
                "banners": banners_data,
                "sections": sections_data,
                "announcements": announcements_data,
                "featured_products": featured_data,
                "best_sellers": best_sellers_data,
                "new_arrivals": new_arrivals_data,
            }
        )
