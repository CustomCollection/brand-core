"""
URL routing for Catalog & Provider Mapping.
"""

from django.urls import path

from .views import CategoryDetailView, CategoryListView, PrintingMethodListView

app_name = "catalog"

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"),
    path("printing-methods/", PrintingMethodListView.as_view(), name="printing-method-list"),
]
