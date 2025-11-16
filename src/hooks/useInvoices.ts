import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoice,
  createInvoiceLines,
  updateInvoiceLine,
  deleteInvoiceLine,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "@/api/invoices";
import { data } from "react-router-dom";

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

export const useCreateInvoiceLines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceLines,
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
// Add this to your existing /hooks/useInvoices.ts file

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "issue" | "mark_paid" | "revert_to_draft";
    }) => updateInvoiceStatus(id, { action }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
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
