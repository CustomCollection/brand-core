"""CMS serializers."""

from rest_framework import serializers

from .models import AnnouncementBar, ContactMessage, HeroBanner, HomepageSection, SiteConfig


class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = [
            "brand_name",
            "brand_tagline",
            "brand_description",
            "logo_url",
            "favicon_url",
            "contact_email",
            "contact_phone",
            "address",
            "instagram_url",
            "twitter_url",
            "facebook_url",
            "youtube_url",
            "footer_text",
            "meta_title",
            "meta_description",
        ]


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = [
            "id",
            "title",
            "subtitle",
            "image_url",
            "link_url",
            "link_text",
            "show_content",
            "sort_order",
        ]


class HomepageSectionSerializer(serializers.ModelSerializer):
    collection_name = serializers.CharField(source="collection.name", read_only=True)
    collection_slug = serializers.CharField(source="collection.slug", read_only=True)
    products = serializers.SerializerMethodField()

    class Meta:
        model = HomepageSection
        fields = [
            "id",
            "title",
            "subtitle",
            "collection_id",
            "collection_name",
            "collection_slug",
            "sort_order",
            "products",
        ]

    def get_products(self, obj):
        from apps.products.serializers import ProductListSerializer
        products = obj.collection.products.filter(status="published").prefetch_related(
            "images", "collections", "tags", "reviews"
        )[:4]
        return ProductListSerializer(products, many=True).data


class AnnouncementBarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementBar
        fields = ["id", "text", "link_url", "sort_order"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]
