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
  console.log("Connexion à la base de données réussie pour les dossiers");
} catch (e) {
  console.log(
    "Erreur lors de la connexion à la base de données pour les dossiers"
  );
  console.log(e);
}

router.post("/api/newfolders", authenticateToken, (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;
  const id = Math.floor(Math.random() * 1000000);

  db.query(
    "INSERT INTO folders (name, user_id, id) VALUES (?, ?, ?)",
    [name, userId, id],
    (err, result) => {
      if (err) return res.status(500).send("Error creating folder");
      res.status(201).send({ id: result.insertId, name });
    }
  );
});

router.get("/api/folders", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM folders WHERE user_id = ?",
    [req.user.userId],
    (err, results) => {
      if (err) return res.status(500).send("Error fetching folders");
      res.json(results);
    }
  );
});

router.put("/api/folders/:folderId", authenticateToken, (req, res) => {
  const { newName } = req.body;
  const { folderId } = req.params;

  db.query(
    "UPDATE folders SET name = ? WHERE id = ?",
    [newName, folderId],
    (err, result) => {
      if (err) return res.status(500).send("Error updating folder");
      if (result.affectedRows === 0)
        return res.status(404).send("Folder not found");
      res.send("Folder renamed successfully");
    }
  );
});

router.delete("/api/folders/:folderId", authenticateToken, (req, res) => {
  const { folderId } = req.params;

  db.beginTransaction((err) => {
    if (err) return res.status(500).send("Error starting transaction");

    db.query(
      "DELETE FROM postits WHERE folder_id = ?",
      [folderId],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send("Error deleting post-its");
          });
        }

        db.query(
          "DELETE FROM folders WHERE id = ?",
          [folderId],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).send("Error deleting folder");
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).send("Error committing transaction");
                });
              }
              res.send("Folder and associated post-its deleted successfully");
            });
          }
        );
      }
    );
  });
});

module.exports = router;
