"""
AI Design Workspace models for the CustomCollection Design Engine.

Responsible for:
- AI conversations / chat threads per user or session.
- Multi-turn message history (user prompts, assistant design guidance, system instructions).
- Single reference image attachment per generation prompt.
- Generated artwork gallery with direct 'Use It' integration for garment placements.
- Token ledger: 5 free daily tokens per user (resetting at midnight IST) + purchasable token packs.
- Admin-manageable token packages and pricing.
"""

import uuid
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.common.models import TimeStampedModel


class UserTokenAccount(TimeStampedModel):
    """
    Token account ledger for users and anonymous sessions.
    Provides 5 free tokens daily, resetting every calendar day (IST).
    Additional tokens can be purchased via TokenPackage.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_token_account",
        null=True,
        blank=True,
    )
    session_key = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Guest anonymous session identifier",
    )
    daily_free_tokens = models.PositiveIntegerField(
        default=5,
        help_text="Free generation tokens remaining today (resets to 5 daily)",
    )
    last_reset_date = models.DateField(
        default=timezone.now,
        help_text="Last date when the free daily tokens were replenished",
    )
    purchased_tokens = models.PositiveIntegerField(
        default=0,
        help_text="Purchased token balance (never expires)",
    )
    total_tokens_used = models.PositiveIntegerField(
        default=0,
        help_text="Total lifetime generation tokens consumed",
    )

    class Meta:
        verbose_name = "user token account"
        verbose_name_plural = "user token accounts"

    def __str__(self):
        owner = self.user.email if self.user else f"Guest ({self.session_key[:8]})"
        return f"Tokens for {owner}: {self.available_tokens} (Free: {self.daily_free_tokens}, Purchased: {self.purchased_tokens})"

    def check_and_reset_daily(self):
        """Reset the 5 free tokens if a new calendar day has arrived."""
        today = timezone.localdate()
        if self.last_reset_date < today:
            self.daily_free_tokens = 5
            self.last_reset_date = today
            self.save(update_fields=["daily_free_tokens", "last_reset_date", "updated_at"])

    @property
    def available_tokens(self):
        self.check_and_reset_daily()
        return self.daily_free_tokens + self.purchased_tokens

    def deduct_token(self):
        """
        Deducts 1 token from daily free balance first, then purchased balance.
        Returns True if successful, False if insufficient balance.
        """
        self.check_and_reset_daily()
        if self.daily_free_tokens > 0:
            self.daily_free_tokens -= 1
            self.total_tokens_used += 1
            self.save(update_fields=["daily_free_tokens", "total_tokens_used", "updated_at"])
            return True
        elif self.purchased_tokens > 0:
            self.purchased_tokens -= 1
            self.total_tokens_used += 1
            self.save(update_fields=["purchased_tokens", "total_tokens_used", "updated_at"])
            return True
        return False


class TokenPackage(TimeStampedModel):
    """
    Admin-configurable purchasable token packs.
    Example: 1 Token for ₹20, 5 Tokens for ₹70, 10 Tokens for ₹120.
    """

    name = models.CharField(max_length=100, help_text="e.g. Starter Pack (5 Tokens)")
    tokens = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price in INR",
    )
    badge_text = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Optional tag like 'Best Value' or 'Popular'",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "token package"
        verbose_name_plural = "token packages"
        ordering = ["sort_order", "price"]

    def __str__(self):
        return f"{self.name} — {self.tokens} Tokens for ₹{self.price}"


class AIConversation(TimeStampedModel):
    """
    An independent conversational design chat thread.
    Users can maintain multiple design conversations (e.g. Anime designs, Typography, Cyberpunk).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_conversations",
        null=True,
        blank=True,
    )
    session_key = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Guest anonymous session identifier",
    )
    title = models.CharField(max_length=200, default="New Design Chat")
    context_summary = models.TextField(
        blank=True,
        default="",
        help_text="Rolling summary of past design ideas to keep generation context sharp",
    )
    total_generations = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "AI conversation"
        verbose_name_plural = "AI conversations"
        ordering = ["-updated_at"]

    def __str__(self):
        owner = self.user.email if self.user else f"Guest ({self.session_key[:8]})"
        return f"{self.title} [{owner}]"


class AIMessage(TimeStampedModel):
    """
    Message in an AI design conversation.
    Supports user prompts with optional single reference image, and assistant responses with generated artwork.
    """

    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"
        SYSTEM = "system", "System"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    content = models.TextField(help_text="Text content of the message")
    reference_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Single reference image attached by user for this prompt cycle",
    )
    generated_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Image generated in response to this message (if any)",
    )
    generation_metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Metadata including prompt used, model, provider, seed, latency",
    )

    class Meta:
        verbose_name = "AI message"
        verbose_name_plural = "AI messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role.upper()}] {self.content[:50]}"


class GeneratedArtwork(TimeStampedModel):
    """
    A generated print-ready design asset that can be used on any garment placement.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name="artworks",
    )
    message = models.ForeignKey(
        AIMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="artworks",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ai_artworks",
    )
    session_key = models.CharField(max_length=64, blank=True, default="")
    image_url = models.URLField(max_length=500, help_text="Stored image URL (Cloudinary / S3)")
    prompt_used = models.TextField()
    provider = models.CharField(max_length=50, blank=True, default="")
    model_name = models.CharField(max_length=100, blank=True, default="")
    width = models.PositiveIntegerField(default=1024)
    height = models.PositiveIntegerField(default=1024)
    is_favorite = models.BooleanField(default=False)

    class Meta:
        verbose_name = "generated artwork"
        verbose_name_plural = "generated artworks"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Artwork ({self.width}x{self.height}) - {self.prompt_used[:40]}"
