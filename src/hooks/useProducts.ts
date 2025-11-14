import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/products";

export const useProducts = (
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
      "products",
      {
        ordering,
        search,
        page_size,
        page,
      },
    ],
    queryFn: () =>
      fetchProducts({
        ordering,
        search,
        page_size,
        page,
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
