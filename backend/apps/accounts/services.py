"""
Account service layer — all authentication and account business logic.

Views delegate to these functions. This keeps views thin and business
logic testable, reusable, and independent of the HTTP layer.
"""

import logging

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.exceptions import BadRequest, NotFound

from .tokens import email_verification_token

User = get_user_model()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Registration & Verification
# ---------------------------------------------------------------------------


def register_user(validated_data):
    """
    Create a new user account and send a verification email.

    Args:
        validated_data: Dict with email, password, first_name, last_name.

    Returns:
        The newly created User instance.
    """
    user = User.objects.create_user(
        email=validated_data["email"].lower().strip(),
        password=validated_data["password"],
        first_name=validated_data["first_name"],
        last_name=validated_data["last_name"],
    )
    send_verification_email(user)
    logger.info("New user registered: %s", user.email)
    return user


def verify_email(uid, token):
    """
    Verify a user's email address using the uid and token from the verification link.

    Args:
        uid: Base64-encoded user primary key.
        token: Verification token.

    Returns:
        The verified User instance.

    Raises:
        BadRequest: If the uid or token is invalid.
    """
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise BadRequest("Invalid verification link.")

    if user.is_email_verified:
        raise BadRequest("Email is already verified.")

    if not email_verification_token.check_token(user, token):
        raise BadRequest("Invalid or expired verification token.")

    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])

    # Send welcome email after successful verification
    send_welcome_email(user)
    logger.info("Email verified for user: %s", user.email)
    return user


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


def login_user(email, password):
    """
    Authenticate a user and generate JWT tokens.

    Args:
        email: User's email address.
        password: User's password.

    Returns:
        Dict with 'user' and 'tokens' (access + refresh).

    Raises:
        BadRequest: If credentials are invalid or email not verified.
    """
    user = authenticate(email=email.lower().strip(), password=password)

    if user is None:
        raise BadRequest("Invalid email or password.")

    if not user.is_active:
        raise BadRequest("This account has been deactivated.")

    if not user.is_email_verified:
        # Resend verification email as a courtesy
        send_verification_email(user)
        raise BadRequest(
            "Please verify your email before logging in. "
            "A new verification email has been sent."
        )

    tokens = generate_tokens(user)
    logger.info("User logged in: %s", user.email)
    return {"user": user, "tokens": tokens}


def generate_tokens(user):
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def refresh_access_token(refresh_token_str):
    """
    Generate a new access token from a valid refresh token.

    Args:
        refresh_token_str: The refresh token string from the cookie.

    Returns:
        Dict with new 'access' and 'refresh' tokens.

    Raises:
        BadRequest: If the refresh token is invalid or expired.
    """
    try:
        refresh = RefreshToken(refresh_token_str)
        # Rotate refresh token for security
        new_access = str(refresh.access_token)
        new_refresh = str(refresh)
        return {"access": new_access, "refresh": new_refresh}
    except Exception:
        raise BadRequest("Invalid or expired refresh token. Please log in again.")


# ---------------------------------------------------------------------------
# Password Management
# ---------------------------------------------------------------------------


