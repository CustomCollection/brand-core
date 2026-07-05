"""Tag views — read-only endpoint."""

from rest_framework import generics, permissions

from .models import Tag
from .serializers import TagSerializer


class TagListView(generics.ListAPIView):
    """List all active tags."""

    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Tag.objects.filter(is_active=True)
