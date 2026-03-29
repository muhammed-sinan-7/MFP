import API from "./api";

export const getOverview = (platform) =>
  API.get("/analytics/overview/", {
    params: { platform }
  });

export const getEngagementChart = (platform) =>
  API.get("/analytics/engagement-chart/", {
    params: { platform }
  });

export const getPlatformStats = () =>
  API.get("/analytics/platform-performance/");

export const getTopPosts = () =>
  API.get("/analytics/top-posts/");


export const getEngagementDistribution  =() =>{
  return API.get('/analytics/engagement-distribution/')
}

export const getRecentPosts = () =>{
  return API.get('analytics/recent-posts/')
}

export const getInstagramOverview = () =>
  API.get("/analytics/instagram/overview/");

export const getInstagramGrowth = () =>
  API.get("/analytics/instagram/growth/");

export const getInstagramTopPosts = () =>
  API.get("/analytics/instagram/top-posts/");

// export const getInstagramGallery = () =>
//   API.get("/analytics/instagram/gallery/");

export const getInstagramPerformance = () =>
  API.get("/analytics/instagram/performance/");




export const getLinkedinOverview = () =>
  API.get("/analytics/linkedin/overview/");

export const getLinkedinGrowth = () =>
  API.get("/analytics/linkedin/growth/");

export const getLinkedinPosts = () =>
  API.get("/analytics/linkedin/posts/");


export const getYoutubeOverview = () =>
  API.get("/analytics/youtube/overview/");

export const getYoutubeGrowth = () =>
  API.get("/analytics/youtube/growth/");

export const getYoutubeVideos = () =>
  API.get("/analytics/youtube/videos/");

export const getYouTubeTrafficSources = () =>
  API.get("/analytics/youtube/traffic-sources/");