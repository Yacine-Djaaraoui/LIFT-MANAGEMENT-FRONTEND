import { ApiClient } from "@/utils/httpClient";

const httpclient = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export interface Maintenance {
  id?: number;
  project_name: string;
  is_overdue: boolean;
  days_until_maintenance: number;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  maintenance_number: number;
  project: number;
}

export const fetchMaintenances = async ({
  project,
  ordering,
  page_size,
  page,
}: {
  project?: string;
  ordering?: string;
  page_size?: string;
  page?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (project) params.append("project", project);
  if (ordering) params.append("ordering", ordering);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);

  const response = await httpclient.get(`maintenances/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchMaintenance = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.get(`maintenances/${id}/`, { headers });
  return response;
};

export const createMaintenance = async ({
  start_date,
  end_date,
  project,
}: {
  start_date: string;
  end_date: string;
  project: number;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.post(
    `maintenances/`,
    {
      start_date,
      end_date,
      project,
    },
    { headers }
  );
  return response;
};

export const updateMaintenance = async (
  id: number,
  {
    start_date,
    end_date,
    project,
  }: {
    start_date?: string;
    end_date?: string;
    project?: number;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.patch(
    `maintenances/${id}/`,
    {
      start_date,
      end_date,
      project,
    },
    { headers }
  );
  return response;
};

export const deleteMaintenance = async (id: number) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.delete(`maintenances/${id}/`, { headers });
  return response;
};
