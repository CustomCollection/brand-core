"""
Custom middleware for the CustomCollection project.
"""

import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware that logs every incoming HTTP request with:
    - Request method
    - Request path
    - Response status code
    - Request duration in milliseconds
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.monotonic()

        response = self.get_response(request)

        duration_ms = (time.monotonic() - start_time) * 1000

        logger.info(
            "%s %s %s %.2fms",
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
        )

        return response
