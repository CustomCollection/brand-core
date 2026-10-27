"""
Views and API endpoints for Fabric.js Design Editor.
"""

from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView

from apps.catalog.models import Category
from .models import DesignAsset, DesignSession
from .serializers import (
    DesignAssetSerializer,
    DesignSessionSerializer,
    SaveDesignSessionSerializer,
)
from .services import get_or_create_session, handle_artwork_upload, save_session_data


class CreateSessionView(APIView):
    """
    Initializes a new design session for a specified garment category.
    Accepts category_id or category_slug.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        category_id = request.data.get("category_id")
        category_slug = request.data.get("category_slug")

        try:
            if category_id:
                category = Category.objects.get(id=category_id, is_active=True)
            elif category_slug:
                category = Category.objects.get(slug=category_slug, is_active=True)
            else:
                # Default to first active category if none passed
                category = Category.objects.filter(is_active=True).first()
                if not category:
                    return Response(
                        {"error": "No active customizable categories found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        session_key = request.session.session_key or ""
        session = get_or_create_session(
            user=request.user,
            session_key=session_key,
            category_id=category.id,
        )

        serializer = DesignSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DesignSessionDetailView(RetrieveAPIView):
    """Retrieves an existing design session by UUID."""

    serializer_class = DesignSessionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        return DesignSession.objects.all().prefetch_related(
            "placements",
            "category__colors",
            "category__sizes",
            "category__printing_methods",
            "category__placement_configs",
        )


class SaveSessionView(APIView):
    """
    Saves placement canvas states, customer selections, metrics, and takes an immutable version snapshot.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, id):
        try:
            session = DesignSession.objects.get(id=id)
        except DesignSession.DoesNotExist:
            return Response({"error": "Design session not found."}, status=status.HTTP_404_NOT_FOUND)

        # Authorization: if session belongs to authenticated user, only owner can edit
        if session.user and request.user.is_authenticated and session.user != request.user:
            return Response({"error": "Unauthorized access to design session."}, status=status.HTTP_403_FORBIDDEN)

        serializer = SaveDesignSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_session = save_session_data(session, serializer.validated_data)
        out_serializer = DesignSessionSerializer(updated_session)
        return Response(
            {
                "message": "Design saved successfully.",
                "session": out_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ArtworkUploadView(APIView):
    """
    Uploads a design image file (PNG, JPG, SVG), computes dimensions, and returns asset metadata.
    """

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        file_obj = request.FILES.get("file") or request.FILES.get("image")
        if not file_obj:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic size guard: 25MB max
        if file_obj.size > 25 * 1024 * 1024:
            return Response({"error": "File size exceeds 25MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            asset = handle_artwork_upload(file_obj, user=request.user)
            serializer = DesignAssetSerializer(asset)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Failed to process image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
