import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchInvoiceLines = async ({
  ordering,
  page_size,
  page,
  invoice,
}: {
  ordering?: string;
  page_size?: string;
  page?: string;
  invoice?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (ordering) params.append("ordering", ordering);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);
  if (invoice) params.append("invoice", invoice);

  const response = await client.get(`invoice_lines/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const createInvoiceLine = async ({
  invoice,
  product,
  description,
  quantity,
  unit_price,
  discount,
}: {
  invoice: string;
  product?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `invoice_lines/`,
    {
      invoice,
      product,
      description,
      quantity,
      unit_price,
      discount,
    },
    { headers }
  );
  return response;
};

export const updateInvoiceLine = async (
  id: string,
  {
    product,
    description,
    quantity,
    unit_price,
    discount,
  }: {
    product?: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    discount?: number;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `invoice_lines/${id}/`,
    {
      product,
      description,
      quantity,
      unit_price,
      discount,
    },
    { headers }
  );
  return response;
};

export const deleteInvoiceLine = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`invoice_lines/${id}/`, { headers });
  return response;
};
