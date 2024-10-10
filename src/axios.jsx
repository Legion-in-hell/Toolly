import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      let csrfToken =
        document.cookie.match(new RegExp("(^| )_csrf=([^;]+)"))?.[2] ||
        localStorage.getItem("csrfToken");

      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }

      const token = localStorage.getItem("JWT_TOKEN");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized, clear token and redirect to login
          localStorage.removeItem("JWT_TOKEN");
          window.location.replace("/login");
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden:", error.response.data);
          break;
        case 500:
          // Server error
          console.error("Server error:", error.response.data);
          break;
        default:
          console.error("API error:", error.response.data);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export { api };
