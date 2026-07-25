/**
 * Shared utility functions.
 */

/**
 * Format a price value as Indian Rupees.
 * @param {string|number} value
 * @returns {string} e.g. "₹1,499"
 */
export function formatPrice(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a date string to a human-readable format.
 * @param {string} dateString
 * @returns {string} e.g. "July 22, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string to a short format.
 * @param {string} dateString
 * @returns {string} e.g. "22 Jul 2026"
 */
export function formatDateShort(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Merge Tailwind class names, filtering falsy values.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text to a maximum length.
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Debounce a function.
 */
export function debounce(fn, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Build a query string from an object, omitting null/undefined/empty values.
 */
export function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

/**
 * Generate a unique ID for guest carts.
 */
export function generateGuestCartId() {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Slugify a string.
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Get discount percentage between original and discounted price.
 */
export function getDiscountPercentage(originalPrice, discountPrice) {
  if (!discountPrice || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}
