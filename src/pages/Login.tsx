import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLogin } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const loginSchema = yup.object({
  username: yup.string().required("Le nom d'utilisateur est requis"),
  password: yup.string().required("Le mot de passe est requis"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export const Login: React.FC = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    setError("");
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        navigate("/statistics");
      },
      onError: (err: any) => {
        console.error("Login error:", err);

        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else if (err.response?.data) {
          // Handle Django REST framework error structure
          const errorData = err.response.data;
          if (typeof errorData === "string") {
            setError(errorData);
          } else if (errorData.non_field_errors) {
            setError(errorData.non_field_errors[0]);
          } else {
            setError("Nom d'utilisateur ou mot de passe incorrect");
          }
        } else {
          setError("Erreur de connexion au serveur");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">EURL KR7 FIBRE</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              {...register("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};
