import api from "./api";

export const getNews = (page = 1) => {
  return api.get(`/news/industry/?page=${page}`);
};

export const getNewsSummary = (id) => {
  return API.get(`/news/${id}/summary/`);
};