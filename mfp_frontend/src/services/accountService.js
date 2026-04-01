import api from "./api";

const ACCOUNTS_CACHE_KEY = "social_accounts_cache";
const ACCOUNTS_CACHE_TS_KEY = "social_accounts_cache_ts";
const ACCOUNTS_TTL_MS = 2 * 60 * 1000;

export const getCachedSocialList = () => {
  if (typeof window === "undefined") {
    return { data: null, fresh: false };
  }

  try {
    const raw =
      window.sessionStorage.getItem(ACCOUNTS_CACHE_KEY) ||
      window.localStorage.getItem(ACCOUNTS_CACHE_KEY);
    const ts = Number(
      window.sessionStorage.getItem(ACCOUNTS_CACHE_TS_KEY) ||
        window.localStorage.getItem(ACCOUNTS_CACHE_TS_KEY) ||
        0
    );
    const data = raw ? JSON.parse(raw) : null;
    return {
      data,
      fresh: Boolean(data) && Date.now() - ts < ACCOUNTS_TTL_MS,
    };
  } catch (error) {
    return { data: null, fresh: false };
  }
};

export const cacheSocialList = (data) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(data));
    window.sessionStorage.setItem(ACCOUNTS_CACHE_TS_KEY, String(Date.now()));
    window.localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(data));
    window.localStorage.setItem(ACCOUNTS_CACHE_TS_KEY, String(Date.now()));
  } catch (error) {
  }
};

export const clearSocialListCache = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(ACCOUNTS_CACHE_KEY);
    window.sessionStorage.removeItem(ACCOUNTS_CACHE_TS_KEY);
    window.localStorage.removeItem(ACCOUNTS_CACHE_KEY);
    window.localStorage.removeItem(ACCOUNTS_CACHE_TS_KEY);
  } catch (error) {
  }
};

// List connected social accounts
export const socialList = () => {
  return api.get("/social/", { params: { t: Date.now() } });
};


export const metaConnect = async () => {
  const response = await api.get("/social/meta/connect/");
  return response.data;
};


export const linkedinConnect = async () => {
  const response = await api.get("/social/linkedin/connect/");
  return response.data;
};


export const youtubeConnect = async () => {
  const response = await api.get("/social/youtube/connect/");
  return response.data;
};

export const refreshAccount = (id) =>
  api.post(`/social/accounts/${id}/refresh/`);

export const disconnectAccount = (id) =>
  api.post(`/social/accounts/${id}/disconnect/`).then((response) => {
    clearSocialListCache();
    return response;
  });
