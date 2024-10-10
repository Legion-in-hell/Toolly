const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const { body, param, validationResult } = require("express-validator");
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
    console.log("Connexion à la base de données réussie pour les postits");
  } catch (e) {
    console.error(
      "Erreur lors de la connexion à la base de données pour les postits",
      e
    );
    process.exit(1);
  }
};

initDB();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};

router.post(
  "/api/postits",
  authenticateToken,
  body("text").trim().notEmpty().withMessage("Le texte est requis"),
  body("x").isNumeric().withMessage("La position X doit être un nombre"),
  body("y").isNumeric().withMessage("La position Y doit être un nombre"),
  body("folderId").isInt().withMessage("L'ID du dossier doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, x, y, folderId } = req.body;
    const userId = req.user.userId;

    try {
      const [result] = await db.execute(
        "INSERT INTO postits (text, x, y, folder_id, user_id) VALUES (?, ?, ?, ?, ?)",
        [text, x, y, folderId, userId]
      );
      res
        .status(201)
        .json({ id: result.insertId, text, x, y, folderId, userId });
    } catch (err) {
      console.error("Error creating post-it:", err);
      res.status(500).json({ error: "Erreur lors de la création du post-it" });
    }
  }
);

router.get(
  "/api/postits/:folderId",
  authenticateToken,
  param("folderId").isInt().withMessage("L'ID du dossier doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const userId = req.user.userId;

    try {
      const [results] = await db.execute(
        "SELECT * FROM postits WHERE folder_id = ? AND user_id = ?",
        [folderId, userId]
      );
      res.json(results);
    } catch (err) {
      console.error("Error fetching post-its:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des post-its" });
    }
  }
);

router.put(
  "/api/postits/:id",
  authenticateToken,
  param("id").isInt().withMessage("L'ID du post-it doit être un entier"),
  body("text").trim().notEmpty().withMessage("Le texte est requis"),
  body("x").isNumeric().withMessage("La position X doit être un nombre"),
  body("y").isNumeric().withMessage("La position Y doit être un nombre"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { text, x, y } = req.body;
    const userId = req.user.userId;

    try {
      const [result] = await db.execute(
        "UPDATE postits SET text = ?, x = ?, y = ? WHERE id = ? AND user_id = ?",
        [text, x, y, id, userId]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Post-it non trouvé ou non autorisé" });
      }
      res.json({ message: "Post-it mis à jour avec succès" });
    } catch (err) {
      console.error("Error updating post-it:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour du post-it" });
    }
  }
);

router.delete(
  "/api/postits/:id",
  authenticateToken,
  param("id").isInt().withMessage("L'ID du post-it doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const [result] = await db.execute(
        "DELETE FROM postits WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Post-it non trouvé ou non autorisé" });
      }
      res.json({ message: "Post-it supprimé avec succès" });
    } catch (err) {
      console.error("Error deleting post-it:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression du post-it" });
    }
  }
);

module.exports = router;
