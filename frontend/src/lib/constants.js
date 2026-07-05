export const BRAND_NAME = 'CustomCollection';
export const BRAND_TAGLINE = 'Premium Fashion, Redefined';

export const GUEST_CART_KEY = 'cc_guest_cart';
export const GUEST_CART_ID_KEY = 'cc_guest_cart_id';

export const TOAST_DURATION = 3000;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COLORS = [
  { name: 'Black', hex: '#0A0A0A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Gray', hex: '#6B6B6B' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Charcoal', hex: '#36454F' },
];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const ITEMS_PER_PAGE = 12;
