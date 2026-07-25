/**
 * All backend API endpoint constants.
 * Base URL comes from NEXT_PUBLIC_API_URL env var (default: http://localhost:8000/api/v1)
 *
 * Backend URL patterns (from config/urls.py + accounts/urls.py):
 *   /api/v1/accounts/auth/register/
 *   /api/v1/accounts/auth/login/
 *   /api/v1/accounts/auth/logout/
 *   /api/v1/accounts/auth/token/refresh/
 *   /api/v1/accounts/auth/verify-email/
 *   /api/v1/accounts/auth/forgot-password/
 *   /api/v1/accounts/auth/reset-password/
 *   /api/v1/accounts/auth/change-password/
 *   /api/v1/accounts/profile/
 *   /api/v1/accounts/addresses/
 *   /api/v1/accounts/addresses/<id>/
 *   /api/v1/products/
 *   /api/v1/products/<slug>/
 *   /api/v1/products/sizes/
 *   /api/v1/products/colors/
 *   /api/v1/collections/
 *   /api/v1/collections/<slug>/
 *   /api/v1/tags/
 *   /api/v1/cart/
 *   /api/v1/cart/add/
 *   /api/v1/cart/items/<id>/
 *   /api/v1/cart/merge/
 *   /api/v1/orders/checkout/
 *   /api/v1/orders/
 *   /api/v1/orders/<order_number>/
 *   /api/v1/payments/create-order/
 *   /api/v1/payments/verify/
 *   /api/v1/reviews/products/<slug>/
 *   /api/v1/reviews/products/<slug>/create/
 *   /api/v1/wishlist/
 *   /api/v1/wishlist/<id>/
 *   /api/v1/cms/site-config/
 *   /api/v1/cms/homepage/
 *   /api/v1/search/
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/accounts/auth/register/',
    LOGIN: '/accounts/auth/login/',
    LOGOUT: '/accounts/auth/logout/',
    VERIFY_EMAIL: '/accounts/auth/verify-email/',
    FORGOT_PASSWORD: '/accounts/auth/forgot-password/',
    RESET_PASSWORD: '/accounts/auth/reset-password/',
    CHANGE_PASSWORD: '/accounts/auth/change-password/',
    REFRESH_TOKEN: '/accounts/auth/token/refresh/',
    PROFILE: '/accounts/profile/',
    ADDRESSES: '/accounts/addresses/',
    ADDRESS: (id) => `/accounts/addresses/${id}/`,
  },
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (slug) => `/products/${slug}/`,
    SIZES: '/products/sizes/',
    COLORS: '/products/colors/',
  },
  COLLECTIONS: {
    LIST: '/collections/',
    DETAIL: (slug) => `/collections/${slug}/`,
  },
  TAGS: {
    LIST: '/tags/',
  },
  CART: {
    BASE: '/cart/',
    ADD: '/cart/add/',
    ITEM: (id) => `/cart/items/${id}/`,
    MERGE: '/cart/merge/',
  },
  WISHLIST: {
    BASE: '/wishlist/',
    ITEM: (id) => `/wishlist/${id}/`,
  },
  ORDERS: {
    CHECKOUT: '/orders/checkout/',
    LIST: '/orders/',
    DETAIL: (orderNumber) => `/orders/${orderNumber}/`,
  },
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order/',
    VERIFY: '/payments/verify/',
  },
  REVIEWS: {
    LIST: (slug) => `/reviews/products/${slug}/`,
    CREATE: (slug) => `/reviews/products/${slug}/create/`,
  },
  CMS: {
    HOMEPAGE: '/cms/homepage/',
    SITE_CONFIG: '/cms/site-config/',
  },
  SEARCH: '/search/',
};
