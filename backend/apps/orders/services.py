"""
Order service layer — checkout, order creation, and shipping calculations.

This is the core business logic for the Print-on-Demand workflow.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from apps.accounts.models import Address
from apps.cart.services import get_or_create_cart
from apps.common.exceptions import BadRequest

from .models import Order, OrderItem, ShippingConfig

logger = logging.getLogger(__name__)


def calculate_shipping(subtotal):
    """
    Calculate shipping cost based on admin-configured rules.

    Returns 0 if subtotal exceeds the free shipping threshold.
    """
    config = ShippingConfig.get_config()
    if subtotal >= config.free_shipping_threshold:
        return 0
    return config.flat_shipping_charge


def create_order(user, address_id, payment_method):
    """
    Create an order from the user's cart.

    Steps:
    1. Validate the cart has items
    2. Validate the address belongs to the user
    3. Create the Order with address snapshot
    4. Create OrderItems with product snapshots
    5. Calculate shipping
    6. Clear the cart
    7. Send order confirmation email

    Args:
        user: Authenticated user.
        address_id: ID of the shipping address.
        payment_method: 'razorpay' or 'cod'.

    Returns:
        The created Order instance.
    """
    # Get cart and validate it has items
    cart = get_or_create_cart(user)
    cart_items = cart.items.select_related("product", "size", "color").all()

    if not cart_items.exists():
        raise BadRequest("Your cart is empty.")

    # Validate address
    try:
        address = Address.objects.get(pk=address_id, user=user)
    except Address.DoesNotExist:
        raise BadRequest("Invalid shipping address.")

    # Calculate totals
    subtotal = sum(item.line_total for item in cart_items)
    shipping_cost = calculate_shipping(subtotal)
    total = subtotal + shipping_cost

    # Create address snapshot
    address_snapshot = {
        "full_name": address.full_name,
        "phone": address.phone,
        "address_line_1": address.address_line_1,
        "address_line_2": address.address_line_2,
        "city": address.city,
        "state": address.state,
        "pincode": address.pincode,
    }

    # Create order
    order = Order.objects.create(
        user=user,
        shipping_address=address_snapshot,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
    )

    # Create order items with product snapshots
    order_items = []
    for cart_item in cart_items:
        order_items.append(
            OrderItem(
                order=order,
                product_name=cart_item.product.name,
                product_slug=cart_item.product.slug,
                product_image_url=cart_item.product.primary_image or "",
                price=cart_item.product.effective_price,
                size=cart_item.size.name,
                color=cart_item.color.name,
                quantity=cart_item.quantity,
            )
        )
    OrderItem.objects.bulk_create(order_items)

    # Clear the cart
    cart.items.all().delete()

    # Send order confirmation email
    send_order_confirmation_email(order)

    logger.info("Order %s created for user %s", order.order_number, user.email)
    return order


def get_user_orders(user):
    """Get all orders for a user, ordered by most recent."""
    return Order.objects.filter(user=user).prefetch_related("items")


def get_order_detail(user, order_number):
    """Get a specific order by order number for the authenticated user."""
    try:
        return (
            Order.objects.filter(user=user)
            .prefetch_related("items")
            .select_related("shipment")
            .get(order_number=order_number)
        )
    except Order.DoesNotExist:
        raise BadRequest("Order not found.")


def send_order_confirmation_email(order):
    """Send order confirmation email to the customer."""
    try:
        html_message = render_to_string(
            "emails/order_confirmation_email.html",
            {
                "order": order,
                "items": order.items.all(),
                "tracking_link": f"{settings.FRONTEND_URL}/orders/{order.order_number}",
            },
        )
        send_mail(
            subject=f"Order Confirmed — {order.order_number}",
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send order confirmation email: %s", e)


def send_shipping_update_email(order):
    """Send shipping update email when order is shipped."""
    try:
        shipment = order.shipment
        html_message = render_to_string(
            "emails/shipping_update_email.html",
            {
                "order": order,
                "shipment": shipment,
                "tracking_link": f"{settings.FRONTEND_URL}/orders/{order.order_number}",
            },
        )
        send_mail(
            subject=f"Your Order {order.order_number} Has Been Shipped!",
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send shipping update email: %s", e)


def send_delivery_email(order):
    """Send delivery confirmation email."""
    try:
        html_message = render_to_string(
            "emails/order_delivered_email.html",
            {
                "order": order,
                "review_link": f"{settings.FRONTEND_URL}/orders/{order.order_number}",
            },
        )
        send_mail(
            subject=f"Your Order {order.order_number} Has Been Delivered!",
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send delivery email: %s", e)
