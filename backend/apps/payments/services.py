"""
Payment service — Razorpay integration and COD handling.
"""

import logging

import razorpay
from django.conf import settings
from django.utils import timezone

from apps.common.exceptions import BadRequest
from apps.orders.models import Order

from .models import Payment

logger = logging.getLogger(__name__)


def get_razorpay_client():
    """Initialize and return the Razorpay client."""
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def create_payment(order, payment_method):
    """
    Create a payment record for an order.

    For Razorpay: Creates a Razorpay order and returns the order ID for frontend.
    For COD: Creates a pending payment record directly.

    Args:
        order: The Order instance.
        payment_method: 'razorpay' or 'cod'.

    Returns:
        Dict with payment info (includes razorpay_order_id for online payments).
    """
    if payment_method == "cod":
        payment = Payment.objects.create(
            order=order,
            method="cod",
            amount=order.total,
            status="pending",
        )
        # COD orders are auto-confirmed
        order.status = "confirmed"
        order.save(update_fields=["status"])

        logger.info("COD payment created for order %s", order.order_number)
        return {
            "payment_id": payment.id,
            "method": "cod",
            "status": "pending",
        }

    elif payment_method == "razorpay":
        client = get_razorpay_client()

        # Amount in paise (Razorpay expects smallest currency unit)
        amount_paise = int(order.total * 100)

        razorpay_order = client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": order.order_number,
                "notes": {
                    "order_number": order.order_number,
                    "user_email": order.user.email,
                },
            }
        )

        payment = Payment.objects.create(
            order=order,
            method="razorpay",
            amount=order.total,
            razorpay_order_id=razorpay_order["id"],
            status="pending",
        )

        logger.info(
            "Razorpay order %s created for order %s",
            razorpay_order["id"],
            order.order_number,
        )

        return {
            "payment_id": payment.id,
            "method": "razorpay",
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": amount_paise,
            "currency": "INR",
        }

    else:
        raise BadRequest("Invalid payment method.")


def verify_razorpay_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verify a Razorpay payment signature.

    Args:
        razorpay_order_id: Razorpay order ID.
        razorpay_payment_id: Razorpay payment ID.
        razorpay_signature: Razorpay signature for verification.

    Returns:
        The updated Payment instance.
    """
    try:
        payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
    except Payment.DoesNotExist:
        raise BadRequest("Payment not found.")

    client = get_razorpay_client()

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )
    except razorpay.errors.SignatureVerificationError:
        payment.status = "failed"
        payment.save(update_fields=["status"])
        raise BadRequest("Payment verification failed.")

    # Payment verified successfully
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = "paid"
    payment.paid_at = timezone.now()
    payment.save(update_fields=[
        "razorpay_payment_id", "razorpay_signature", "status", "paid_at"
    ])

    # Confirm the order
    order = payment.order
    order.status = "confirmed"
    order.save(update_fields=["status"])

    logger.info("Payment verified for order %s", order.order_number)
    return payment
