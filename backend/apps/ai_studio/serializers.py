"""
Serializers for AI Design Workspace.
"""

from rest_framework import serializers

from .models import AIConversation, AIMessage, GeneratedArtwork, TokenPackage, UserTokenAccount


class UserTokenAccountSerializer(serializers.ModelSerializer):
    available_tokens = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserTokenAccount
        fields = (
            "available_tokens",
            "daily_free_tokens",
            "purchased_tokens",
            "total_tokens_used",
            "last_reset_date",
        )


class TokenPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenPackage
        fields = ("id", "name", "tokens", "price", "badge_text", "sort_order")


class GeneratedArtworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedArtwork
        fields = (
            "id",
            "conversation",
            "image_url",
            "prompt_used",
            "provider",
            "model_name",
            "width",
            "height",
            "is_favorite",
            "created_at",
        )


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = (
            "id",
            "role",
            "content",
            "reference_image_url",
            "generated_image_url",
            "generation_metadata",
            "created_at",
        )


class AIConversationListSerializer(serializers.ModelSerializer):
    latest_message = serializers.SerializerMethodField()
    latest_image = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = (
            "id",
            "title",
            "total_generations",
            "latest_message",
            "latest_image",
            "created_at",
            "updated_at",
        )

    def get_latest_message(self, obj):
        last = obj.messages.last()
        return last.content[:80] if last else ""

    def get_latest_image(self, obj):
        last_art = obj.artworks.last()
        return last_art.image_url if last_art else ""


class AIConversationDetailSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)
    artworks = GeneratedArtworkSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = (
            "id",
            "title",
            "context_summary",
            "total_generations",
            "messages",
            "artworks",
            "created_at",
            "updated_at",
        )


class SendMessageSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=2000, required=True)
    reference_file = serializers.FileField(required=False, allow_null=True)
    reference_url = serializers.CharField(max_length=500, required=False, allow_blank=True)
