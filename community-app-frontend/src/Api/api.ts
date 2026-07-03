import axios from "axios";
import i18n from "../component/Language";
import { envs } from "../helper/envs";

export const apiBaseUrl =
  envs.VITE_API_URL || "https://snehmilan-api.weenggs.in";

const getToken = () => {
  return (
    localStorage.getItem("authToken") ||
    new URL(window.location.href).searchParams.get("token") ||
    ""
  );
};

export const apiInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["x-access-token"] = token;
    }
    config.headers["Accept-Language"] = i18n.language || "en";
    return config;
  },
  (error) => Promise.reject(error)
);

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const apiOnlyData = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

authAPI.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-access-token"] = token;
  }
  config.headers["Accept-Language"] = i18n.language || "en";
  return config;
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-access-token"] = token;
    }
    config.headers["Accept-Language"] = i18n.language || "en";
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

apiOnlyData.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-access-token"] = token;
    }
    config.headers["Accept-Language"] = i18n.language || "en";
    return config;
  },
  (error) => Promise.reject(error)
);

apiOnlyData.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
