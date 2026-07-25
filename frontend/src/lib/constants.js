/**
 * Application-wide constants.
 */

export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'CustomCollection';

export const GUEST_CART_KEY = 'cc_guest_cart';
export const GUEST_CART_ID_KEY = 'cc_guest_cart_id';

export const ITEMS_PER_PAGE = 12;

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_CHARGE = 99;

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  printing: { label: 'Printing', color: 'info' },
  packed: { label: 'Packed', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  returned: { label: 'Returned', color: 'error' },
};

export const ORDER_STATUS_STEPS = [
  'pending',
  'confirmed',
  'printing',
  'packed',
  'shipped',
  'delivered',
];

export const SORT_OPTIONS = [
  { label: 'Newest', value: '-created_at' },
  { label: 'Oldest', value: 'created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Name A–Z', value: 'name' },
];

export const PAYMENT_METHODS = {
  razorpay: 'razorpay',
  cod: 'cod',
};

export const TOAST_DURATION = 4000;

export const IMAGE_DOMAINS = ['res.cloudinary.com', 'images.unsplash.com'];
