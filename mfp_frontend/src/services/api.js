import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const REQUEST_TIMEOUT_MS = 15000;

const PUBLIC_ENDPOINTS = [
  "/auth/register/",
  "/auth/login/",
  "/auth/verify-email-otp/",
  "/auth/request-password-reset/",
  "/auth/reset-password/",
  "/auth/token/refresh/",
  "/industries/",
  "/support/public/",
];

const normalizeRequestPath = (url = "") => {
  if (!url) return "";

  try {
    const base =
      API_BASE ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost");
    return new URL(url, base).pathname;
  } catch {
    return String(url).split("?")[0];
  }
};

const isPublicEndpoint = (url = "") => {
  const path = normalizeRequestPath(url);
  return PUBLIC_ENDPOINTS.some(
    (publicUrl) => path === publicUrl || path.endsWith(publicUrl),
  );
};

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

const ACCESS_TOKEN_STORAGE_KEY = "auth:access_token";
const ACCESS_TOKEN_STORAGE_MODE_KEY = "auth:access_token_mode";

const getAccessTokenPersistenceMode = () => {
  if (typeof window === "undefined") {
    return "session";
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_MODE_KEY) || "session";
  } catch {
    return "session";
  }
};

const getTokenStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const mode = getAccessTokenPersistenceMode();
    return mode === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return window.sessionStorage;
  }
};

const loadPersistedAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storage = getTokenStorage();
    return storage?.getItem(ACCESS_TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

let accessToken = loadPersistedAccessToken();
let isRefreshing = false;
let refreshSubscribers = [];
let refreshInFlightPromise = null;
const AUTH_EVENT_KEY = "auth:event";

const broadcastAuthEvent = (type) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("auth:event", { detail: { type } }));

  try {
    window.localStorage.setItem(
      AUTH_EVENT_KEY,
      JSON.stringify({ type, ts: Date.now() }),
    );
  } catch {
    return;
  }
};


const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};


const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};


const onRefreshFailed = () => {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
  broadcastAuthEvent("logout");
};

export const setAccessToken = (token, options = {}) => {
  accessToken = token;

  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      const persist = Boolean(options.persist);
      const targetStorage = persist ? window.localStorage : window.sessionStorage;
      const otherStorage = persist ? window.sessionStorage : window.localStorage;

      targetStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(
        ACCESS_TOKEN_STORAGE_MODE_KEY,
        persist ? "local" : "session",
      );
      otherStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      return;
    }

    window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_MODE_KEY);
  } catch {
    return;
  }
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  setAccessToken(null);
};

export const clearAuthStorage = () => {
  clearAccessToken();
};

export const refreshAccessToken = async () => {
  if (refreshInFlightPromise) {
    return refreshInFlightPromise;
  }

  const persist = getAccessTokenPersistenceMode() === "local";
  refreshInFlightPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/token/refresh/`,
        {},
        { withCredentials: true, timeout: REQUEST_TIMEOUT_MS },
      );

      const newAccessToken = response.data.access;
      setAccessToken(newAccessToken, { persist });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearAccessToken();
        return null;
      }

      throw error;
    } finally {
      refreshInFlightPromise = null;
    }
  })();

  return refreshInFlightPromise;
};



API.interceptors.request.use((config) => {
  const isPublic = isPublicEndpoint(config.url);

  if (accessToken && !isPublic) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});



API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    
    if (
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/token/refresh/") ||
      isPublicEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(API(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const hadAccessToken = Boolean(accessToken);
      const refreshPayload = await refreshAccessToken();
      const newAccessToken = refreshPayload?.access;
      if (!newAccessToken) {
        clearAuthStorage();
        if (hadAccessToken) {
          onRefreshFailed();
        } else {
          refreshSubscribers.forEach((callback) => callback(null));
          refreshSubscribers = [];
        }
        return Promise.reject(error);
      }

      onRefreshed(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);

        } catch (refreshError) {
      const shouldForceLogout = refreshError?.response?.status === 401;

      if (shouldForceLogout) {
        const hadAccessToken = Boolean(accessToken);
        clearAuthStorage();

        if (hadAccessToken) {
          onRefreshFailed();
        } else {
          refreshSubscribers.forEach((callback) => callback(null));
          refreshSubscribers = [];
        }
      } else {
        refreshSubscribers.forEach((callback) => callback(null));
        refreshSubscribers = [];
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);



export async function logoutUser() {
  try {
    await API.post("/auth/logout/");
  } catch {
    return;
  } finally {
    clearAuthStorage();
    broadcastAuthEvent("logout");
    window.location.href = "/login";
  }
}

export default API;

