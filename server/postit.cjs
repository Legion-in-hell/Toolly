const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
let db;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

try {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  db.connect();
  console.log("Connexion à la base de données réussie pour les postits");
} catch (e) {
  console.log(
    "Erreur lors de la connexion à la base de données pour les postits"
  );
  console.log(e);
}

router.post("/api/postits", authenticateToken, (req, res) => {
  const { text, x, y, folderId } = req.body;
  const userId = req.user.userId;

  const query =
    "INSERT INTO postits (text, x, y, folder_id, user_id) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [text, x, y, folderId, userId], (err, result) => {
    if (err) {
      return res.status(500).send("Error creating post-it");
    }
    res.status(201).send({ id: result.insertId, text, x, y, folderId, userId });
  });
});

router.get("/api/postits/:folderId", authenticateToken, (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.userId;

  db.query(
    "SELECT * FROM postits WHERE folder_id = ? AND user_id = ?",
    [folderId, userId],
    (err, results) => {
      if (err) return res.status(500).send("Error fetching post-its");
      res.json(results);
    }
  );
});

router.put("/api/postits/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text, x, y } = req.body;

  db.query(
    "UPDATE postits SET text = ?, x = ?, y = ? WHERE id = ?",
    [text, x, y, id],
    (err, result) => {
      if (err) return res.status(500).send("Error updating post-it");
      res.send("Post-it updated successfully");
    }
  );
});

router.delete("/api/postits/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM postits WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting post-it");
    res.send("Post-it deleted successfully");
  });
});

module.exports = router;
