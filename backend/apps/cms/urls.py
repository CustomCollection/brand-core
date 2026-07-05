"""CMS URL configuration."""

from django.urls import path

from . import views

app_name = "cms"

urlpatterns = [
    path("site-config/", views.SiteConfigView.as_view(), name="site-config"),
    path("homepage/", views.HomepageView.as_view(), name="homepage"),
]
