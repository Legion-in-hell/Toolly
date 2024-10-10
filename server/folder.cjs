const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
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
    console.log("Connexion à la base de données réussie pour les dossiers");
  } catch (e) {
    console.error(
      "Erreur lors de la connexion à la base de données pour les dossiers",
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
  "/api/newfolders",
  authenticateToken,
  body("name").trim().notEmpty().withMessage("Le nom du dossier est requis"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const userId = req.user.userId;
    const id = Math.floor(Math.random() * 1000000);

    try {
      const [result] = await db.execute(
        "INSERT INTO folders (name, user_id, id) VALUES (?, ?, ?)",
        [name, userId, id]
      );
      res.status(201).json({ id: result.insertId, name });
    } catch (err) {
      console.error("Error creating folder:", err);
      res.status(500).json({ error: "Erreur lors de la création du dossier" });
    }
  }
);

router.get("/api/folders", authenticateToken, async (req, res) => {
  try {
    const [results] = await db.execute(
      "SELECT * FROM folders WHERE user_id = ?",
      [req.user.userId]
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching folders:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des dossiers" });
  }
});

router.put(
  "/api/folders/:folderId",
  authenticateToken,
  body("newName")
    .trim()
    .notEmpty()
    .withMessage("Le nouveau nom du dossier est requis"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newName } = req.body;
    const { folderId } = req.params;

    try {
      const [result] = await db.execute(
        "UPDATE folders SET name = ? WHERE id = ? AND user_id = ?",
        [newName, folderId, req.user.userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Dossier non trouvé" });
      }
      res.json({ message: "Dossier renommé avec succès" });
    } catch (err) {
      console.error("Error updating folder:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour du dossier" });
    }
  }
);

router.delete("/api/folders/:folderId", authenticateToken, async (req, res) => {
  const { folderId } = req.params;

  try {
    await db.beginTransaction();

    await db.execute("DELETE FROM postits WHERE folder_id = ?", [folderId]);
    const [result] = await db.execute(
      "DELETE FROM folders WHERE id = ? AND user_id = ?",
      [folderId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      await db.rollback();
      return res.status(404).json({ error: "Dossier non trouvé" });
    }

    await db.commit();
    res.json({ message: "Dossier et post-its associés supprimés avec succès" });
  } catch (err) {
    await db.rollback();
    console.error("Error deleting folder:", err);
    res.status(500).json({ error: "Erreur lors de la suppression du dossier" });
  }
});

module.exports = router;
