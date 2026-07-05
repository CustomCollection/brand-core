from django.apps import AppConfig


class CartConfig(AppConfig):
    """Configuration for the cart app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.cart"
    verbose_name = "Cart"
