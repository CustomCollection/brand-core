from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class Payment(TimeStampedModel):
    """
    Payment record linked to an order.

    Supports two methods:
    - Razorpay: Online payment with order_id, payment_id, signature verification
    - COD: Cash on Delivery (payment collected on delivery)
    """

    class Method(models.TextChoices):
        RAZORPAY = "razorpay", "Razorpay"
        COD = "cod", "Cash on Delivery"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )
    method = models.CharField(max_length=10, choices=Method.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # Razorpay fields (null for COD)
    razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_signature = models.CharField(max_length=200, blank=True, default="")

    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "payment"
        verbose_name_plural = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment for {self.order.order_number} — {self.get_status_display()}"


class Refund(TimeStampedModel):
    """
    Refund request record for cancelled orders.

    Admin reviews and transfers the refund amount to the customer's UPI ID,
    then updates the status to Processed with the transaction reference/UTR.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSED = "processed", "Processed"
        REJECTED = "rejected", "Rejected"

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="refund",
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="refunds",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="refunds",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    upi_id = models.CharField(max_length=100, help_text="Customer UPI ID for refund.")
    reason = models.TextField(blank=True, default="", help_text="Reason for cancellation / refund.")
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    admin_notes = models.TextField(
        blank=True,
        default="",
        help_text="Transaction reference / UTR / Admin notes.",
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "refund"
        verbose_name_plural = "refunds"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Refund for {self.order.order_number} — ₹{self.amount} ({self.get_status_display()})"

