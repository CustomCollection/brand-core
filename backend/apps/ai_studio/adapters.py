"""
Replaceable AI Model Adapters with Multi-Provider Fallback.

Text LLM Pipeline:
Priority 1: Google Gemini (gemini-1.5-flash / gemini-1.5-pro)
Priority 2: OpenAI (gpt-4o-mini / gpt-4o)
Priority 3: Anthropic Claude (claude-3-5-sonnet)
Fallback: Mock/Dev Intelligent Rule-Based Adapter

Text-to-Image Diffusion Pipeline:
Priority 1: OpenAI DALL-E 3
Priority 2: Stability AI (SDXL)
Priority 3: Replicate (stability-ai/sdxl)
Fallback: Mock/Dev Procedural Graphic Generator (renders print-ready vector/typography art via Pillow)
"""

import io
import json
import logging
import random
import requests
from decouple import config
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)


# ==============================================================================
# TEXT-TO-TEXT LLM ADAPTERS
# ==============================================================================

class BaseTextAdapter:
    """Base interface for conversational design prompt planners."""

    def prepare_design_prompt(self, user_prompt, conversation_history, reference_image_url=None):
        """
        Returns a dict:
        {
            "refined_prompt": str,
            "assistant_reply": str,
            "provider": str,
            "model": str
        }
        """
        raise NotImplementedError


class GeminiTextAdapter(BaseTextAdapter):
    """Google Gemini API adapter for prompt engineering and conversational assistance."""

    def __init__(self):
        self.api_key = config("GEMINI_API_KEY", default="").strip()
        self.model = config("GEMINI_TEXT_MODEL", default="gemini-1.5-flash").strip()

    def is_configured(self):
        return bool(self.api_key)

    def prepare_design_prompt(self, user_prompt, conversation_history, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        system_instruction = (
            "You are an expert fashion graphic designer and creative director for CustomCollection. "
            "A user will give you an apparel design idea. You must converse naturally, give helpful design advice, "
            "and craft a high-detail, print-ready image generation prompt optimized for t-shirt graphics "
            "(clean borders, vibrant, isolated background, no apparel mockups in the design itself). "
            "Respond in JSON format: "
            '{"assistant_reply": "<friendly concise advice for user>", "refined_prompt": "<isolated t-shirt graphic prompt>"}'
        )

        contents = []
        for msg in conversation_history[-6:]:
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.content}]})

        current_text = f"User Request: {user_prompt}"
        if reference_image_url:
            current_text += f"\n[User provided 1 reference image to guide style: {reference_image_url}]"

        contents.append({"role": "user", "parts": [{"text": current_text}]})

        payload = {
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json",
            },
        }

        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        text_out = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text_out)

        return {
            "refined_prompt": parsed.get("refined_prompt", user_prompt),
            "assistant_reply": parsed.get("assistant_reply", "Here is your custom design artwork!"),
            "provider": "gemini",
            "model": self.model,
        }


