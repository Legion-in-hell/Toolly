const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
let db;

try {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  db.connect();
  console.log("Connexion à la base de données réussie pour les logins");
} catch (e) {
  console.log(
    "Erreur lors de la connexion à la base de données pour les logins"
  );
  console.log(e);
}

router.post(
  "/api/login",
  body("username")
    .isLength({ min: 5 })
    .withMessage("Le nom d'utilisateur doit contenir au moins 5 caractères"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) return res.status(500).json({ error: "Erreur serveur" });
        if (results.length === 0)
          return res
            .status(401)
            .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });

        const user = results[0];
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid)
          return res
            .status(401)
            .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });

        if (user.secret_2fa) {
          return res.json({ requires2FA: true });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.json({ token });
      }
    );
  }
);

router.post(
  "/api/login/validate-2fa",
  body("code").notEmpty().withMessage("Le code 2FA est requis"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, code } = req.body;

    db.query(
      "SELECT secret_2fa FROM users WHERE username = ?",
      [username],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        if (results.length === 0)
          return res.status(404).json({ error: "Utilisateur non trouvé" });

        const userSecret = results[0].secret_2fa;

        const isValid = speakeasy.totp.verify({
          secret: userSecret,
          encoding: "base32",
          token: code,
          window: 1,
        });

        if (isValid) {
          const token = jwt.sign(
            { userId: results[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.json({ token });
        } else {
          res.status(401).json({ error: "Code 2FA invalide" });
        }
      }
    );
  }
);

module.exports = router;
