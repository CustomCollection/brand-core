"""Collection URL configuration."""

from django.urls import path

from . import views

app_name = "collections"

urlpatterns = [
    path("", views.CollectionListView.as_view(), name="collection-list"),
    path("<slug:slug>/", views.CollectionDetailView.as_view(), name="collection-detail"),
]
