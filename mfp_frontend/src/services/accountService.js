import api from "./api";

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
  api.post(`/social/accounts/${id}/disconnect/`);
