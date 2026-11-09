"""
Views and API endpoints for AI Design Workspace.
"""

from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView, ListAPIView

from .models import AIConversation, GeneratedArtwork, TokenPackage
from .serializers import (
    AIConversationDetailSerializer,
    AIConversationListSerializer,
    AIMessageSerializer,
    GeneratedArtworkSerializer,
    SendMessageSerializer,
    TokenPackageSerializer,
    UserTokenAccountSerializer,
)
from .services import get_or_create_token_account, process_user_generation_request


def _get_user_or_session(request):
    """Helper to extract user and session key."""
    user = request.user if request.user.is_authenticated else None
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key or ""
    return user, session_key


class ConversationListCreateView(APIView):
    """
    List user's AI conversations or create a new design chat thread.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user, session_key = _get_user_or_session(request)
        if user:
            qs = AIConversation.objects.filter(user=user)
        else:
            qs = AIConversation.objects.filter(session_key=session_key)

        qs = qs.prefetch_related("messages", "artworks").order_by("-updated_at")
        serializer = AIConversationListSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user, session_key = _get_user_or_session(request)
        title = request.data.get("title", "New Design Chat")
        conversation = AIConversation.objects.create(
            user=user,
            session_key=session_key,
            title=title,
        )
        serializer = AIConversationDetailSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(RetrieveDestroyAPIView):
    """
    Retrieve conversation thread with full message history and generated artworks, or delete it.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = AIConversationDetailSerializer
    lookup_field = "id"

    def get_queryset(self):
        user, session_key = _get_user_or_session(self.request)
        if user:
            return AIConversation.objects.filter(user=user).prefetch_related("messages", "artworks")
        return AIConversation.objects.all().prefetch_related("messages", "artworks")


class SendMessageView(APIView):
    """
    Sends a message in the conversational design thread.
    Triggers Text LLM + Image diffusion model fallback chains, saves the generated artwork,
    and deducts 1 token.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request, id):
        user, session_key = _get_user_or_session(request)

        try:
            conversation = AIConversation.objects.get(id=id)
            if conversation.user and request.user.is_authenticated and conversation.user != request.user:
                return Response(
                    {"error": "Unauthorized access to design conversation."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except AIConversation.DoesNotExist:
            return Response(
                {"error": "Design conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        ref_file = request.FILES.get("reference_file") or request.FILES.get("file")
        ref_url = serializer.validated_data.get("reference_url", "")

        try:
            result = process_user_generation_request(
                conversation=conversation,
                user_prompt=prompt,
                reference_file=ref_file,
                reference_url=ref_url,
                user=user,
                session_key=session_key,
            )
            return Response(
                {
                    "user_message": AIMessageSerializer(result["user_message"]).data,
                    "assistant_message": AIMessageSerializer(result["assistant_message"]).data,
                    "artwork": GeneratedArtworkSerializer(result["artwork"]).data,
                    "tokens_remaining": result["tokens_remaining"],
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"AI generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ArtworkDeleteView(APIView):
    """Delete a specific generated artwork."""

    permission_classes = [permissions.AllowAny]

    def delete(self, request, id):
        user, session_key = _get_user_or_session(request)
        try:
            artwork = GeneratedArtwork.objects.get(id=id)
            if artwork.user and request.user.is_authenticated and artwork.user != request.user:
                return Response(
                    {"error": "Unauthorized access to artwork."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            artwork.delete()
            return Response({"message": "Artwork deleted successfully."}, status=status.HTTP_200_OK)
        except GeneratedArtwork.DoesNotExist:
            return Response({"error": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)


class TokenBalanceView(APIView):
    """Retrieve current token balance and daily free quota reset status."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user, session_key = _get_user_or_session(request)
        account = get_or_create_token_account(user=user, session_key=session_key)
        serializer = UserTokenAccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TokenPackagesView(ListAPIView):
    """List available token recharge packages."""

    permission_classes = [permissions.AllowAny]
    serializer_class = TokenPackageSerializer

    def get_queryset(self):
        return TokenPackage.objects.filter(is_active=True).order_by("sort_order", "price")
