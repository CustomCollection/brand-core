from django.apps import AppConfig


class CmsConfig(AppConfig):
    """Configuration for the CMS (Content Management System) app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.cms"
    verbose_name = "CMS"
