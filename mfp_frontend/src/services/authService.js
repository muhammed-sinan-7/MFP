import API from "./api";

export const registerUser = (data) =>
  API.post("auth/register/", data);


export const resendOtp = (data) => 
  API.post("auth/request-email-verification-otp/",data);

export const verifyOtp = (data) =>
  API.post("auth/verify-email-otp/", data);

export const loginUser = (data) =>
  API.post("auth/login/", data);

export const requestPasswordReset = (data) =>
  API.post("auth/request-password-reset/", data);

export const resetPassword = (data) =>
  API.post("auth/reset-password/", data);

export const createOrganization = (data) =>
  API.post("organizations/create/", data);

export const getIndustries = () =>
  API.get("industries/");
