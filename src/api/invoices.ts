import { ApiClient } from "@/utils/httpClient";

const client = ApiClient({
  baseURL: "/api/",
  withCredentials: false,
});

export const fetchInvoices = async ({
  ordering,
  search,
  page_size,
  page,
  project,
  status,
}: {
  ordering?: string;
  search?: string;
  page_size?: string;
  page?: string;
  project?: string;
  status?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();

  if (ordering) params.append("ordering", ordering);
  if (search) params.append("search", search);
  if (page_size) params.append("page_size", page_size);
  if (page) params.append("page", page);
  if (project) params.append("project", project);
  if (status) params.append("status", status);

  const response = await client.get(`invoices/?${params.toString()}`, {
    headers,
  });
  return response;
};

export const fetchInvoice = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.get(`invoices/${id}/`, { headers });
  return response;
};

export const createInvoiceLine = async (
  invoiceId: string,
  {
    product,
    description,
    quantity,
    unit_price,
    discount,
  }: {
    product: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `invoices/${invoiceId}/lines/`,
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

export const updateInvoiceLine = async (
  invoiceId: string,
  lineId: string,
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
    `invoices/${invoiceId}/lines/${lineId}/`,
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

export const deleteInvoiceLine = async (invoiceId: string, lineId: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(
    `invoices/${invoiceId}/lines/${lineId}/`,
    { headers }
  );
  return response;
};

export const createInvoice = async ({
  project,
  bon_de_commande,
  bon_de_versement,
  bon_de_reception,
  facture,
  due_date,
  deposit_price,
  status,
  tva,
  lines,
}: {
  project: string;
  bon_de_commande?: string;
  bon_de_versement?: string;
  bon_de_reception?: string;
  facture?: string;
  due_date?: string;
  deposit_price?: number;
  tva?: number;
  status?: string;
  lines?: Array<{
    product: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }>;
}) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.post(
    `invoices/`,
    {
      project,
      bon_de_commande,
      bon_de_versement,
      bon_de_reception,
      facture,
      due_date,
      deposit_price,
      status,
      tva,
      lines,
    },
    { headers }
  );
  return response;
};

export const updateInvoice = async (
  id: string,
  {
    bon_de_commande,
    bon_de_versement,
    bon_de_reception,
    facture,
    due_date,
    deposit_price,
    status,
    tva,
    lines,
  }: {
    bon_de_commande?: string;
    bon_de_versement?: string;
    bon_de_reception?: string;
    facture?: string;
    due_date?: string;
    deposit_price?: number;
    tva?: number;

    status?: string;
    lines?: Array<{
      product: string;
      description?: string;
      quantity: number;
      unit_price: number;
      discount?: number;
    }>;
  }
) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.patch(
    `invoices/${id}/`,
    {
      bon_de_commande,
      bon_de_versement,
      bon_de_reception,
      facture,
      due_date,
      tva,
      deposit_price,
      status,
      lines,
    },
    { headers }
  );
  return response;
};

export const deleteInvoice = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await client.delete(`invoices/${id}/`, { headers });
  return response;
};
