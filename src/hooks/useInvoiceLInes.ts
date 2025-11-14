import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoiceLines,
  createInvoiceLine,
  updateInvoiceLine,
  deleteInvoiceLine,
} from "@/api/invoiceLines";

// export const useInvoiceLines = (
//   {
//     ordering,
//     page_size,
//     page,
//     invoice,
//   }: {
//     ordering?: string;
//     page_size?: string;
//     page?: string;
//     invoice?: string;
//   } = {},
//   options?: any
// ) => {
//   return useQuery({
//     queryKey: [
//       "invoiceLines",
//       {
//         ordering,
//         page_size,
//         page,
//         invoice,
//       },
//     ],
//     queryFn: () =>
//       fetchInvoiceLines({
//         ordering,
//         page_size,
//         page,
//         invoice,
//       }),
//     staleTime: 1000 * 60 * 5,
//     ...options,
//   });
// };

export const useCreateInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoiceLine,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoiceLines"] });
      queryClient.invalidateQueries({
        queryKey: ["invoice", variables.invoice],
      });
    },
  });
};

export const useUpdateInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateInvoiceLine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoiceLines"] });
    },
  });
};

export const useDeleteInvoiceLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoiceLine,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoiceLines"] });
    },
  });
};
