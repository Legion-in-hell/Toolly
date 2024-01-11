const express = require('express');
const connection = require('./db');
const app = express();
require('dotenv').config();


app.use(express.json());

// Exemple d'une route GET
app.get('/api/items', (req, res) => {
  // Logique pour récupérer des données de la base de données
});


app.listen(3001, () => {
  console.log('Serveur démarré sur le port 3001');
});
