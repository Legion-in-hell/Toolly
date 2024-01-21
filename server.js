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

// Middleware d'authentification
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

// Route de création de dossier
app.post("/api/newfolders", authenticateToken, (req, res) => {
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

// Route de récupération des dossiers
app.get("/api/folders", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM folders WHERE user_id = ?",
    [req.user.userId],
    (err, results) => {
      if (err) return res.status(500).send("Error fetching folders");
      res.json(results);
    }
  );
});

// Route de mise à jour de dossier
app.put("/api/folders/:folderId", authenticateToken, (req, res) => {
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

// Route de suppression de dossier
app.delete("/api/folders/:folderId", authenticateToken, (req, res) => {
  const { folderId } = req.params;

  db.query("DELETE FROM folders WHERE id = ?", [folderId], (err, result) => {
    if (err) return res.status(500).send("Error deleting folder");
    if (result.affectedRows === 0)
      return res.status(404).send("Folder not found");
    res.send("Folder deleted successfully");
  });
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
            { userId: results[0].id },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
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
