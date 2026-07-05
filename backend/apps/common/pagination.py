"""
Custom pagination classes for consistent paginated API responses.
"""

from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """
    Standard pagination for the CustomCollection API.

    Defaults to 12 items per page (fits a 3×4 or 4×3 product grid),
    with a maximum of 100.
    """

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        """Return paginated response in the consistent API format."""
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("total_pages", self.page.paginator.num_pages),
                    ("current_page", self.page.number),
                    ("results", data),
                ]
            )
        )

    def get_paginated_response_schema(self, schema):
        """Schema for drf-spectacular."""
        return {
            "type": "object",
            "properties": {
                "count": {"type": "integer", "example": 120},
                "next": {"type": "string", "nullable": True, "format": "uri"},
                "previous": {"type": "string", "nullable": True, "format": "uri"},
                "total_pages": {"type": "integer", "example": 10},
                "current_page": {"type": "integer", "example": 1},
                "results": schema,
            },
        }
