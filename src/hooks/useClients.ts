import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  deleteClient,
} from "@/api/clients";

export const useClients = (
  {
    ordering,
    search,
    page_size,
    page,
  }: {
    ordering?: string;
    search?: string;
    page_size?: string;
    page?: string;
  } = {},
  options?: any
) => {
  return useQuery({
    queryKey: [
      "clients",
      {
        ordering,
        search,
        page_size,
        page,
      },
    ],
    queryFn: () =>
      fetchClients({
        ordering,
        search,
        page_size,
        page,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
