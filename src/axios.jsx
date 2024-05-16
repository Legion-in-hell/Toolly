import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "Erreur serveur :",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("Pas de réponse du serveur :", error.request);
    } else {
      console.error("Erreur :", error.message);
    }
    return Promise.reject(error);
  }
);

async function fetchItems() {
  try {
    const response = await api.get("/api/items");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Il y a eu une erreur!", error);
    throw error;
  }
}

export { fetchItems, api };
