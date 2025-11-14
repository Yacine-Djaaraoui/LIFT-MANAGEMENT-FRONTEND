import { ApiClient } from "@/utils/httpClient";

const httpclient = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  type: "project_start" | "project_end" | "maintenance";
  project_id: number;
  project_name: string;
  client_name: string;
  client_address: {
    province: string;
    city: string;
    postal_code: string;
  };
  status: "DRAFT" | "UPCOMING" | "ACTIVE" | "COMPLETED";
  is_verified: boolean;
}

export interface CalendarResponse {
  user_role: string;
  user_name: string;
  total_events: number;
  applied_filters: Record<string, any>;
  events: CalendarEvent[];
}

export interface CalendarFilters {
  event_type?: "project_start" | "project_end" | "maintenance" | "all";
  project_name?: string;
  client_name?: string;
  start_date?: string;
  end_date?: string;
  status?: "DRAFT" | "UPCOMING" | "ACTIVE" | "COMPLETED";
  is_verified?: boolean;
  is_overdue?: boolean;
  province?: string;
  city?: string;
  postal_code?: string;
}

export const fetchCalendarEvents = async (filters: CalendarFilters = {}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  // Add filters to params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await httpclient.get(`my-calendar/?${params.toString()}`, {
    headers,
  });
  return response;
};
