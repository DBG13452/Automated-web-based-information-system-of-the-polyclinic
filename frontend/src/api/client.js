const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const REQUEST_TIMEOUT_MS = 10000;
const AUTH_TOKEN_STORAGE_KEY = "clinic_auth_token";

function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
}

export function setAuthToken(token) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function parseJsonResponse(response) {
  if (!response.ok) {
    let message = "Request failed";

    try {
      const json = await response.json();
      message = json.detail || JSON.stringify(json);
    } catch {
      message = await response.text();
    }

    const error = new Error(message || "Request failed");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  return parseJsonResponse(response);
}
