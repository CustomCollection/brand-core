"""CMS serializers."""

from rest_framework import serializers

from .models import AnnouncementBar, HeroBanner, HomepageSection, SiteConfig


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
        fields = ["id", "title", "subtitle", "image_url", "link_url", "link_text"]


class HomepageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSection
        fields = [
            "id",
            "section_type",
            "title",
            "subtitle",
            "content",
            "image_url",
            "is_active",
            "sort_order",
        ]


class AnnouncementBarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementBar
        fields = ["id", "text", "link_url"]
