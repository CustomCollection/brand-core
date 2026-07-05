"""
Account serializers for registration, authentication, profile, and address management.

Each serializer handles validation and data transformation only.
Business logic is delegated to services.py.
"""

import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Address, Profile

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    """Validates registration data: email, password, and name fields."""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs


class LoginSerializer(serializers.Serializer):
    """Validates login credentials."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EmailVerificationSerializer(serializers.Serializer):
    """Validates email verification token data."""

    uid = serializers.CharField()
    token = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    """Validates forgot password request."""

    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Validates password reset with token."""

    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Validates password change for authenticated users."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        validate_password(attrs["new_password"])
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for User data."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_email_verified",
            "date_joined",
        ]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile with nested User data."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "phone", "avatar_url"]


class ProfileUpdateSerializer(serializers.Serializer):
    """Validates profile update data spanning User and Profile models."""

    first_name = serializers.CharField(max_length=50, required=False)
    last_name = serializers.CharField(max_length=50, required=False)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    avatar_url = serializers.URLField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if value and not re.match(r"^\+?[\d\s-]{7,15}$", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address with full CRUD support."""

    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "pincode",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_pincode(self, value):
        if not re.match(r"^\d{6}$", value):
            raise serializers.ValidationError("Pincode must be exactly 6 digits.")
        return value

    def validate_phone(self, value):
        if not re.match(r"^\+?[\d\s-]{7,15}$", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
