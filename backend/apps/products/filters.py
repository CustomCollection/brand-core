"""
Product filters using django-filter.

Supports filtering by collection, tag, price range, color, size,
and product flags (featured, best seller, new arrival).
All filters are dynamic — frontend reads available options from the API.
"""

from django_filters import rest_framework as filters

from .models import Product


class ProductFilter(filters.FilterSet):
    """
    Dynamic product filter for the catalog.

    Supports:
    - collection: Filter by collection slug (e.g., ?collection=oversized)
    - tag: Filter by tag slug (e.g., ?tag=anime)
    - min_price / max_price: Price range filter
    - color: Filter by color name
    - size: Filter by size name
    - is_featured / is_best_seller / is_new_arrival: Boolean flags
    """

    collection = filters.CharFilter(
        field_name="collections__slug",
        lookup_expr="exact",
        label="Collection slug",
    )
    tag = filters.CharFilter(
        field_name="tags__slug",
        lookup_expr="exact",
        label="Tag slug",
    )
    min_price = filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
        label="Minimum price",
    )
    max_price = filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
        label="Maximum price",
    )
    color = filters.CharFilter(
        field_name="colors__name",
        lookup_expr="iexact",
        label="Color name",
    )
    size = filters.CharFilter(
        field_name="sizes__name",
        lookup_expr="iexact",
        label="Size name",
    )
    is_featured = filters.BooleanFilter(field_name="is_featured")
    is_best_seller = filters.BooleanFilter(field_name="is_best_seller")
    is_new_arrival = filters.BooleanFilter(field_name="is_new_arrival")

    class Meta:
        model = Product
        fields = [
            "collection",
            "tag",
            "min_price",
            "max_price",
            "color",
            "size",
            "is_featured",
            "is_best_seller",
            "is_new_arrival",
        ]
