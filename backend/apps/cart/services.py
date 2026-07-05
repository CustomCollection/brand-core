"""
Cart service layer — handles cart operations and guest cart merge.
"""

import logging

from apps.common.exceptions import BadRequest, NotFound
from apps.products.models import Color, Product, Size

from .models import Cart, CartItem

logger = logging.getLogger(__name__)


def get_or_create_cart(user):
    """Get or create a cart for the authenticated user."""
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def add_to_cart(user, product_id, size_id, color_id, quantity=1):
    """
    Add a product to the user's cart or increment quantity if it already exists.

    Args:
        user: Authenticated user.
        product_id: ID of the product to add.
        size_id: ID of the selected size.
        color_id: ID of the selected color.
        quantity: Number of items to add.

    Returns:
        The CartItem instance.
    """
    # Validate product exists and is published
    try:
        product = Product.objects.get(pk=product_id, status="published")
    except Product.DoesNotExist:
        raise NotFound("Product not found.")

    try:
        size = Size.objects.get(pk=size_id)
    except Size.DoesNotExist:
        raise BadRequest("Invalid size selection.")

    try:
        color = Color.objects.get(pk=color_id)
    except Color.DoesNotExist:
        raise BadRequest("Invalid color selection.")

    # Validate the product offers this size and color
    if not product.sizes.filter(pk=size_id).exists():
        raise BadRequest("This size is not available for this product.")
    if not product.colors.filter(pk=color_id).exists():
        raise BadRequest("This color is not available for this product.")

    cart = get_or_create_cart(user)

    # Check if the same product+size+color already exists in cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        size=size,
        color=color,
        defaults={"quantity": quantity},
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save(update_fields=["quantity"])

    logger.info("Added to cart: %s for user %s", product.name, user.email)
    return cart_item


def update_cart_item(user, item_id, quantity):
    """Update the quantity of a cart item."""
    try:
        cart_item = CartItem.objects.get(pk=item_id, cart__user=user)
    except CartItem.DoesNotExist:
        raise NotFound("Cart item not found.")

    cart_item.quantity = quantity
    cart_item.save(update_fields=["quantity"])
    return cart_item


def remove_from_cart(user, item_id):
    """Remove an item from the user's cart."""
    try:
        cart_item = CartItem.objects.get(pk=item_id, cart__user=user)
    except CartItem.DoesNotExist:
        raise NotFound("Cart item not found.")

    cart_item.delete()
    logger.info("Removed cart item %s for user %s", item_id, user.email)


def clear_cart(user):
    """Remove all items from the user's cart."""
    cart = get_or_create_cart(user)
    cart.items.all().delete()
    logger.info("Cart cleared for user %s", user.email)


def merge_guest_cart(user, guest_items):
    """
    Merge guest cart items (from localStorage) into the authenticated user's cart.

    Each guest item should have: product_id, size_id, color_id, quantity.
    If the item already exists in the cart, the quantities are combined.

    Args:
        user: Authenticated user.
        guest_items: List of dicts from localStorage.
    """
    if not guest_items:
        return

    for item in guest_items:
        try:
            add_to_cart(
                user=user,
                product_id=item.get("product_id"),
                size_id=item.get("size_id"),
                color_id=item.get("color_id"),
                quantity=item.get("quantity", 1),
            )
        except (BadRequest, NotFound):
            # Skip invalid items during merge — don't fail the entire operation
            logger.warning("Skipped invalid guest cart item during merge: %s", item)
            continue

    logger.info("Guest cart merged for user %s (%d items)", user.email, len(guest_items))
