"""Cart Django Admin configuration."""

from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("product", "size", "color", "quantity", "line_total")

    def line_total(self, obj):
        return f"₹{obj.line_total:.2f}"

    line_total.short_description = "Line Total"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "total_items", "subtotal_display", "created_at")
    search_fields = ("user__email",)
    inlines = [CartItemInline]

    def subtotal_display(self, obj):
        return f"₹{obj.subtotal:.2f}"

    subtotal_display.short_description = "Subtotal"
