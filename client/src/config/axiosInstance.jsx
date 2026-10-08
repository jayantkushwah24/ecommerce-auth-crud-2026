import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken;
let refreshRequest;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = undefined;
};

const refreshAccessToken = () => {
  if (!refreshRequest) {
    refreshRequest = axiosInstance
      .post("/auth/refresh-token")
      .then(({ data }) => {
        if (!data?.accessToken) {
          throw new Error("Refresh response did not include an access token");
        }
        accessToken = data.accessToken;
        return accessToken;
      })
      .catch((error) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshRequest = undefined;
      });
  }

  return refreshRequest;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const requestPath = config.url || "";
    const isPublicAuthRequest = /^\/auth\/(login|register|refresh-token)(?:\/|$)/.test(
      requestPath,
    );
    const isPublicProductListRequest =
      config.method?.toLowerCase() === "get" &&
      /^\/products(?:\/|$)/.test(requestPath);

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    if (!isPublicAuthRequest && !isPublicProductListRequest) {
      const token = accessToken || (await refreshAccessToken());
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes(
      "/auth/refresh-token",
    );

    if (
      error.response?.status !== 401 ||
      error.response?.data?.code !== "TOKEN_EXPIRED" ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
