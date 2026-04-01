import API from "./api";

export const getAdminOverview = () => API.get("/admin-panel/overview/");

export const listAdminUsers = (params) => API.get("/admin-panel/users/", { params });
export const createAdminUser = (data) => API.post("/admin-panel/users/", data);
export const updateAdminUser = (id, data) => API.patch(`/admin-panel/users/${id}/`, data);
export const deleteAdminUser = (id) => API.delete(`/admin-panel/users/${id}/`);

export const listAdminOrganizations = (params) =>
  API.get("/admin-panel/organizations/", { params });
export const createAdminOrganization = (data) =>
  API.post("/admin-panel/organizations/", data);
export const updateAdminOrganization = (id, data) =>
  API.patch(`/admin-panel/organizations/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteAdminOrganization = (id) =>
  API.delete(`/admin-panel/organizations/${id}/`);
export const restoreAdminOrganization = (id) =>
  API.post(`/admin-panel/organizations/${id}/restore/`);

export const listAdminPosts = (params) => API.get("/admin-panel/posts/", { params });
export const updateAdminPost = (id, data) => API.patch(`/admin-panel/posts/${id}/`, data);
export const deleteAdminPost = (id) => API.delete(`/admin-panel/posts/${id}/`);
export const restoreAdminPost = (id) => API.post(`/admin-panel/posts/${id}/restore/`);

export const listAdminSocialAccounts = (params) =>
  API.get("/admin-panel/social-accounts/", { params });
export const updateAdminSocialAccount = (id, data) =>
  API.patch(`/admin-panel/social-accounts/${id}/`, data);
export const deleteAdminSocialAccount = (id) =>
  API.delete(`/admin-panel/social-accounts/${id}/`);

export const listAdminAuditLogs = (params) =>
  API.get("/admin-panel/audit-logs/", { params });
