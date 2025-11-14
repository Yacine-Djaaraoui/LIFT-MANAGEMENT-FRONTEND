import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import Cookies from "js-cookie";
// import { apiClientTranslations } from "@/locales/apiClientTranslations";

// Set default Axios configuration
axios.defaults.headers.post["Content-Type"] = "application/json";

// Define the configuration type
interface ApiClientConfig extends AxiosRequestConfig {
  baseURL?: string;
  withCredentials?: boolean;
}

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post("/api/jwt/refresh/", {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem("access_token", access); // Store the new access token
    return access;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }
};

// const getTranslations = () => {
//   const language = Cookies.get("i18next") || "fr"; // Default to Arabic if no language is set
//   return apiClientTranslations[language];
// };

// Define the ApiClient function
function ApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const client: AxiosInstance = axios.create({ ...config });
  // Override the 'get' method to handle query params
  const originalGet = client.get;

  client.get = (
    url: string,
    params?: Record<string, string | number>
  ): Promise<AxiosResponse> => {
    let response: Promise<AxiosResponse>;
    if (params) {
      const queryParams = new URLSearchParams(params as Record<string, string>);
      response = originalGet(url, { params: queryParams });
    } else {
      response = originalGet(url, params);
    }
    return response;
  };

  // Add a 'create' method for making POST requests
  client.create = (url: string, data: any): Promise<AxiosResponse> => {
    return axios.post(url, data);
  };

  // Add an 'update' method for making PATCH requests
  client.update = (url: string, data: any): Promise<AxiosResponse> => {
    return axios.patch(url, data);
  };

  // Request interceptor to add the Authorization header
  client.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data ? response.data : response;
    },
    async (error: AxiosError) => {
      if (error?.response) {
        const statusCode = error.response?.status;
        const message = error?.response?.data?.detail;
        const originalRequest = error.config;

        if (statusCode === 401) {
          if (
            !localStorage.getItem("refresh_token") &&
            !localStorage.getItem("access_token") &&
            message === "Authentication credentials were not provided."
          ) {
            return Promise.reject(translations.loginRequired);
          } else if (
            originalRequest &&
            !originalRequest._retry &&
            message === "Given token not valid for any token type" &&
            localStorage.getItem("refresh_token")
          ) {
            originalRequest._retry = true;

            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return client(originalRequest);
            } else {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
              return Promise.reject(message);
            }
          } else {
            if (message) return Promise.reject(message);
            else return Promise.reject(error?.response?.data);
          }
        } else if (statusCode >= 500) {
          return Promise.reject(translations.serverError);
        } else if (statusCode == 404) {
          return Promise.reject("ForBidden Request");
        } else {
          if (message) return Promise.reject(message);
          else return Promise.reject(error?.response?.data);
        }
      } else if (error?.request) {
        return Promise.reject(translations.noInternetConnection);
      } else {
        return Promise.reject("An unknown error occurred");
      }
    }
  );

  return client;
}

export { ApiClient };
