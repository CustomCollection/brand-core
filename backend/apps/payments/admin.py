"""Payment Django Admin."""

from django.contrib import admin
from django.utils.html import format_html

from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "method",
        "amount_display",
        "status_badge",
        "razorpay_payment_id",
        "paid_at",
        "created_at",
    )
    list_filter = ("method", "status", "created_at")
    search_fields = ("order__order_number", "razorpay_order_id", "razorpay_payment_id")
    ordering = ("-created_at",)
    readonly_fields = (
        "order",
        "method",
        "amount",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "paid_at",
    )

    def amount_display(self, obj):
        return f"₹{obj.amount:.2f}"

    amount_display.short_description = "Amount"

    def status_badge(self, obj):
        colors = {
            "pending": "#f59e0b",
            "paid": "#22c55e",
            "failed": "#ef4444",
            "refunded": "#6366f1",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: 600;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "user",
        "amount_display",
        "upi_id",
        "status_badge",
        "processed_at",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("order__order_number", "user__email", "upi_id", "admin_notes")
    ordering = ("-created_at",)
    readonly_fields = ("order", "user", "payment", "amount", "upi_id", "reason", "created_at")
    fields = (
        "order",
        "user",
        "payment",
        "amount",
        "upi_id",
        "reason",
        "status",
        "admin_notes",
        "processed_at",
        "created_at",
    )

    def amount_display(self, obj):
        return f"₹{obj.amount:.2f}"

    amount_display.short_description = "Refund Amount"

    def status_badge(self, obj):
        colors = {
            "pending": "#f59e0b",
            "processed": "#22c55e",
            "rejected": "#ef4444",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: 600;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Refund Status"

