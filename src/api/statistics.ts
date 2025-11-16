import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchFinancialAnalytics = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`dashboard/financial-analytics/`, {
    headers,
  });
  return response;
};

export const fetchInventoryAnalytics = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`dashboard/inventory-analytics/`, {
    headers,
  });
  return response;
};

export const fetchProjectsAnalytics = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`dashboard/projects-analytics/`, {
    headers,
  });
  return response;
};

export const fetchRecentActivity = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`dashboard/recent-activity/`, { headers });
  return response;
};

export const fetchDashboardSummary = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`dashboard/summary/`, { headers });
  return response;
};
