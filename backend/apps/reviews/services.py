"""
Review service — handles review creation with verified purchase check.
"""

import logging

from apps.common.exceptions import BadRequest, ConflictError
from apps.orders.models import Order
from apps.products.models import Product

from .models import Review

logger = logging.getLogger(__name__)


def create_review(user, product_slug, validated_data):
    """
    Create a review for a product.

    Only verified purchasers (users who have a delivered order containing
    this product) can submit reviews. Each user can review a product only once.

    Args:
        user: Authenticated user.
        product_slug: Slug of the product being reviewed.
        validated_data: Dict with rating, title, text.

    Returns:
        The created Review instance.
    """
    try:
        product = Product.objects.get(slug=product_slug, status="published")
    except Product.DoesNotExist:
        raise BadRequest("Product not found.")

    # Check if user already reviewed this product
    if Review.objects.filter(product=product, user=user).exists():
        raise ConflictError("You have already reviewed this product.")

    # Check if user has purchased and received this product
    has_purchased = Order.objects.filter(
        user=user,
        status="delivered",
        items__product_name=product.name,
    ).exists()

    if not has_purchased:
        raise BadRequest("You can only review products you have purchased and received.")

    review = Review.objects.create(
        product=product,
        user=user,
        **validated_data,
    )

    logger.info("Review created by %s for %s", user.email, product.name)
    return review


def get_product_reviews(product_slug):
    """Get all approved reviews for a product."""
    return Review.objects.filter(
        product__slug=product_slug,
        product__status="published",
        is_approved=True,
    ).select_related("user")
