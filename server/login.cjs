const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
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
    console.log("Connexion à la base de données réussie pour les logins");
  } catch (e) {
    console.error(
      "Erreur lors de la connexion à la base de données pour les logins",
      e
    );
    process.exit(1);
  }
};

initDB();

router.post(
  "/api/login",
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Le nom d'utilisateur est requis"),
  body("password").notEmpty().withMessage("Le mot de passe est requis"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const [users] = await db.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      if (users.length === 0) {
        return res
          .status(401)
          .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      const user = users[0];
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      if (user.secret_2fa) {
        return res.json({ requires2FA: true });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

router.post(
  "/api/login/validate-2fa",
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Le nom d'utilisateur est requis"),
  body("code").trim().notEmpty().withMessage("Le code 2FA est requis"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, code } = req.body;

    try {
      const [users] = await db.execute(
        "SELECT id, secret_2fa FROM users WHERE username = ?",
        [username]
      );
      if (users.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const user = users[0];
      const isValid = speakeasy.totp.verify({
        secret: user.secret_2fa,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (isValid) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.json({ token });
      } else {
        res.status(401).json({ error: "Code 2FA invalide" });
      }
    } catch (error) {
      console.error("Erreur lors de la validation 2FA:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

module.exports = router;
