import { ApiClient } from "@/utils/httpClient";

const httpclient = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchProjects = async ({
  ordering,
  search,
  page_size,
  page,
  client,
  is_verified,
  status,
}: {
  ordering?: string;
  search?: string;
  page_size?: string;
  page?: string;
  client?: string;
  is_verified?: boolean;
  status?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (ordering) params.append("ordering", ordering);
  if (search) params.append("search", search);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);
  if (client) params.append("client", client);
  if (is_verified !== undefined)
    params.append("is_verified", String(is_verified));
  if (status) params.append("status", status);

  const response = await httpclient.get(`projects/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchProject = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.get(`projects/${id}/`, { headers });
  return response;
};

export const createProject = async ({
  name,
  client,
  start_date,
  end_date,
  description,
  warranty_months,
  duration_maintenance,
  interval_maintenance,
  warranty_days,
  warranty_years,
  assigned_employers,
}: {
  name: string;
  duration_maintenance?: number;
  interval_maintenance?: number;
  client: string;
  start_date: string;
  end_date?: string;
  description?: string;
  warranty_months?: number;
  warranty_days?: number;
  warranty_years?: number;
  assigned_employers?: string[];
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.post(
    `projects/`,
    {
      name,
      client,
      start_date,
      end_date,
      description,
      duration_maintenance,
      interval_maintenance,
      warranty_months,
      warranty_days,
      warranty_years,
      assigned_employers,
    },
    { headers }
  );
  return response;
};

export const updateProject = async (
  id: string,
  {
    name,
    client,
    start_date,
    end_date,
    description,
    warranty_months,
    warranty_days,
    warranty_years,
    duration_maintenance,
    interval_maintenance,
    assigned_employers,
    is_verified,
  }: {
    name?: string;
    client?: string;
    start_date?: string;
    duration_maintenance?: number;
    interval_maintenance?: number;
    end_date?: string;
    description?: string;
    warranty_months?: number;
    warranty_days?: number;
    warranty_years?: number;
    assigned_employers?: string[];
    is_verified?: boolean;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.patch(
    `projects/${id}/`,
    {
      name,
      client,
      start_date,
      end_date,
      description,
      warranty_months,
      duration_maintenance,
      interval_maintenance,
      warranty_days,
      warranty_years,
      assigned_employers,
      is_verified,
    },
    { headers }
  );
  return response;
};

export const deleteProject = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.delete(`projects/${id}/`, { headers });
  return response;
};

export const verifyProject = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await httpclient.post(
    `projects/${id}/verify/`,
    {},
    { headers }
  );
  return response;
};