def send_password_reset_email(email):
    """
    Send a password reset email if the user exists.

    Always returns successfully regardless of whether the email exists,
    to prevent user enumeration attacks.
    """
    try:
        user = User.objects.get(email=email.lower().strip())
    except User.DoesNotExist:
        # Don't reveal whether the email exists
        logger.info("Password reset requested for non-existent email: %s", email)
        return

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    html_message = render_to_string(
        "emails/password_reset_email.html",
        {"user": user, "reset_link": reset_link},
    )

    send_mail(
        subject="Reset Your Password — CustomCollection",
        message=strip_tags(html_message),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
    logger.info("Password reset email sent to: %s", user.email)


def reset_password(uid, token, new_password):
    """
    Reset a user's password using the uid and token from the reset email.

    Args:
        uid: Base64-encoded user primary key.
        token: Password reset token.
        new_password: The new password.

    Returns:
        The User instance with updated password.

    Raises:
        BadRequest: If uid/token is invalid.
    """
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise BadRequest("Invalid password reset link.")

    if not email_verification_token.check_token(user, token):
        raise BadRequest("Invalid or expired reset token.")

    user.set_password(new_password)
    user.save(update_fields=["password"])
    logger.info("Password reset for user: %s", user.email)
    return user


def change_password(user, old_password, new_password):
    """
    Change an authenticated user's password.

    Args:
        user: The authenticated User instance.
        old_password: Current password for verification.
        new_password: The new password.

    Raises:
        BadRequest: If the old password is incorrect.
    """
    if not user.check_password(old_password):
        raise BadRequest("Current password is incorrect.")

    user.set_password(new_password)
    user.save(update_fields=["password"])
    logger.info("Password changed for user: %s", user.email)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


def update_profile(user, validated_data):
    """
    Update user profile information spanning User and Profile models.

    Args:
        user: The authenticated User instance.
        validated_data: Dict with optional first_name, last_name, phone, avatar_url.

    Returns:
        The updated User instance (with profile accessible via user.profile).
    """
    # Update User fields
    user_fields_changed = []
    if "first_name" in validated_data:
        user.first_name = validated_data["first_name"]
        user_fields_changed.append("first_name")
    if "last_name" in validated_data:
        user.last_name = validated_data["last_name"]
        user_fields_changed.append("last_name")
    if user_fields_changed:
        user.save(update_fields=user_fields_changed)

    # Update Profile fields
    profile = user.profile
    profile_fields_changed = []
    if "phone" in validated_data:
        profile.phone = validated_data["phone"] or None
        profile_fields_changed.append("phone")
    if "avatar_url" in validated_data:
        profile.avatar_url = validated_data["avatar_url"] or None
        profile_fields_changed.append("avatar_url")
    if profile_fields_changed:
        profile.save(update_fields=profile_fields_changed)

    logger.info("Profile updated for user: %s", user.email)
    return user


# ---------------------------------------------------------------------------
# Cookie Helpers
# ---------------------------------------------------------------------------


def set_auth_cookies(response, tokens):
    """
    Set JWT access and refresh tokens as httpOnly cookies on the response.

    Args:
        response: The DRF Response object.
        tokens: Dict with 'access' and 'refresh' token strings.

    Returns:
        The response with cookies set.
    """
    jwt_settings = settings.SIMPLE_JWT

    response.set_cookie(
        key=jwt_settings.get("AUTH_COOKIE", "access_token"),
        value=tokens["access"],
        max_age=int(jwt_settings["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        httponly=jwt_settings.get("AUTH_COOKIE_HTTP_ONLY", True),
        secure=jwt_settings.get("AUTH_COOKIE_SECURE", False),
        samesite=jwt_settings.get("AUTH_COOKIE_SAMESITE", "Lax"),
        path=jwt_settings.get("AUTH_COOKIE_PATH", "/"),
        domain=jwt_settings.get("AUTH_COOKIE_DOMAIN"),
    )

    response.set_cookie(
        key=jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token"),
        value=tokens["refresh"],
        max_age=int(jwt_settings["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=jwt_settings.get("AUTH_COOKIE_HTTP_ONLY", True),
        secure=jwt_settings.get("AUTH_COOKIE_SECURE", False),
        samesite=jwt_settings.get("AUTH_COOKIE_SAMESITE", "Lax"),
        path=jwt_settings.get("AUTH_COOKIE_PATH", "/"),
        domain=jwt_settings.get("AUTH_COOKIE_DOMAIN"),
    )

    return response


def clear_auth_cookies(response):
    """
    Remove JWT cookies from the response (logout).

    Args:
        response: The DRF Response object.

    Returns:
        The response with cookies cleared.
    """
    jwt_settings = settings.SIMPLE_JWT

    response.delete_cookie(
        key=jwt_settings.get("AUTH_COOKIE", "access_token"),
        path=jwt_settings.get("AUTH_COOKIE_PATH", "/"),
        domain=jwt_settings.get("AUTH_COOKIE_DOMAIN"),
        samesite=jwt_settings.get("AUTH_COOKIE_SAMESITE", "Lax"),
    )

    response.delete_cookie(
        key=jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token"),
        path=jwt_settings.get("AUTH_COOKIE_PATH", "/"),
        domain=jwt_settings.get("AUTH_COOKIE_DOMAIN"),
        samesite=jwt_settings.get("AUTH_COOKIE_SAMESITE", "Lax"),
    )

    return response


# ---------------------------------------------------------------------------
# Email Helpers
# ---------------------------------------------------------------------------


def send_verification_email(user):
    """
    Send an email verification link to the user.

    Args:
        user: The User instance to send verification to.
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)
    verification_link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"

    html_message = render_to_string(
        "emails/verification_email.html",
        {"user": user, "verification_link": verification_link},
    )

    send_mail(
        subject="Verify Your Email — CustomCollection",
        message=strip_tags(html_message),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
    logger.info("Verification email sent to: %s", user.email)


def send_welcome_email(user):
    """
    Send a welcome email after successful email verification.

    Args:
        user: The verified User instance.
    """
    html_message = render_to_string(
        "emails/welcome_email.html",
        {
            "user": user,
            "shop_link": f"{settings.FRONTEND_URL}/products",
        },
    )

    send_mail(
        subject="Welcome to CustomCollection!",
        message=strip_tags(html_message),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
    logger.info("Welcome email sent to: %s", user.email)
