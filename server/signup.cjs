const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const argon2 = require("argon2");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

let db;

const initDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    console.log("Connexion à la base de données réussie pour les inscriptions");
  } catch (e) {
    console.error(
      "Erreur lors de la connexion à la base de données pour les inscriptions",
      e
    );
    process.exit(1);
  }
};

initDB();

const checkUsernameExists = async (username) => {
  const [rows] = await db.execute(
    "SELECT COUNT(*) as count FROM users WHERE username = ?",
    [username]
  );
  return rows[0].count > 0;
};

router.post(
  "/api/signup",
  body("username")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Le nom d'utilisateur doit contenir au moins 5 caractères")
    .custom(async (value) => {
      const userExists = await checkUsernameExists(value);
      if (userExists) {
        throw new Error("Ce nom d'utilisateur existe déjà");
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
  body("googleAuthSecret").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password, googleAuthSecret } = req.body;

      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });

      const [result] = await db.execute(
        "INSERT INTO users (username, password, secret_2fa, is_2fa_enabled) VALUES (?, ?, ?, ?)",
        [
          username,
          hashedPassword,
          googleAuthSecret,
          googleAuthSecret ? true : false,
        ]
      );

      res
        .status(201)
        .json({
          message: "Utilisateur enregistré avec succès",
          userId: result.insertId,
        });
    } catch (error) {
      console.error("Erreur lors de l'inscription de l'utilisateur:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Ce nom d'utilisateur existe déjà" });
      }
      res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
  }
);

module.exports = router;
