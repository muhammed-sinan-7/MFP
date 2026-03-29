import api from "./api";

export const aiService = {
  generatePost: async ({ history, platform, tone, audience }) => {
  return api.post("/ai/generate-post/", {
    history,
    platform,
    tone,
    audience,
  });
},
}