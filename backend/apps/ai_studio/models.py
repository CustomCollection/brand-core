"""
AI Design Workspace models for the CustomCollection Design Engine.

Responsible for:
- AI conversations / chat sessions.
- Multi-turn message history (user messages, system instructions, assistant responses).
- Single reference image attachment per generation cycle.
- Generated artwork assets stored in Amazon S3.
- Token credit system: 5 daily free tokens per user, purchase tracking, admin-configurable pricing.
- Async generation job tracking with retry logic and error state capture.
"""

from apps.common.models import TimeStampedModel

# Models will be added in Phase 4
