"""Collection views — read-only catalog endpoints."""

from rest_framework import generics, permissions

from .models import Collection
from .serializers import CollectionSerializer


class CollectionListView(generics.ListAPIView):
    """List all active collections."""

    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Collection.objects.filter(is_active=True)


class CollectionDetailView(generics.RetrieveAPIView):
    """Retrieve a single collection by slug."""

    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Collection.objects.filter(is_active=True)
