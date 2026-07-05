"""
Account URL configuration.

Auth endpoints are prefixed with 'auth/' and account management
endpoints are at the root level of this app's URL namespace.
"""

from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    # Authentication
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/token/refresh/", views.TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/forgot-password/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    # Profile
    path("profile/", views.ProfileView.as_view(), name="profile"),
    # Addresses
    path("addresses/", views.AddressListCreateView.as_view(), name="address-list"),
    path("addresses/<int:pk>/", views.AddressDetailView.as_view(), name="address-detail"),
]
