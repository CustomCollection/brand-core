"""
Custom permission classes shared across apps.
"""

from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission that only allows owners of an object to access it.

    Expects the model instance to have a ``user`` attribute pointing to the owner.
    """

    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsEmailVerified(BasePermission):
    """
    Allows access only to users who have verified their email address.

    Expects the User model to have an ``is_email_verified`` boolean field.
    """

    message = "Please verify your email address to access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_email_verified", False)
        )
