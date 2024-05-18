import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    let csrfToken = null;

    const cookieMatch = document.cookie.match(new RegExp("(^| )_csrf=([^;]+)"));
    if (cookieMatch) {
      csrfToken = cookieMatch[2];
    }

    if (!csrfToken) {
      csrfToken = localStorage.getItem("csrfToken");
    }

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  } catch (error) {
    console.error("Erreur lors de la récupération du jeton CSRF :", error);
    return Promise.reject(error);
  }
});

export { api };
