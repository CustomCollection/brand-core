"""
URL routing for Fabric.js Design Editor.
"""

from django.urls import path

from .views import ArtworkUploadView, CreateSessionView, DesignSessionDetailView, SaveSessionView

app_name = "designer"

urlpatterns = [
    path("sessions/", CreateSessionView.as_view(), name="session-create"),
    path("sessions/<uuid:id>/", DesignSessionDetailView.as_view(), name="session-detail"),
    path("sessions/<uuid:id>/save/", SaveSessionView.as_view(), name="session-save"),
    path("assets/upload/", ArtworkUploadView.as_view(), name="asset-upload"),
]
