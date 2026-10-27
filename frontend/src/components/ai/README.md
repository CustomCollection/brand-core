# AI Design Workspace Components (`src/components/ai/`)

## Purpose
Interactive components for the conversational AI design studio, reference image handling, and artwork gallery.

## Planned Components (Phase 4)
- `AIChatWindow.js`: Scrollable message stream displaying user prompts, assistant design guidance, and generation progress indicators.
- `AIPromptInput.js`: Multi-line prompt input with quick suggestions, style chips, and single reference image attachment uploader.
- `GeneratedImageCard.js`: Card displaying generated artwork with metadata, zoom modal, "Use on Garment" transfer button, and delete action.
- `TokenBalanceWidget.js`: Displays user's daily free tokens (out of 5) and purchased token balance with recharge modal link.
- `TokenPurchaseModal.js`: Modal presenting token packages (e.g. 1 token for ₹20, 5 tokens for ₹70) integrated with the existing Razorpay flow.
