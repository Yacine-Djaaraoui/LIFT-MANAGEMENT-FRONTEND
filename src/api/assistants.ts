import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchAssistants = async ({
  ordering,
  search,
  page_size,
  page,
}: {
  ordering?: string;
  search?: string;
  page_size?: string;
  page?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (ordering) params.append("ordering", ordering);
  if (search) params.append("search", search);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);

  const response = await client.get(`assistants/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchAssistant = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`assistants/${id}/`, { headers });
  return response;
};

export const createAssistant = async ({
  username,
  email,
  phone_number,
  password,
  first_name,
  last_name,
  wilaya,
}: {
  username: string;
  email?: string;
  phone_number?: string;
  password: string;
  first_name?: string;
  last_name?: string;
  wilaya?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `assistants/`,
    {
      username,
      email,
      phone_number,
      password,
      first_name,
      last_name,
      wilaya,
    },
    { headers }
  );
  return response;
};

export const updateAssistant = async (
  id: string,
  {
    username,
    email,
    phone_number,
    first_name,
    last_name,
    wilaya,
  }: {
    username?: string;
    email?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    wilaya?: string;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `assistants/${id}/`,
    {
      username,
      email,
      phone_number,
      first_name,
      last_name,
      wilaya,
    },
    { headers }
  );
  return response;
};

export const deleteAssistant = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`assistants/${id}/`, { headers });
  return response;
};
