import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await client.post(`jwt/create/`, {
    username,
    password,
  });
  return response;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`users/me/`, { headers });
  return response;
};
