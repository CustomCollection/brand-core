"""Payment URL configuration."""

from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("create-order/", views.CreatePaymentView.as_view(), name="create-payment"),
    path("verify/", views.VerifyPaymentView.as_view(), name="verify-payment"),
]
