"""
Custom token generators for email verification and password reset.

The token includes the user's email verification status so that
a token generated before verification cannot be reused after.
"""

from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Token generator for email verification links.

    The hash includes the user's pk and is_email_verified status,
    ensuring the token is invalidated once the email is verified.
    """

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.is_email_verified}"


email_verification_token = EmailVerificationTokenGenerator()
