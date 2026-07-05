"""
Account views — thin HTTP handlers that delegate to services.py.

Each view handles request parsing, calls the appropriate service function,
and returns a properly formatted response. No business logic here.
"""

from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsOwner

from .models import Address
from .serializers import (
    AddressSerializer,
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from .services import (
    change_password,
    clear_auth_cookies,
    login_user,
    refresh_access_token,
    register_user,
    reset_password,
    send_password_reset_email,
    set_auth_cookies,
    update_profile,
    verify_email,
)


class RegisterView(APIView):
    """Create a new user account and send verification email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = register_user(serializer.validated_data)
        return Response(
            {
                "message": "Registration successful. Please check your email to verify your account.",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """Verify a user's email address using uid and token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verify_email(
            uid=serializer.validated_data["uid"],
            token=serializer.validated_data["token"],
        )
        return Response({"message": "Email verified successfully. You can now log in."})


class LoginView(APIView):
    """Authenticate user and set JWT tokens in httpOnly cookies."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        user_data = UserSerializer(result["user"]).data
        response = Response(
            {"message": "Login successful.", "user": user_data},
            status=status.HTTP_200_OK,
        )

        return set_auth_cookies(response, result["tokens"])


class LogoutView(APIView):
    """Clear JWT cookies to log the user out."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
        return clear_auth_cookies(response)


class TokenRefreshView(APIView):
    """
    Refresh the access token using the refresh token from the cookie.

    Unlike SimpleJWT's default TokenRefreshView, this reads the refresh
    token from an httpOnly cookie rather than the request body.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        refresh_token_str = request.COOKIES.get(refresh_cookie_name)

        if not refresh_token_str:
            return Response(
                {"message": "No refresh token found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = refresh_access_token(refresh_token_str)
        response = Response({"message": "Token refreshed."}, status=status.HTTP_200_OK)
        return set_auth_cookies(response, tokens)


class ForgotPasswordView(APIView):
    """Send a password reset email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        send_password_reset_email(serializer.validated_data["email"])
        # Always return success to prevent email enumeration
        return Response(
            {"message": "If an account exists with this email, a reset link has been sent."}
        )


class ResetPasswordView(APIView):
    """Reset password using uid and token from the reset email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_password(
            uid=serializer.validated_data["uid"],
            token=serializer.validated_data["token"],
            new_password=serializer.validated_data["password"],
        )
        return Response({"message": "Password reset successful. You can now log in."})


class ChangePasswordView(APIView):
    """Change password for authenticated users."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )
        return Response({"message": "Password changed successfully."})


class ProfileView(APIView):
    """Get or update the authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user.profile)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_profile(request.user, serializer.validated_data)
        # Return the updated profile
        profile_data = ProfileSerializer(request.user.profile).data
        return Response({"message": "Profile updated successfully.", **profile_data})


class AddressListCreateView(generics.ListCreateAPIView):
    """List all addresses or create a new one for the authenticated user."""

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific address."""

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
