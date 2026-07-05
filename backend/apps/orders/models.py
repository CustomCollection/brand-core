"""
Order models — Order, OrderItem, Shipment, and ShippingConfig.

Orders store product snapshots (name, price, image) so order history
is preserved even when products are later modified or deleted.

ShippingConfig is a singleton model managed via Django Admin for
configurable shipping charges without code changes.
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel
from apps.common.utils import generate_order_number


class ShippingConfig(models.Model):
    """
    Singleton model for shipping charge configuration.

    Admin can set flat shipping charge and free shipping threshold
    without modifying code. Only one instance should exist.
    """

    flat_shipping_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=99.00,
        help_text="Flat shipping charge in INR.",
    )
    free_shipping_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=999.00,
        help_text="Orders above this amount get free shipping (in INR).",
    )

    class Meta:
        verbose_name = "shipping configuration"
        verbose_name_plural = "shipping configuration"

    def __str__(self):
        return f"Shipping: ₹{self.flat_shipping_charge} (Free above ₹{self.free_shipping_threshold})"

    def save(self, *args, **kwargs):
        """Enforce singleton — only one config row allowed."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """Get or create the singleton shipping config."""
        config, _ = cls.objects.get_or_create(pk=1)
        return config


class Order(TimeStampedModel):
    """
    Customer order with product snapshots.

    Follows the Print-on-Demand workflow:
    Pending → Confirmed → Printing → Packed → Shipped → Delivered
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PRINTING = "printing", "Printing"
        PACKED = "packed", "Packed"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        RETURNED = "returned", "Returned"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    order_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        editable=False,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    # Shipping address snapshot (preserved even if user deletes the address later)
    shipping_address = models.JSONField(
        help_text="Snapshot of the shipping address at time of order.",
    )

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Admin notes
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Internal notes (not visible to customer).",
    )

    class Meta:
        verbose_name = "order"
        verbose_name_plural = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Snapshot of a purchased product within an order.

    All product details are stored as plain values (not FK references)
    so the order history remains unchanged even if the product is
    modified or deleted later.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    # Product snapshot
    product_name = models.CharField(max_length=200)
    product_slug = models.CharField(max_length=220)
    product_image_url = models.URLField(max_length=500, blank=True, default="")

    # Pricing snapshot
    price = models.DecimalField(max_digits=10, decimal_places=2)

    # Customer selections snapshot
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=50)

    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "order item"
        verbose_name_plural = "order items"

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    @property
    def line_total(self):
        return self.price * self.quantity


class Shipment(TimeStampedModel):
    """
    Shipment details for an order.

    Admin manually enters courier name and tracking number after shipping.
    """

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="shipment",
    )
    courier = models.CharField(
        max_length=100,
        help_text="Courier service name (e.g., Delhivery, BlueDart).",
    )
    tracking_number = models.CharField(
        max_length=100,
        help_text="Courier tracking number.",
    )
    shipped_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the order was handed to the courier.",
    )
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the order was delivered.",
    )

    class Meta:
        verbose_name = "shipment"
        verbose_name_plural = "shipments"

    def __str__(self):
        return f"Shipment for {self.order.order_number}"
