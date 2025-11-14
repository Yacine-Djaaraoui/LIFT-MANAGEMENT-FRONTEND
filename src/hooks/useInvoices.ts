import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoice,
  createInvoiceLine,
  updateInvoiceLine,
  deleteInvoiceLine,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/api/invoices";

export const useInvoices = (
  {
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
  } = {},
  options?: any
) => {
  return useQuery({
    queryKey: [
      "invoices",
      {
        ordering,
        search,
        page_size,
        page,
        project,
        status,
      },
    ],
    queryFn: () =>
      fetchInvoices({
        ordering,
        search,
        page_size,
        page,
        project,
        status,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["invoice-lines", variables.id],
      });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};


export const useCreateInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) =>
      createInvoiceLine(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["invoice-lines", variables.invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice", variables.invoiceId],
      });
    },
  });
};

export const useUpdateInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      lineId,
      data,
    }: {
      invoiceId: string;
      lineId: string;
      data: any;
    }) => updateInvoiceLine(invoiceId, lineId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["invoice-lines", variables.invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice-line", variables.invoiceId, variables.lineId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice", variables.invoiceId],
      });
    },
  });
};

export const useDeleteInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      lineId,
    }: {
      invoiceId: string;
      lineId: string;
    }) => deleteInvoiceLine(invoiceId, lineId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["invoice-lines", variables.invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice", variables.invoiceId],
      });
    },
  });
};
