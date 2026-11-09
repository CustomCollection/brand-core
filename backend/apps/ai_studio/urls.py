"""
URL routing for AI Design Workspace.
"""

from django.urls import path

from .views import (
    ArtworkDeleteView,
    ConversationDetailView,
    ConversationListCreateView,
    SendMessageView,
    TokenBalanceView,
    TokenPackagesView,
)

app_name = "ai_studio"

urlpatterns = [
    path("chats/", ConversationListCreateView.as_view(), name="chat-list-create"),
    path("chats/<uuid:id>/", ConversationDetailView.as_view(), name="chat-detail"),
    path("chats/<uuid:id>/send/", SendMessageView.as_view(), name="chat-send-message"),
    path("artworks/<uuid:id>/", ArtworkDeleteView.as_view(), name="artwork-delete"),
    path("tokens/balance/", TokenBalanceView.as_view(), name="token-balance"),
    path("tokens/packages/", TokenPackagesView.as_view(), name="token-packages"),
]
