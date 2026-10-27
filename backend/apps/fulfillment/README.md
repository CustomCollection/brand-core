# Fulfillment App — CustomCollection Design Engine

## Responsibility
The `fulfillment` app encapsulates all communication with third-party print-on-demand fulfillment providers, beginning with **Qikink**. It ensures that our internal store remains provider-independent by abstracting provider APIs behind an adapter interface.

## Provider Independence & Adapter Pattern
- Provider-specific payloads, endpoints, token negotiation, and response shapes live entirely within provider adapters (e.g. `QikinkAdapter`).
- Core ordering and payment business logic (`apps.orders`, `apps.payments`) never calls provider APIs directly.
- Provider errors or network outages never cancel completed customer payments.

## Qikink API Specification Summary (08-25)
- **Environments**: Sandbox (`https://sandbox.qikink.com/`), Live (`https://api.qikink.com/`).
- **Auth**: `POST /api/token` using `ClientId` and `client_secret` (returns `Accesstoken`, `expires_in: 3600`).
- **Rate Limit**: 60 requests per 60 seconds.
- **Create Order**: `POST /api/order/create`
  - Required headers: `ClientId`, `Accesstoken`, `Content-Type: application/json`.
  - Required fields: `order_number` (<=15 chars, alphanumeric + `_`), `qikink_shipping: 1`, `gateway` (`COD` or `Prepaid`), `total_order_value`, `line_items[]`, `shipping_address`.
  - Design fields: `design_code` (<=20 chars), `width_inches`, `height_inches`, `placement_sku` (`fr`, `bk`, `lp`, `rp`, `rs`, `ls`), `design_link` (<=512 chars), `mockup_link` (<=512 chars).
  - Print types: DTG (1) max 16x20 inches, DTF (17) max 18x20 inches.
- **Order Tracking**: `GET /api/order/list?order_reference_no=<number>`.

## Key Planned Models (Phase 5)
1. `FulfillmentProvider`: Registered providers (Qikink, etc.) with active status, sandbox mode flag, credentials reference.
2. `ProviderAuthToken`: Cached bearer token with `expires_at` timestamp.
3. `FulfillmentOrder`: Internal tracking row linking `orders.Order` to external provider reference (`qikink_order_id`, `provider_number`), tracking status (`pending_submission`, `submitted`, `accepted`, `in_production`, `shipped`, `delivered`, `failed`), and request/response audit logs.
