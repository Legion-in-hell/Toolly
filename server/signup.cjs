const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const argon2 = require("argon2");
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
  console.log("Connexion à la base de données réussie pour les inscriptions");
} catch (e) {
  console.log(
    "Erreur lors de la connexion à la base de données pour les inscriptions"
  );
  console.log(e);
}

router.post(
  "/api/signup",
  body("username")
    .isLength({ min: 5 })
    .withMessage("Le nom d'utilisateur doit contenir au moins 5 caractères")
    .custom(async (value) => {
      try {
        const userExists = await checkUsernameExists(value);
        if (userExists) {
          return Promise.reject("Ce nom d'utilisateur existe déjà");
        }
      } catch (error) {
        return Promise.reject(
          "Erreur lors de la vérification du nom d'utilisateur"
        );
      }
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir au moins une lettre majuscule")
    .matches(/[0-9]/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Le mot de passe doit contenir au moins un caractère spécial"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password, googleAuthSecret } = req.body;

      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
      });

      db.query(
        "INSERT INTO users (username, password, secret_2fa, is_2fa_enabled) VALUES (?, ?, ?, ?)",
        [
          username,
          hashedPassword,
          googleAuthSecret,
          googleAuthSecret ? true : false,
        ],
        (error, results) => {
          if (error) {
            if (error.code === "ER_DUP_ENTRY") {
              return res
                .status(400)
                .json({ error: "Ce nom d'utilisateur existe déjà" });
            } else {
              console.error(
                "Erreur lors de l'inscription de l'utilisateur:",
                error
              );
              return res
                .status(500)
                .json({ error: "Erreur serveur lors de l'inscription" });
            }
          } else {
            res.status(201).send("Utilisateur enregistré avec succès");
          }
        }
      );
    } catch (error) {
      console.error("Erreur serveur lors du hachage du mot de passe :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

async function checkUsernameExists(username) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) as count FROM users WHERE username = ?",
      [username],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count > 0);
      }
    );
  });
}

module.exports = router;
