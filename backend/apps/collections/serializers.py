"""Collection serializers."""

from rest_framework import serializers

from .models import Collection


class CollectionSerializer(serializers.ModelSerializer):
    """Full collection serializer with product count."""

    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Collection
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "product_count",
            "meta_title",
            "meta_description",
        ]


class CollectionMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for embedding in product responses."""

    class Meta:
        model = Collection
        fields = ["id", "name", "slug"]
