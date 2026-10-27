/**
 * Design Engine API endpoint constants.
 * Separated from main endpoints.js to keep the design engine feature modular.
 * All paths are relative to NEXT_PUBLIC_API_URL (default: /api/v1).
 */
export const DESIGN_ENDPOINTS = {
  // Catalog & Garment Blanks (Phase 2)
  CATALOG: {
    CATEGORIES: '/catalog/categories/',
    CATEGORY_DETAIL: (slug) => `/catalog/categories/${slug}/`,
    CATEGORY_VARIANTS: (slug) => `/catalog/categories/${slug}/variants/`,
    CATEGORY_PLACEMENTS: (slug) => `/catalog/categories/${slug}/placements/`,
    PRINTING_METHODS: '/catalog/printing-methods/',
    PLACEMENTS: '/catalog/placements/',
  },

  // Fabric.js Design Editor (Phase 3)
  DESIGNER: {
    SESSIONS: '/designer/sessions/',
    SESSION_DETAIL: (id) => `/designer/sessions/${id}/`,
    SESSION_SAVE: (id) => `/designer/sessions/${id}/save/`,
    SESSION_PLACEMENTS: (id) => `/designer/sessions/${id}/placements/`,
    PLACEMENT_DETAIL: (sessionId, placement) =>
      `/designer/sessions/${sessionId}/placements/${placement}/`,
    UPLOAD_ASSET: '/designer/assets/upload/',
    PRESIGNED_URL: '/designer/assets/presigned-url/',
    VERSIONS: (sessionId) => `/designer/sessions/${sessionId}/versions/`,
    VERSION_DETAIL: (sessionId, versionId) =>
      `/designer/sessions/${sessionId}/versions/${versionId}/`,
  },

  // AI Design Studio (Phase 4)
  AI_STUDIO: {
    CHATS: '/ai-studio/chats/',
    CHAT_DETAIL: (id) => `/ai-studio/chats/${id}/`,
    MESSAGES: (chatId) => `/ai-studio/chats/${chatId}/messages/`,
    SEND_MESSAGE: (chatId) => `/ai-studio/chats/${chatId}/send/`,
    GENERATE_ARTWORK: (chatId) => `/ai-studio/chats/${chatId}/generate/`,
    ASSETS: (chatId) => `/ai-studio/chats/${chatId}/assets/`,
    TOKEN_BALANCE: '/ai-studio/tokens/balance/',
    TOKEN_PACKAGES: '/ai-studio/tokens/packages/',
    TOKEN_PURCHASE: '/ai-studio/tokens/purchase/',
  },

  // Fulfillment & Tracking (Phase 5)
  FULFILLMENT: {
    SUBMIT_ORDER: '/fulfillment/submit/',
    ORDER_STATUS: (orderId) => `/fulfillment/orders/${orderId}/status/`,
  },
};
