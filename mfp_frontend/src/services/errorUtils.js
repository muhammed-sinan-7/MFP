export function getUserFacingError(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const payload = error?.response?.data;

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (status === 400) {
    return "Please check your input and try again.";
  }

  if (status === 401) {
    return "Invalid email or password.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status === 408) {
    return "The request timed out. Please try again.";
  }

  if (status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  if (status >= 500) {
    return "Our server is having trouble right now. Please try again shortly.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (!error?.response) {
    return "Network issue detected. Please check your connection and try again.";
  }

  return fallback;
}
