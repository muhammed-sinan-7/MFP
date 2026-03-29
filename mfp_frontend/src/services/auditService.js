// import axios from "@/lib/axios";
import api from "./api";

export const fetchAuditLogs = async (params = {}) => {
  const response = await api.get("audit/logs/", { params });
  return response.data;
};