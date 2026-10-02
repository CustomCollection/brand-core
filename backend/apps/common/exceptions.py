"""
Custom exception classes and exception handler for consistent API error responses.
"""

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class BadRequest(APIException):
    """Exception for 400 Bad Request errors."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad request."
    default_code = "bad_request"


class NotFound(APIException):
    """Exception for 404 Not Found errors."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Resource not found."
    default_code = "not_found"


class ConflictError(APIException):
    """Exception for 409 Conflict errors."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "A conflict occurred with the current state of the resource."
    default_code = "conflict"


class ServiceUnavailable(APIException):
    """Exception for 503 Service Unavailable errors."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporarily unavailable. Please try again later."
    default_code = "service_unavailable"


def _extract_first_error(data):
    """
    Recursively extract the first user-friendly error message from DRF error structures.
    """
    if isinstance(data, str):
        return data
    if isinstance(data, list) and data:
        return _extract_first_error(data[0])
    if isinstance(data, dict):
        if "non_field_errors" in data and data["non_field_errors"]:
            return _extract_first_error(data["non_field_errors"])
        if "detail" in data and data["detail"]:
            return _extract_first_error(data["detail"])
        for _field, err in data.items():
            msg = _extract_first_error(err)
            if msg:
                return msg
    return None


def custom_exception_handler(exc, context):
    """
    Custom exception handler that wraps DRF's default handler output
    into a consistent API response format with clear, specific error messages.

    Response format:
        {
            "status": "error",
            "message": "<human-readable error summary>",
            "errors": { ... }  // field-level errors if applicable
        }
    """
    response = exception_handler(exc, context)

    if response is None:
        return response

    error_payload = {
        "status": "error",
        "message": "An error occurred.",
        "errors": {},
    }

    if isinstance(response.data, dict):
        # Extract 'detail' key if present (standard DRF error)
        if "detail" in response.data:
            error_payload["message"] = str(response.data["detail"])
        else:
            # Field-level validation errors
            error_payload["errors"] = response.data
            extracted = _extract_first_error(response.data)
            error_payload["message"] = str(extracted) if extracted else "Validation error."
    elif isinstance(response.data, list):
        extracted = _extract_first_error(response.data)
        error_payload["message"] = str(extracted) if extracted else (str(response.data[0]) if response.data else "An error occurred.")
    else:
        error_payload["message"] = str(response.data)

    response.data = error_payload
    return response
