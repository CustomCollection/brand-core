"""
Service orchestration for AI Design Workspace.

Handles:
- Token account management (daily free tokens + purchased balance).
- Multi-turn conversation management.
- Multi-provider fallback orchestration for text LLM and diffusion models.
- Cloudinary asset upload for reference images and generated artwork.
- Seamless artwork persistence and token deduction.
"""

import io
import time
import cloudinary.uploader
from django.core.files.storage import default_storage
from django.utils import timezone

from .adapters import AIServicePipeline
from .models import AIConversation, AIMessage, GeneratedArtwork, UserTokenAccount


pipeline = AIServicePipeline()


def get_or_create_token_account(user=None, session_key=""):
    """
    Retrieves or initializes the token ledger for an authenticated user or guest session.
    Automatically replenishes the 5 free daily tokens if a new day has arrived.
    """
    if user and user.is_authenticated:
        account, _ = UserTokenAccount.objects.get_or_create(
            user=user,
            defaults={"daily_free_tokens": 5, "last_reset_date": timezone.localdate()},
        )
    else:
        account, _ = UserTokenAccount.objects.get_or_create(
            session_key=session_key or "guest_default",
            user=None,
            defaults={"daily_free_tokens": 5, "last_reset_date": timezone.localdate()},
        )

    account.check_and_reset_daily()
    return account


def upload_reference_image(file_obj):
    """Uploads a user-supplied reference image to Cloudinary."""
    try:
        res = cloudinary.uploader.upload(
            file_obj,
            folder="custom_designs/ai_references",
            resource_type="image",
        )
        return res.get("secure_url", "")
    except Exception:
        file_path = default_storage.save(f"references/{file_obj.name}", file_obj)
        return default_storage.url(file_path)


def upload_generated_artwork(image_bytes, prompt):
    """Uploads generated artwork bytes to Cloudinary."""
    try:
        res = cloudinary.uploader.upload(
            image_bytes,
            folder="custom_designs/ai_generated",
            resource_type="image",
        )
        return res.get("secure_url", "")
    except Exception:
        buf = io.BytesIO(image_bytes)
        file_path = default_storage.save(f"ai_artworks/ai_{int(time.time())}.png", buf)
        return default_storage.url(file_path)


def process_user_generation_request(
    conversation,
    user_prompt,
    reference_file=None,
    reference_url="",
    user=None,
    session_key="",
):
    """
    End-to-end execution of a conversational design generation turn:
    1. Check token balance.
    2. Handle single reference image attachment if provided.
    3. Run Text LLM with fallback chain for intent classification & prompt preparation.
    4. Run Text-to-Image diffusion with fallback chain.
    5. Upload artwork to Cloudinary.
    6. Record messages and GeneratedArtwork.
    7. Deduct token.
    """
    # 1. Token validation
    token_account = get_or_create_token_account(user=user, session_key=session_key)
    if token_account.available_tokens < 1:
        raise ValueError(
            "Daily free generation tokens exhausted (5/5 used). Please wait until midnight IST or purchase additional tokens."
        )

    start_time = time.time()

    # 2. Reference image handling (max 1 active reference per cycle)
    ref_image_url = reference_url
    if reference_file:
        ref_image_url = upload_reference_image(reference_file)

    # 3. Create User AIMessage
    user_msg = AIMessage.objects.create(
        conversation=conversation,
        role=AIMessage.Role.USER,
        content=user_prompt,
        reference_image_url=ref_image_url or "",
    )

    # 4. Text LLM prompt preparation
    history = list(conversation.messages.all().order_by("created_at"))
    text_result = pipeline.execute_text_generation(
        user_prompt=user_prompt,
        conversation_history=history,
        reference_image_url=ref_image_url,
    )

    refined_prompt = text_result["refined_prompt"]
    assistant_reply = text_result["assistant_reply"]

    # 5. Image generation
    image_result = pipeline.execute_image_generation(
        prompt=refined_prompt,
        reference_image_url=ref_image_url,
    )

    # 6. Upload artwork to Cloudinary
    final_image_url = upload_generated_artwork(
        image_bytes=image_result["image_bytes"],
        prompt=refined_prompt,
    )

    elapsed_time = round(time.time() - start_time, 2)

    # 7. Create Assistant AIMessage with generation metadata
    assistant_msg = AIMessage.objects.create(
        conversation=conversation,
        role=AIMessage.Role.ASSISTANT,
        content=assistant_reply,
        generated_image_url=final_image_url,
        generation_metadata={
            "prompt_used": refined_prompt,
            "text_provider": text_result["provider"],
            "text_model": text_result["model"],
            "image_provider": image_result["provider"],
            "image_model": image_result["model"],
            "elapsed_seconds": elapsed_time,
            "tokens_deducted": 1,
        },
    )

    # 8. Record GeneratedArtwork
    artwork = GeneratedArtwork.objects.create(
        conversation=conversation,
        message=assistant_msg,
        user=user if user and user.is_authenticated else None,
        session_key=session_key or "",
        image_url=final_image_url,
        prompt_used=refined_prompt,
        provider=image_result["provider"],
        model_name=image_result["model"],
        width=image_result["width"],
        height=image_result["height"],
    )

    # 9. Deduct token
    token_account.deduct_token()

    # 10. Update conversation summary & stats
    conversation.total_generations += 1
    if not conversation.title or conversation.title == "New Design Chat":
        words = user_prompt.split()
        conversation.title = " ".join(words[:5]).capitalize()
    conversation.save(update_fields=["total_generations", "title", "updated_at"])

    return {
        "user_message": user_msg,
        "assistant_message": assistant_msg,
        "artwork": artwork,
        "tokens_remaining": token_account.available_tokens,
    }
