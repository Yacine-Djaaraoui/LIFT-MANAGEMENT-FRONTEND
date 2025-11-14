import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchProducts = async ({
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

  const response = await client.get(`stock/products/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchProduct = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`stock/products/${id}/`, { headers });
  return response;
};

export const createProduct = async ({
  name,
  sku,
  quantity,
  unit,
  reorder_threshold,
  buying_price,
  selling_price,
}: {
  name: string;
  sku?: string;
  quantity?: number;
  unit?: string;
  reorder_threshold?: number;
  buying_price?: number;
  selling_price?: number;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `stock/products/`,
    {
      name,
      sku,
      quantity,
      unit,
      reorder_threshold,
      buying_price,
      selling_price,
    },
    { headers }
  );
  return response;
};

export const updateProduct = async (
  id: string,
  {
    name,
    sku,
    quantity,
    unit,
    reorder_threshold,
    buying_price,
    selling_price,
  }: {
    name?: string;
    sku?: string;
    quantity?: number;
    unit?: string;
    reorder_threshold?: number;
    buying_price?: number;
    selling_price?: number;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `stock/products/${id}/`,
    {
      name,
      sku,
      quantity,
      unit,
      reorder_threshold,
      buying_price,
      selling_price,
    },
    { headers }
  );
  return response;
};

export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`stock/products/${id}/`, { headers });
  return response;
};
