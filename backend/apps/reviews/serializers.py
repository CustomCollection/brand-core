"""Review serializers."""

from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Public review serializer for the storefront."""

    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "user_name", "rating", "title", "text", "created_at"]
        read_only_fields = ["id", "user_name", "created_at"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for submitting a new review."""

    class Meta:
        model = Review
        fields = ["rating", "title", "text"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
