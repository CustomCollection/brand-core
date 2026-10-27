"""
Fulfillment models for the CustomCollection Design Engine.

Responsible for:
- Provider configuration and credentials (Qikink client ID, secrets, sandbox toggle).
- Cached provider access tokens with expiration tracking.
- Fulfillment orders submitted to external print-on-demand providers (e.g. Qikink).
- Payload snapshot and external provider order ID mapping (`order_id`, `number`).
- Provider status synchronization logs and webhook/polling events.
- Strict separation between payment status and provider fulfillment status.
"""

from apps.common.models import TimeStampedModel

# Models will be added in Phase 5
