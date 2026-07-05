export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    VERIFY_EMAIL: '/auth/verify-email/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    CHANGE_PASSWORD: '/auth/change-password/',
    REFRESH_TOKEN: '/auth/token/refresh/',
    PROFILE: '/accounts/profile/',
    ADDRESSES: '/accounts/addresses/',
  },
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (slug) => `/products/${slug}/`,
    REVIEWS: (slug) => `/products/${slug}/reviews/`,
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
    ITEM: (id) => `/cart/${id}/`,
  },
  WISHLIST: {
    BASE: '/wishlist/',
    ITEM: (id) => `/wishlist/${id}/`,
  },
  ORDERS: {
    LIST: '/orders/',
    DETAIL: (orderNumber) => `/orders/${orderNumber}/`,
  },
  CHECKOUT: '/checkout/',
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order/',
    VERIFY: '/payments/verify/',
  },
  CMS: {
    HOMEPAGE: '/cms/homepage/',
    SITE_CONFIG: '/cms/site-config/',
  },
  SEARCH: '/search/',
};
