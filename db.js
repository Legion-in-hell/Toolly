const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'votre_utilisateur',
  password: 'votre_mot_de_passe',
  database: 'nom_de_la_base_de_données'
});

module.exports = connection;
