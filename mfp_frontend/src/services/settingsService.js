import API from "./api";

const SETTINGS_TTL_MS = 5 * 60 * 1000;
const SETTINGS_CACHE_KEY = "org_settings_cache";
const SETTINGS_CACHE_TS_KEY = "org_settings_cache_ts";

const loadPersistedSettings = () => {
  if (typeof window === "undefined") {
    return { data: null, ts: 0 };
  }

  try {
    const raw = window.sessionStorage.getItem(SETTINGS_CACHE_KEY);
    const ts = Number(window.sessionStorage.getItem(SETTINGS_CACHE_TS_KEY) || 0);
    return {
      data: raw ? JSON.parse(raw) : null,
      ts,
    };
  } catch (error) {
    return { data: null, ts: 0 };
  }
};

const persistSettings = (data) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data));
    window.sessionStorage.setItem(SETTINGS_CACHE_TS_KEY, String(Date.now()));
  } catch (error) {
  }
};

const persisted = loadPersistedSettings();
let settingsCache = persisted.data;
let settingsCacheTime = persisted.ts;
let settingsInFlight = null;

export const getOrgSettings = () =>
  (async () => {
    const now = Date.now();

    if (settingsCache && now - settingsCacheTime < SETTINGS_TTL_MS) {
      return { data: settingsCache };
    }

    if (settingsInFlight) {
      return settingsInFlight;
    }

    settingsInFlight = API.get("organizations/settings/")
      .then((res) => {
        settingsCache = res.data;
        settingsCacheTime = Date.now();
        persistSettings(res.data);
        return res;
      })
      .finally(() => {
        settingsInFlight = null;
      });

    return settingsInFlight;
  })();

export const updateOrgSettings = (data) =>
  API.patch("organizations/settings/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => {
    settingsCache = res.data;
    settingsCacheTime = Date.now();
    persistSettings(res.data);
    return res;
  });

export const getIndustries = () =>
  API.get("industries/");
