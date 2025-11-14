import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMaintenances,
  fetchMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "@/api/maintenances";

export const useMaintenances = (
  {
    project,
    ordering,
    page_size,
    page,
  }: {
    project?: string;
    ordering?: string;
    page_size?: string;
    page?: string;
  } = {},
  options?: any
) => {
  return useQuery({
    queryKey: [
      "maintenances",
      {
        project,
        ordering,
        page_size,
        page,
      },
    ],
    queryFn: () =>
      fetchMaintenances({
        project,
        ordering,
        page_size,
        page,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useMaintenance = (id: string) => {
  return useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => fetchMaintenance(id),
    enabled: !!id,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      // Invalidate specific project maintenances
      queryClient.invalidateQueries({
        queryKey: ["maintenances", { project: variables.project.toString() }],
      });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateMaintenance(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.id.toString()],
      });

      // Invalidate specific project maintenances if project ID is available
      if (data?.project) {
        queryClient.invalidateQueries({
          queryKey: ["maintenances", { project: data.project.toString() }],
        });
      }
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      // We can't get the project ID from the delete operation, so we invalidate all
      // Alternatively, you could pass the project ID as part of the mutation
    },
  });
};
