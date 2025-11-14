import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchClients = async ({
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

  const response = await client.get(`clients/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchClient = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`clients/${id}/`, { headers });
  return response;
};

export const createClient = async ({
  name,
  address,
  phone_number,
  fax,
  email,
  is_corporate,
  rc,
  nif,
  nis,
  ai,
  art,
  account_number,
  notes,
}: {
  name: string;
  address?: any;
  phone_number: string;
  fax?: string;
  email?: string;
  is_corporate?: boolean;
  rc?: string;
  nif?: string;
  nis?: string;
  ai?: string;
  art?: string;
  account_number?: string;
  notes?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `clients/`,
    {
      name,
      address,
      phone_number,
      fax,
      email,
      is_corporate,
      rc,
      nif,
      nis,
      ai,
      art,
      account_number,
      notes,
    },
    { headers }
  );
  return response;
};

export const updateClient = async (
  id: string,
  {
    name,
    address,
    phone_number,
    fax,
    email,
    is_corporate,
    rc,
    nif,
    nis,
    ai,
    art,
    account_number,
    notes,
  }: {
    name?: string;
    address?: any;
    phone_number?: string;
    fax?: string;
    email?: string;
    is_corporate?: boolean;
    rc?: string;
    nif?: string;
    nis?: string;
    ai?: string;
    art?: string;
    account_number?: string;
    notes?: string;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `clients/${id}/`,
    {
      name,
      address,
      phone_number,
      fax,
      email,
      is_corporate,
      rc,
      nif,
      nis,
      ai,
      art,
      account_number,
      notes,
    },
    { headers }
  );
  return response;
};

export const deleteClient = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`clients/${id}/`, { headers });
  return response;
};
