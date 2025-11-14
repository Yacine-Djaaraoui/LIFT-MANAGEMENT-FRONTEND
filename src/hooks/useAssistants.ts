import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssistants,
  fetchAssistant,
  createAssistant,
  updateAssistant,
  deleteAssistant,
} from "@/api/assistants";

export const useAssistants = (
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
      "assistants",
      {
        ordering,
        search,
        page_size,
        page,
      },
    ],
    queryFn: () =>
      fetchAssistants({
        ordering,
        search,
        page_size,
        page,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useAssistant = (id: string) => {
  return useQuery({
    queryKey: ["assistant", id],
    queryFn: () => fetchAssistant(id),
    enabled: !!id,
  });
};

export const useCreateAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssistant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] });
    },
  });
};

export const useUpdateAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAssistant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] });
      queryClient.invalidateQueries({ queryKey: ["assistant", variables.id] });
    },
  });
};

export const useDeleteAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssistant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] });
    },
  });
};
