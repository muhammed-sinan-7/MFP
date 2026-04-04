
import API from "./api";

const listRequestCache = new Map();
const LIST_CACHE_TTL_MS = 5000;
const POST_CREATE_TIMEOUT_MS = 5 * 60 * 1000;

const buildCacheKey = (path, params) =>
  JSON.stringify({
    path,
    params: Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    ),
  });

const invalidateListRequestCache = () => {
  listRequestCache.clear();
};

export const createPost = (data) => {
  return API.post("/posts/create/", data, {
    timeout: POST_CREATE_TIMEOUT_MS,
  }).then((response) => {
    invalidateListRequestCache();
    return response;
  });
};

export const getPosts = (page = 1, filters = {}, pageSize = 20) => {
  const params = {
    page,
    page_size: pageSize,
    ...filters,
  };

  const cacheKey = buildCacheKey("/posts/", params);
  const now = Date.now();
  const cached = listRequestCache.get(cacheKey);

  if (cached && now - cached.createdAt < LIST_CACHE_TTL_MS) {
    return cached.promise;
  }

  const request = API.get("/posts/", { params }).finally(() => {
    const latest = listRequestCache.get(cacheKey);
    if (latest && latest.promise === request) {
      latest.createdAt = Date.now();
    }
  });

  listRequestCache.set(cacheKey, {
    createdAt: now,
    promise: request,
  });

  return request;
};


export const getPostDetail = (postId) => {
  return API.get(`/posts/${postId}/`);
};


export const updatePost = (postId, data) => {
  return API.patch(`/posts/${postId}/edit/`, data).then((response) => {
    invalidateListRequestCache();
    return response;
  });
};


export const deletePost = (postId) => {
  return API.delete(`/posts/${postId}/delete/`).then((response) => {
    invalidateListRequestCache();
    return response;
  });
};

export const restorePost = (postId) => {
  return API.post(`/posts/${postId}/restore/`).then((response) => {
    invalidateListRequestCache();
    return response;
  });
};

export const permanentlyDeletePost = (postId) => {
  return API.delete(`/posts/${postId}/permanent-delete/`).then((response) => {
    invalidateListRequestCache();
    return response;
  });
};

export const emptyRecycleBin = () => {
  return API.delete("/posts/recycle-bin/empty/").then((response) => {
    invalidateListRequestCache();
    return response;
  });
};

export const getRecycleBinPosts = () => {
  return API.get("/posts/recycle-bin/");
};


export const getSocialAccounts = () => {
  return API.get("/social-accounts/");
};


export const getPublishingTargets = (page = 1, pageSize = 100) => {
  return API.get("/social/publishing-targets/", {
    params: { page, page_size: pageSize },
  });
};

