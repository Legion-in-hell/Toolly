import axios from 'axios';

function fetchItems() {
  axios.get('http://localhost:3001/api/items')
    .then(response => {
      console.log(response.data);
      // Traiter les données reçues
    })
    .catch(error => {
      console.error('Il y a eu une erreur!', error);
    });
}
