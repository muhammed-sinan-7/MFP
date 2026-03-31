import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let accessToken = null;
let isRefreshing = false;
let refreshSubscribers = [];
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
  } catch (error) {
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

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const clearAuthStorage = () => {
  clearAccessToken();
};

export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/token/refresh/`,
      {},
      { withCredentials: true },
    );

    const newAccessToken = response.data.access;
    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    if (error.response?.status === 401) {
      clearAccessToken();
      return null;
    }

    throw error;
  }
};



API.interceptors.request.use((config) => {
  const publicEndpoints = [
    "/auth/register/",
    "/auth/login/",
    "/auth/verify-email-otp/",
    "/auth/request-password-reset/",
    "/auth/reset-password/",
    "/auth/token/refresh/",
    "/industries/",
  ];

  const isPublic = publicEndpoints.some((url) => config.url?.includes(url));

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
      originalRequest.url?.includes("/auth/token/refresh/")
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
      const newAccessToken = await refreshAccessToken();
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
      const hadAccessToken = Boolean(accessToken);
      clearAuthStorage();

      // ❌ reject queued requests
      if (hadAccessToken) {
        onRefreshFailed();
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
  } catch (err) {
  } finally {
    clearAuthStorage();
    broadcastAuthEvent("logout");
    window.location.href = "/login";
  }
}

export default API;
