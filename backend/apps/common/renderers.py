"""
Custom renderer that wraps all API responses in a consistent envelope format.
"""

from rest_framework.renderers import JSONRenderer


class ApiRenderer(JSONRenderer):
    """
    Custom JSON renderer that wraps every response in a consistent format:

    Success:
        {
            "status": "success",
            "data": <response_data>,
            "message": null
        }

    Error:
        {
            "status": "error",
            "message": "<error_message>",
            "errors": { ... }
        }

    Note: Error responses are already formatted by custom_exception_handler,
    so we only need to wrap non-error responses here.
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        if response is not None and response.status_code >= 400:
            # Error responses are already formatted by the exception handler.
            # If they somehow aren't, wrap them.
            if not isinstance(data, dict) or "status" not in data:
                data = {
                    "status": "error",
                    "message": data.get("detail", "An error occurred.")
                    if isinstance(data, dict)
                    else str(data),
                    "errors": data if isinstance(data, dict) else {},
                }
        else:
            # Success responses — wrap in the standard envelope
            data = {
                "status": "success",
                "data": data,
                "message": None,
            }

        return super().render(data, accepted_media_type, renderer_context)
