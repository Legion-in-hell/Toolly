import axios from "axios";

async function fetchItems() {
  try {
    const response = await axios.get("https://toolly.fr/api/items");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Il y a eu une erreur!", error);
    throw error;
  }
}

export default fetchItems;
