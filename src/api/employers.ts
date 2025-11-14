import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchEmployers = async ({
  ordering,
  search,
  page_size,
  page,
  group,
}: {
  ordering?: string;
  search?: string;
  page_size?: string;
  page?: string;
  group?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (ordering) params.append("ordering", ordering);
  if (search) params.append("search", search);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);
  if (group) params.append("group", group);

  const response = await client.get(`employers/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchEmployer = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`employers/${id}/`, { headers });
  return response;
};

export const createEmployer = async ({
  username,
  email,
  phone_number,
  password,
  first_name,
  last_name,
  wilaya,
  group,
}: {
  username: string;
  email?: string;
  phone_number?: string;
  password: string;
  first_name?: string;
  last_name?: string;
  wilaya?: string;
  group?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `employers/`,
    {
      username,
      email,
      phone_number,
      password,
      first_name,
      last_name,
      wilaya,
      group,
    },
    { headers }
  );
  return response;
};

export const updateEmployer = async (
  id: string,
  {
    username,
    email,
    phone_number,
    first_name,
    last_name,
    wilaya,
    group,
  }: {
    username?: string;
    email?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    wilaya?: string;
    group?: string;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `employers/${id}/`,
    {
      username,
      email,
      phone_number,
      first_name,
      last_name,
      wilaya,
      group,
    },
    { headers }
  );
  return response;
};

export const deleteEmployer = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`employers/${id}/`, { headers });
  return response;
};
