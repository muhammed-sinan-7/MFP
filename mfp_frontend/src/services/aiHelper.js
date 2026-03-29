export const getPlatformTone = (platform) => {
  switch (platform) {
    case "linkedin":
      return "professional";
    case "instagram":
      return "casual";
    case "youtube":
      return "educational";
    default:
      return "neutral";
  }
};