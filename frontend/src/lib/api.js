import { ENDPOINTS } from '@/lib/endpoints';

const isServer = typeof window === 'undefined';
let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// When running inside Docker Next.js SSR, localhost points to the Next.js container, not the backend.
// We override it to point to the backend container.
if (isServer && BASE_URL.includes('localhost')) {
  BASE_URL = BASE_URL.replace('localhost', 'backend');
}

let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(error) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  refreshQueue = [];
}

async function refreshAccessToken() {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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

  if (cache) {
    config.cache = cache;
  }

  if (nextOptions) {
    config.next = nextOptions;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (response.status === 401 && !isRetry) {
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
    const message =
      typeof data === 'object' && data !== null
        ? data.detail || data.message || JSON.stringify(data)
        : data || `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  // Unwrap the backend's custom response envelope if present
  if (data && typeof data === 'object' && data.status === 'success' && data.data !== undefined) {
    return data.data;
  }

  return data;
}

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

export { ApiError };
export default request;
