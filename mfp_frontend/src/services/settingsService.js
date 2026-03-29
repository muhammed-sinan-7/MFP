import API from "./api";

const SETTINGS_TTL_MS = 60 * 1000;
let settingsCache = null;
let settingsCacheTime = 0;
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
    return res;
  });

export const getIndustries = () =>
  API.get("industries/");
