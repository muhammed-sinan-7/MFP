
import API from "./api";



export const createPost = (data) => {
  return API.post("/posts/create/", data);
};



export const getPosts = (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page,
    ...filters
  });

  return API.get(`/posts/?${params.toString()}`);
};


export const getPostDetail = (postId) => {
  return API.get(`/posts/${postId}/`);
};


export const updatePost = (postId, data) => {
  return API.patch(`/posts/${postId}/edit/`, data);
};


export const deletePost = (postId) => {
  return API.delete(`/posts/${postId}/delete/`);
};

export const restorePost = (postId) => {
  return API.post(`/posts/${postId}/restore/`);
};

export const permanentlyDeletePost = (postId) => {
  return API.delete(`/posts/${postId}/permanent-delete/`);
};

export const emptyRecycleBin = () => {
  return API.delete("/posts/recycle-bin/empty/");
};

export const getRecycleBinPosts = () => {
  return API.get("/posts/recycle-bin/");
};


export const getSocialAccounts = () => {
  return API.get("/social-accounts/");
};


export const getPublishingTargets = (page = 1) => {
  return API.get("/social/publishing-targets/", {
    params: { page, t: Date.now() },
  });
};

