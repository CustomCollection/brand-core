"""
Cart models for authenticated users.

Guest carts are handled entirely on the frontend via localStorage.
When a guest logs in, the frontend merges the localStorage cart
into the authenticated cart via the API.
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel
from apps.products.models import Color, Product, Size


class Cart(TimeStampedModel):
    """
    Shopping cart for authenticated users.

    Each authenticated user has at most one active cart.
    Guest carts are stored in localStorage on the frontend.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    class Meta:
        verbose_name = "cart"
        verbose_name_plural = "carts"

    def __str__(self):
        return f"Cart for {self.user.email}"

    @property
    def total_items(self):
        """Total number of items (sum of quantities)."""
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        """Sum of (effective_price * quantity) for all items."""
        return sum(item.line_total for item in self.items.all())


class CartItem(TimeStampedModel):
    """
    Individual item in a cart.

    A unique cart item is identified by the combination of
    cart + product + size + color.
    """

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    size = models.ForeignKey(
        Size,
        on_delete=models.CASCADE,
    )
    color = models.ForeignKey(
        Color,
        on_delete=models.CASCADE,
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "cart item"
        verbose_name_plural = "cart items"
        unique_together = ("cart", "product", "size", "color")

    def __str__(self):
        return f"{self.product.name} ({self.size.name}/{self.color.name}) x{self.quantity}"

    @property
    def line_total(self):
        """Price for this line item."""
        return self.product.effective_price * self.quantity
