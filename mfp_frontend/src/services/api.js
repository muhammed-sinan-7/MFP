import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

let isRefreshing = false;
let refreshSubscribers = [];


const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};


const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};


const onRefreshFailed = () => {
  refreshSubscribers = [];
};



API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  const publicEndpoints = [
    "/auth/register/",
    "/auth/login/",
    "/auth/verify-email-otp/",
    "/auth/request-password-reset/",
    "/auth/reset-password/",
    "/auth/token/refresh/",
    "/industries/",
  ];

  const isPublic = publicEndpoints.some((url) =>
    config.url?.includes(url)
  );

  if (accessToken && !isPublic) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});



API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (!error.response) {
      return Promise.reject(error);
    }

    
    if (
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes("/auth/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      logoutUser();
      return Promise.reject(error);
    }

    
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;

      
      localStorage.setItem("accessToken", newAccessToken);

   
      API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

   
      onRefreshed(newAccessToken);

      isRefreshing = false;

    
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);

    } catch (refreshError) {
      isRefreshing = false;

      // ❌ reject queued requests
      onRefreshFailed();

      logoutUser();

      return Promise.reject(refreshError);
    }
  }
);



export async function logoutUser() {
  const refresh = localStorage.getItem("refreshToken");

  try {
    if (refresh) {
      await API.post("/auth/logout/", { refresh });
    }
  } catch (err) {

  }

  localStorage.clear();
  window.location.href = "/login";
}

export default API;
