import { useMutation, useQuery } from "@tanstack/react-query";
import { login, getCurrentUser } from "@/api/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => login({ username, password }),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
