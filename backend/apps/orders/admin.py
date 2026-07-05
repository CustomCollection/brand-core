"""
Order Django Admin — the operational dashboard for order management.

This is where the admin manages the entire Print-on-Demand workflow:
receiving orders, updating status, entering shipping details, etc.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import Order, OrderItem, Shipment, ShippingConfig
from .services import send_delivery_email, send_shipping_update_email


class OrderItemInline(admin.TabularInline):
    """Read-only inline for order items."""

    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_name",
        "product_slug",
        "image_preview",
        "price",
        "size",
        "color",
        "quantity",
        "line_total_display",
    )
    fields = (
        "image_preview",
        "product_name",
        "size",
        "color",
        "price",
        "quantity",
        "line_total_display",
    )

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def image_preview(self, obj):
        if obj.product_image_url:
            return format_html(
                '<img src="{}" style="max-height: 50px; border-radius: 4px;" />',
                obj.product_image_url,
            )
        return "—"

    image_preview.short_description = "Image"

    def line_total_display(self, obj):
        return f"₹{obj.line_total:.2f}"

    line_total_display.short_description = "Total"


class ShipmentInline(admin.StackedInline):
    """Inline for adding/editing shipment details on the order."""

    model = Shipment
    extra = 0
    max_num = 1
    fields = ("courier", "tracking_number", "shipped_at", "delivered_at")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Comprehensive order admin for Print-on-Demand workflow management.

    Admin can:
    - View all orders with filters by status
    - Update order status (Pending → Confirmed → Printing → Packed → Shipped → Delivered)
    - Enter shipping details (courier, tracking number)
    - View order items with product snapshots
    - Search by order number or customer email
    """

    list_display = (
        "order_number",
        "user",
        "status_badge",
        "total_display",
        "payment_status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "user__email", "user__first_name", "user__last_name")
    ordering = ("-created_at",)
    readonly_fields = ("order_number", "user", "subtotal", "shipping_cost", "total", "created_at")
    inlines = [OrderItemInline, ShipmentInline]
    list_per_page = 25

    fieldsets = (
        (
            "Order Information",
            {
                "fields": ("order_number", "user", "status", "created_at"),
            },
        ),
        (
            "Pricing",
            {
                "fields": ("subtotal", "shipping_cost", "total"),
            },
        ),
        (
            "Shipping Address",
            {
                "fields": ("shipping_address",),
            },
        ),
        (
            "Admin Notes",
            {
                "fields": ("notes",),
                "classes": ("collapse",),
            },
        ),
    )

    def status_badge(self, obj):
        colors = {
            "pending": "#f59e0b",
            "confirmed": "#3b82f6",
            "printing": "#8b5cf6",
            "packed": "#6366f1",
            "shipped": "#06b6d4",
            "delivered": "#22c55e",
            "cancelled": "#ef4444",
            "returned": "#f97316",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: 600; '
            'text-transform: uppercase;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    def total_display(self, obj):
        return f"₹{obj.total:.2f}"

    total_display.short_description = "Total"

    def payment_status(self, obj):
        try:
            payment = obj.payment
            color = "#22c55e" if payment.status == "paid" else "#f59e0b"
            return format_html(
                '<span style="color: {}; font-weight: 600;">{}</span>',
                color,
                payment.get_status_display(),
            )
        except Exception:
            return "—"

    payment_status.short_description = "Payment"

    def save_model(self, request, obj, form, change):
        """Send emails on status changes."""
        if change:
            old_obj = Order.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                if obj.status == "shipped":
                    send_shipping_update_email(obj)
                elif obj.status == "delivered":
                    send_delivery_email(obj)

        super().save_model(request, obj, form, change)

    # Bulk actions
    actions = ["mark_confirmed", "mark_printing", "mark_packed"]

    @admin.action(description="Mark as Confirmed")
    def mark_confirmed(self, request, queryset):
        updated = queryset.filter(status="pending").update(status="confirmed")
        self.message_user(request, f"{updated} order(s) confirmed.")

    @admin.action(description="Mark as Printing")
    def mark_printing(self, request, queryset):
        updated = queryset.filter(status="confirmed").update(status="printing")
        self.message_user(request, f"{updated} order(s) moved to printing.")

    @admin.action(description="Mark as Packed")
    def mark_packed(self, request, queryset):
        updated = queryset.filter(status="printing").update(status="packed")
        self.message_user(request, f"{updated} order(s) packed.")


@admin.register(ShippingConfig)
class ShippingConfigAdmin(admin.ModelAdmin):
    """Admin for configuring shipping charges — singleton model."""

    list_display = ("flat_shipping_charge", "free_shipping_threshold")

    def has_add_permission(self, request):
        # Only allow one instance
        return not ShippingConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
