"""
Shared utility functions used across the project.
"""

import random
import string
from datetime import datetime

from django.utils.text import slugify


def generate_unique_slug(model_class, value, slug_field="slug"):
    """
    Generate a unique slug for a given model.

    Args:
        model_class: The Django model class to check uniqueness against.
        value: The string value to slugify.
        slug_field: The name of the slug field on the model (default: 'slug').

    Returns:
        A unique slug string.
    """
    base_slug = slugify(value)
    slug = base_slug
    counter = 1

    while model_class.objects.filter(**{slug_field: slug}).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


def format_currency(amount):
    """
    Format a numeric amount as Indian Rupees (INR).

    Args:
        amount: A numeric value (int, float, or Decimal).

    Returns:
        Formatted string, e.g., '₹1,299.00'
    """
    try:
        amount = float(amount)
        # Indian numbering system: last 3 digits, then groups of 2
        if amount < 0:
            sign = "-"
            amount = abs(amount)
        else:
            sign = ""

        integer_part = int(amount)
        decimal_part = f"{amount:.2f}".split(".")[1]

        # Format the integer part with Indian grouping
        s = str(integer_part)
        if len(s) <= 3:
            formatted_integer = s
        else:
            # Last 3 digits
            last_three = s[-3:]
            remaining = s[:-3]
            # Group remaining digits in pairs from right
            groups = []
            while remaining:
                groups.append(remaining[-2:])
                remaining = remaining[:-2]
            groups.reverse()
            formatted_integer = ",".join(groups) + "," + last_three

        return f"{sign}₹{formatted_integer}.{decimal_part}"
    except (ValueError, TypeError):
        return f"₹0.00"


def generate_order_number():
    """
    Generate a unique order number in the format: ORD-YYYYMMDD-XXXX

    Returns:
        Order number string, e.g., 'ORD-20260704-A7K2'
    """
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{date_part}-{random_part}"
