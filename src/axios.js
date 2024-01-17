import axios from "axios";

async function fetchItems() {
  try {
    const response = await axios.get("http://localhost:3001/api/items");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Il y a eu une erreur!", error);
    throw error;
  }
}

export default fetchItems;