class OpenAITextAdapter(BaseTextAdapter):
    """OpenAI GPT adapter for prompt engineering."""

    def __init__(self):
        self.api_key = config("OPENAI_API_KEY", default="").strip()
        self.model = config("OPENAI_TEXT_MODEL", default="gpt-4o-mini").strip()

    def is_configured(self):
        return bool(self.api_key)

    def prepare_design_prompt(self, user_prompt, conversation_history, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("OPENAI_API_KEY is not configured.")

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        system_msg = {
            "role": "system",
            "content": (
                "You are an expert fashion graphic designer. "
                "Respond with valid JSON: "
                '{"assistant_reply": "<brief user guidance>", "refined_prompt": "<detailed t-shirt graphic prompt on clean background>"}'
            ),
        }

        messages = [system_msg]
        for msg in conversation_history[-6:]:
            role = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role, "content": msg.content})

        user_content = user_prompt
        if reference_image_url:
            user_content += f"\n[Style reference provided: {reference_image_url}]"

        messages.append({"role": "user", "content": user_content})

        payload = {
            "model": self.model,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        text_out = data["choices"][0]["message"]["content"]
        parsed = json.loads(text_out)

        return {
            "refined_prompt": parsed.get("refined_prompt", user_prompt),
            "assistant_reply": parsed.get("assistant_reply", "I created this design based on your concept!"),
            "provider": "openai",
            "model": self.model,
        }


class AnthropicTextAdapter(BaseTextAdapter):
    """Anthropic Claude adapter for prompt engineering."""

    def __init__(self):
        self.api_key = config("ANTHROPIC_API_KEY", default="").strip()
        self.model = config("ANTHROPIC_TEXT_MODEL", default="claude-3-5-sonnet-20241022").strip()

    def is_configured(self):
        return bool(self.api_key)

    def prepare_design_prompt(self, user_prompt, conversation_history, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("ANTHROPIC_API_KEY is not configured.")

        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        system_prompt = (
            "You are an apparel graphic designer. Respond ONLY with valid JSON: "
            '{"assistant_reply": "<brief guidance>", "refined_prompt": "<t-shirt graphic prompt>"}'
        )

        messages = []
        for msg in conversation_history[-6:]:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": self.model,
            "max_tokens": 1000,
            "system": system_prompt,
            "messages": messages,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        text_out = data["content"][0]["text"]
        parsed = json.loads(text_out)

        return {
            "refined_prompt": parsed.get("refined_prompt", user_prompt),
            "assistant_reply": parsed.get("assistant_reply", "Artwork designed!"),
            "provider": "anthropic",
            "model": self.model,
        }


class MockDevTextAdapter(BaseTextAdapter):
    """
    Intelligent development fallback when no third-party LLM keys are supplied.
    Ensures developer/staging flows work seamlessly with polished responses.
    """

    def prepare_design_prompt(self, user_prompt, conversation_history, reference_image_url=None):
        style_hints = ["vector graphics", "cyberpunk neon", "minimalist line art", "vintage retro", "bold typography"]
        chosen_style = random.choice(style_hints)

        refined = f"High-contrast apparel graphic: {user_prompt}, styled as {chosen_style}, sharp contours, isolated on transparent background, 300 DPI print quality."
        reply = (
            f"I have crafted a custom design for your concept: \"{user_prompt}\". "
            f"Optimized with {chosen_style} aesthetic for crisp garment printing."
        )

        return {
            "refined_prompt": refined,
            "assistant_reply": reply,
            "provider": "dev_mock",
            "model": "rule-based-v1",
        }


# ==============================================================================
# TEXT-TO-IMAGE DIFFUSION ADAPTERS
# ==============================================================================

class BaseImageAdapter:
    """Base interface for text-to-image artwork generators."""

    def generate_artwork(self, prompt, reference_image_url=None):
        """
        Returns a dict:
        {
            "image_bytes": bytes,
            "provider": str,
            "model": str,
            "width": int,
            "height": int
        }
        """
        raise NotImplementedError


class OpenAIDallEAdapter(BaseImageAdapter):
    """OpenAI DALL-E 3 image generation adapter."""

    def __init__(self):
        self.api_key = config("OPENAI_API_KEY", default="").strip()
        self.model = config("OPENAI_IMAGE_MODEL", default="dall-e-3").strip()

    def is_configured(self):
        return bool(self.api_key)

    def generate_artwork(self, prompt, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("OPENAI_API_KEY is not configured.")

        url = "https://api.openai.com/v1/images/generations"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json",
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        import base64
        b64_data = data["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64_data)

        return {
            "image_bytes": image_bytes,
            "provider": "openai",
            "model": self.model,
            "width": 1024,
            "height": 1024,
        }


class StabilityImageAdapter(BaseImageAdapter):
    """Stability AI (SDXL) image generation adapter."""

    def __init__(self):
        self.api_key = config("STABILITY_API_KEY", default="").strip()
        self.model = config("STABILITY_IMAGE_MODEL", default="stable-diffusion-xl-1024-v1-0").strip()

    def is_configured(self):
        return bool(self.api_key)

    def generate_artwork(self, prompt, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("STABILITY_API_KEY is not configured.")

        url = f"https://api.stability.ai/v1/generation/{self.model}/text-to-image"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "text_prompts": [
                {"text": prompt, "weight": 1.0},
                {"text": "blurry, low quality, photorealistic t-shirt mockup, background", "weight": -0.8},
            ],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        import base64
        b64_data = data["artifacts"][0]["base64"]
        image_bytes = base64.b64decode(b64_data)

        return {
            "image_bytes": image_bytes,
            "provider": "stability",
            "model": self.model,
            "width": 1024,
            "height": 1024,
        }


class ReplicateImageAdapter(BaseImageAdapter):
    """Replicate SDXL image generation adapter."""

    def __init__(self):
        self.api_token = config("REPLICATE_API_TOKEN", default="").strip()
        self.model = config("REPLICATE_IMAGE_MODEL", default="stability-ai/sdxl").strip()

    def is_configured(self):
        return bool(self.api_token)

    def generate_artwork(self, prompt, reference_image_url=None):
        if not self.is_configured():
            raise ValueError("REPLICATE_API_TOKEN is not configured.")

        url = "https://api.replicate.com/v1/predictions"
        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            "input": {
                "prompt": prompt,
                "width": 1024,
                "height": 1024,
            },
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        # Replicate predictions are async; poll for output
        poll_url = data["urls"]["get"]
        import time
        for _ in range(30):
            time.sleep(2)
            check = requests.get(poll_url, headers=headers, timeout=15).json()
            if check["status"] == "succeeded":
                img_url = check["output"][0]
                img_resp = requests.get(img_url, timeout=30)
                return {
                    "image_bytes": img_resp.content,
                    "provider": "replicate",
                    "model": self.model,
                    "width": 1024,
                    "height": 1024,
                }
            elif check["status"] == "failed":
                raise RuntimeError(f"Replicate generation failed: {check.get('error')}")

        raise TimeoutError("Replicate generation timed out.")


class MockDevImageAdapter(BaseImageAdapter):
    """
    Procedural graphic design renderer using Pillow.
    Ensures that when testing or when API keys are not supplied yet,
    the application returns a high-res (1024x1024) PNG graphic with transparent
    background, rich typography, geometric badge, and artistic palettes.
    """

    def generate_artwork(self, prompt, reference_image_url=None):
        width, height = 1024, 1024
        # Create transparent canvas (RGBA)
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Palette selection
        palettes = [
            ("#f97316", "#ef4444", "#fbbf24"),  # Sunset Orange / Amber
            ("#06b6d4", "#3b82f6", "#8b5cf6"),  # Neon Cyber / Blue
            ("#10b981", "#14b8a6", "#84cc16"),  # Emerald Green
            ("#ec4899", "#d946ef", "#f43f5e"),  # Vaporwave Pink
        ]
        color1, color2, color3 = random.choice(palettes)

        # Draw artistic circular emblem with layered rings
        cx, cy, radius = 512, 450, 280
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color1, width=8)
        draw.ellipse([cx - (radius - 30), cy - (radius - 30), cx + (radius - 30), cy + (radius - 30)], outline=color2, width=4)

        # Draw decorative celestial / geometric stars inside
        draw.polygon([(cx, cy - 140), (cx + 35, cy - 35), (cx + 140, cy), (cx + 35, cy + 35), (cx, cy + 140), (cx - 35, cy + 35), (cx - 140, cy), (cx - 35, cy - 35)], fill=color3)

        # Draw dynamic banner ribbons
        draw.rectangle([150, 750, 874, 880], fill=color1)
        draw.rectangle([160, 760, 864, 870], outline="#ffffff", width=3)

        # Clean prompt words for badge
        words = [w.strip().upper() for w in prompt.split() if len(w) > 2]
        title_text = " ".join(words[:4]) if words else "CUSTOM ART"
        subtitle_text = "ORIGINAL AI EDITION • 300 DPI"

        # Text rendering
        draw.text((cx, 800), title_text[:24], fill="#ffffff", anchor="mm", font_size=36)
        draw.text((cx, 840), subtitle_text, fill="#ffffff", anchor="mm", font_size=16)

        # Top arched title
        draw.text((cx, 120), "CUSTOMCOLLECTION", fill=color2, anchor="mm", font_size=28)

        # Save to PNG bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_bytes = buf.getvalue()

        return {
            "image_bytes": image_bytes,
            "provider": "dev_mock",
            "model": "procedural-badge-v1",
            "width": width,
            "height": height,
        }


# ==============================================================================
# FALLBACK PIPELINE CONTROLLER
# ==============================================================================

class AIServicePipeline:
    """
    Executes prompt preparation and image generation across registered
    fallback providers until success.
    """

    def __init__(self):
        # Text LLM Fallback Chain
        self.text_adapters = [
            GeminiTextAdapter(),
            OpenAITextAdapter(),
            AnthropicTextAdapter(),
            MockDevTextAdapter(),
        ]

        # Text-to-Image Fallback Chain
        self.image_adapters = [
            OpenAIDallEAdapter(),
            StabilityImageAdapter(),
            ReplicateImageAdapter(),
            MockDevImageAdapter(),
        ]

    def execute_text_generation(self, user_prompt, conversation_history, reference_image_url=None):
        errors = []
        for adapter in self.text_adapters:
            try:
                res = adapter.prepare_design_prompt(user_prompt, conversation_history, reference_image_url)
                logger.info(f"Text prompt prepared via provider: {res['provider']} ({res['model']})")
                return res
            except Exception as e:
                logger.warning(f"Text adapter {adapter.__class__.__name__} failed: {e}")
                errors.append(f"{adapter.__class__.__name__}: {str(e)}")

        raise RuntimeError(f"All text LLM providers failed: {'; '.join(errors)}")

    def execute_image_generation(self, prompt, reference_image_url=None):
        errors = []
        for adapter in self.image_adapters:
            try:
                res = adapter.generate_artwork(prompt, reference_image_url)
                logger.info(f"Image generated via provider: {res['provider']} ({res['model']})")
                return res
            except Exception as e:
                logger.warning(f"Image adapter {adapter.__class__.__name__} failed: {e}")
                errors.append(f"{adapter.__class__.__name__}: {str(e)}")

        raise RuntimeError(f"All image generation providers failed: {'; '.join(errors)}")
