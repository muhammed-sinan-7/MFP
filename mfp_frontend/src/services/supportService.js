import API from "./api";

export const createPublicSupportTicket = (data) =>
  API.post("/support/public/", data);

export const listSupportTickets = () =>
  API.get("/support/tickets/");

export const createSupportTicket = (data) =>
  API.post("/support/tickets/", data);
