/**
 * Format a price amount as Indian Rupees (₹X,XXX).
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text to a max length, appending an ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Merge CSS class names, filtering out falsy values.
 * @param  {...string} classes
 * @returns {string}
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate the discount percentage between original price and sale price.
 * @param {number} price — original price
 * @param {number} discountPrice — sale / discounted price
 * @returns {number} — discount percentage, rounded
 */
export function getDiscountPercentage(price, discountPrice) {
  if (!price || !discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay — milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

/**
 * Generate a unique guest cart ID for localStorage-based carts.
 * @returns {string}
 */
export function generateGuestCartId() {
  return 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

/**
 * Build a URL query string from an object of params.
 * Skips null / undefined values.
 * @param {Object} params
 * @returns {string}
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Slugify a string for use in URLs.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
