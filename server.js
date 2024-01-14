const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Route d'inscription
app.post(
  "/signup",
  // Validation des données d'entrée
  body("username").isLength({ min: 5 }),
  body("password").isLength({ min: 5 }),

  async (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      // Insertion du nouvel utilisateur dans la base de données
      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [req.body.username, hashedPassword],
        (error, results) => {
          if (error) {
            res
              .status(500)
              .send("Erreur lors de l'inscription de l'utilisateur");
          } else {
            res.status(201).send("Utilisateur enregistré avec succès");
          }
        }
      );
    } catch {
      res.status(500).send("Erreur serveur");
    }
  }
);

// Route de connexion
app.post("/login", (req, res) => {
  // Recherche de l'utilisateur dans la base de données
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [req.body.username],
    async (error, results) => {
      if (error) {
        res.status(500).send("Erreur serveur");
      } else if (results.length > 0) {
        // Vérification du mot de passe
        const comparaison = await bcrypt.compare(
          req.body.password,
          results[0].password
        );
        if (comparaison) {
          // Création du token JWT
          const token = jwt.sign(
            { username: req.body.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.json({ token });
        } else {
          res.status(401).send("Mot de passe incorrect");
        }
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    }
  );
});

// Middleware pour authentifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route protégée
app.get("/protected", authenticateToken, (req, res) => {
  res.send(
    `Bienvenue ${req.user.username}, vous avez accès à la route protégée.`
  );
});

// Démarrage du serveur
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
