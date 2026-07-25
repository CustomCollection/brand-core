import { ENDPOINTS } from '@/lib/endpoints';

// Determine if we are running on the server (SSR) or in the browser
const isServer = typeof window === 'undefined';

// Compute the base URL — on the server inside Docker, 'localhost' must be
// replaced with the Docker service name 'backend' for container networking.
function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  if (isServer && url.includes('localhost')) {
    return url.replace('localhost', 'backend');
  }
  return url;
}

const BASE_URL = getBaseUrl();

// ─── Refresh token queue to batch concurrent 401s ───
let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(error) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

async function refreshAccessToken() {
  const refreshUrl = isServer
    ? `${BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`
    : `${getBaseUrl()}${ENDPOINTS.AUTH.REFRESH_TOKEN}`;

  const response = await fetch(refreshUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
  return response.json();
}

// ─── Custom error class ───
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Core request function ───
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    cache,
    next: nextOptions,
    isRetry = false,
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  if (cache) config.cache = cache;
  if (nextOptions) config.next = nextOptions;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint}`;

  let response;
  try {
    response = await fetch(url, config);
  } catch (_networkError) {
    throw new ApiError(
      'Network error — please check your connection.',
      0,
      null
    );
  }

  // ─── Handle 401 with token refresh ───
  if (response.status === 401 && !isRetry && !isServer) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshAccessToken();
        isRefreshing = false;
        processRefreshQueue(null);
        return request(endpoint, { ...options, isRetry: true });
      } catch (refreshError) {
        isRefreshing = false;
        processRefreshQueue(refreshError);
        throw new ApiError('Session expired. Please log in again.', 401, null);
      }
    }

    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: () => resolve(request(endpoint, { ...options, isRetry: true })),
        reject,
      });
    });
  }

  if (response.status === 204) {
    return null;
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // Extract error from backend envelope format
    let message = `Request failed with status ${response.status}`;
    let errors = null;

    if (typeof data === 'object' && data !== null) {
      // Backend error envelope: { status: 'error', message: '...', errors: {...} }
      if (data.message) message = data.message;
      else if (data.detail) message = data.detail;
      else message = JSON.stringify(data);

      if (data.errors) errors = data.errors;
    }

    throw new ApiError(message, response.status, { message, errors, raw: data });
  }

  // ─── Unwrap backend success envelope ───
  // Backend wraps ALL success responses: { status: 'success', data: <payload>, message: null }
  if (
    data &&
    typeof data === 'object' &&
    data.status === 'success' &&
    data.data !== undefined
  ) {
    return data.data;
  }

  return data;
}

// ─── Public API helpers ───
export function apiGet(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'GET' });
}

export function apiPost(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: 'POST', body });
}

export function apiPut(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: 'PUT', body });
}

export function apiPatch(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: 'PATCH', body });
}

export function apiDelete(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'DELETE' });
}
