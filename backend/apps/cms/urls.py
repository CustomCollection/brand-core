"""CMS URL configuration."""

from django.urls import path

from . import views

app_name = "cms"

urlpatterns = [
    path("site-config/", views.SiteConfigView.as_view(), name="site-config"),
    path("homepage/", views.HomepageView.as_view(), name="homepage"),
    path("contact/", views.ContactMessageCreateView.as_view(), name="contact"),
    path("subscribe/", views.SubscribeView.as_view(), name="subscribe"),
]
