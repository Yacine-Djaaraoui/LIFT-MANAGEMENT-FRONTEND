import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmployers,
  fetchEmployer,
  createEmployer,
  updateEmployer,
  deleteEmployer,
} from "@/api/employers";

export const useEmployers = (
  {
    ordering,
    search,
    page_size,
    page,
    group,
  }: {
    ordering?: string;
    search?: string;
    page_size?: string;
    page?: string;
    group?: string;
  } = {},
  options?: any
) => {
  return useQuery({
    queryKey: [
      "employers",
      {
        ordering,
        search,
        page_size,
        page,
        group,
      },
    ],
    queryFn: () =>
      fetchEmployers({
        ordering,
        search,
        page_size,
        page,
        group,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useEmployer = (id: string) => {
  return useQuery({
    queryKey: ["employer", id],
    queryFn: () => fetchEmployer(id),
    enabled: !!id,
  });
};

export const useCreateEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
    },
  });
};

export const useUpdateEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      updateEmployer(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["employer", variables.id] });
    },
  });
};

export const useDeleteEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
    },
  });
};
