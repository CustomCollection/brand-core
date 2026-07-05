"""
Custom user manager for email-based authentication.

Django's default UserManager expects a username field. Since CustomCollection
uses email as the primary identifier, we override create_user and create_superuser.
"""

from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    """
    Custom manager for User model where email is the unique identifier
    for authentication instead of username.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a regular user with the given email and password.

        Args:
            email: The user's email address (required).
            password: The user's password (optional, unusable password set if None).
            **extra_fields: Additional fields to set on the user model.

        Returns:
            The newly created User instance.

        Raises:
            ValueError: If email is not provided.
        """
        if not email:
            raise ValueError("Users must have an email address.")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.

        Superusers are automatically email-verified, active, and have
        staff + superuser privileges.

        Args:
            email: The superuser's email address (required).
            password: The superuser's password.
            **extra_fields: Additional fields to set on the user model.

        Returns:
            The newly created superuser User instance.

        Raises:
            ValueError: If is_staff or is_superuser is not True.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_email_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)
