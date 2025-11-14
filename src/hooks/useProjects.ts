import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  verifyProject,
} from "@/api/projects";

export const useProjects = (
  {
    ordering,
    search,
    page_size,
    page,
    client,
    is_verified,
    status,
  }: {
    ordering?: string;
    search?: string;
    page_size?: string;
    page?: string;
    client?: string;
    is_verified?: boolean;
    status?: string;
  } = {},
  options?: any
) => {
  return useQuery({
    queryKey: [
      "projects",
      {
        ordering,
        search,
        page_size,
        page,
        client,
        is_verified,
        status,
      },
    ],
    queryFn: () =>
      fetchProjects({
        ordering,
        search,
        page_size,
        page,
        client,
        is_verified,
        status,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useVerifyProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables] });
    },
  });
};
