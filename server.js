const express = require("express");
const argon2 = require("argon2");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.post(
  "/api/signup",
  body("username").isLength({ min: 5 }),
  body("password").isLength({ min: 5 }),
  body("email").isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = await argon2.hash(req.body.password, {
        type: argon2.argon2id,
      });
      db.query(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        [req.body.username, hashedPassword, req.body.email],
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

app.post("/api/login", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [req.body.username],
    async (error, results) => {
      if (error) {
        res.status(500).send("Erreur serveur");
      } else if (results.length > 0) {
        const validPassword = await argon2.verify(
          results[0].password,
          req.body.password
        );
        if (validPassword) {
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

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get("/protected", authenticateToken, (req, res) => {
  res.send(
    `Bienvenue ${req.user.username}, vous avez accès à la route protégée.`
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
