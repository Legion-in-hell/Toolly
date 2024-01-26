const express = require("express");
const argon2 = require("argon2");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const fetch = require("node-fetch");
const authenticator = require("js-google-authenticator");
const csurf = require("csurf");
const helmet = require("helmet");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://toolly.fr",
      "http://localhost:3000",
      "https://localhost:5173",
    ],
  })
);
app.use(csurf());
app.use(helmet.hidePoweredBy());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const getGoogleAuthenticatorSecret = (username) => {
  const secret_key = authenticator.createSecret();
  const code = authenticator.getCode(secret_key);

  db.query(
    "UPDATE users SET google_authenticator_secret = ? WHERE username = ?",
    [secret_key, username],
    (err) => {
      if (err) {
        console.error("Error updating Google Authenticator secret:", err);
        return null;
      }
    }
  );
  return secret_key;
};

const validateGoogleAuthenticatorCode = (username, code) => {
  const secret = getGoogleAuthenticatorSecret(username);
  return authenticator.checkCode(secret, code);
};

app.post(
  "/api/signup/google-authenticator",
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
            return res.status(500).send("Erreur serveur");
          }
          const secretKey = getGoogleAuthenticatorSecret(req.body.username);
          const qrCodeUrl = authenticator.getQRCode(
            secretKey,
            req.body.username
          );
          const registerGoogleSignUp = authenticator.forApp(
            qrCodeUrl,
            secretKey
          );
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    } catch {
      res.status(500).send("Erreur serveur");
    }
  }
);

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL");
});

app.post("/api/password-reset-request", (req, res) => {
  const { pseudo } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [pseudo],
    (err, results) => {
      if (err) {
        return res.status(500).send("Error checking username");
      }

      if (results.length === 0) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      app.post("/api/password-reset", async (req, res) => {
        const { pseudo, googleAuthCode, newPassword } = req.body;

        const validGoogleAuthCode = validateGoogleAuthenticatorCode(
          pseudo,
          googleAuthCode
        );

        if (!validGoogleAuthCode) {
          return res.status(400).send("Code Google Authenticator invalide");
        }

        const hashedPassword = await argon2.hash(newPassword, {
          type: argon2.argon2id,
        });

        db.query(
          "UPDATE users SET password = ? WHERE username = ?",
          [hashedPassword, pseudo],
          (err) => {
            if (err) {
              return res.status(500).send("Error updating password");
            }

            res.status(200).send("Mot de passe réinitialisé avec succès");
          }
        );
      });
    }
  );
});

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

app.get("/api/user/exists", (req, res) => {
  const { username } = req.query;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Error checking username");
      res.json({ exists: results.length > 0 });
    }
  );
});

app.get("/api/user/exists", (req, res) => {
  const { username } = req.query;

  const apiUrl = `/api/user/exists?username=${username}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error checking username:", error);
      res.status(500).send("Error checking username");
    });
});

app.use("/api/user/exists", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.delete("/api/folders/:folderId", authenticateToken, (req, res) => {
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

app.post("/api/todos", authenticateToken, (req, res) => {
  const { title, description, deadline, link } = req.body;
  const userId = req.user.userId;

  const query =
    "INSERT INTO todos (title, description, deadline, link1, user_id) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [title, description, deadline, link, userId],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout de la tâche :", err);
        return res.status(500).send("Erreur lors de l'ajout de la tâche");
      }
      res
        .status(201)
        .json({ id: result.insertId, title, description, deadline, link });
    }
  );
});

app.get("/api/todos", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.query(
    "SELECT * FROM todos WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des tâches :", err);
        return res
          .status(500)
          .send("Erreur lors de la récupération des tâches");
      }
      res.json(results);
    }
  );
});

app.put("/api/todos/:todoId", authenticateToken, (req, res) => {
  const { todoId } = req.params;
  const { title, description, deadline, link } = req.body;

  const query =
    "UPDATE todos SET title = ?, description = ?, deadline = ?, link1 = ? WHERE id = ? AND user_id = ?";
  db.query(
    query,
    [title, description, deadline, link, todoId, req.user.userId],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de la tâche :", err);
        return res
          .status(500)
          .send("Erreur lors de la mise à jour de la tâche");
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .send("Tâche non trouvée ou vous n'avez pas le droit de la modifier");
      }
      res.send("Tâche mise à jour avec succès");
    }
  );
});

app.delete("/api/todos/:todoId", authenticateToken, (req, res) => {
  const { todoId } = req.params;

  db.query(
    "DELETE FROM todos WHERE id = ? AND user_id = ?",
    [todoId, req.user.userId],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression de la tâche :", err);
        return res
          .status(500)
          .send("Erreur lors de la suppression de la tâche");
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .send(
            "Tâche non trouvée ou vous n'avez pas le droit de la supprimer"
          );
      }
      res.send("Tâche supprimée avec succès");
    }
  );
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

app.post("/api/postits", authenticateToken, (req, res) => {
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

app.get("/api/postits/:folderId", authenticateToken, (req, res) => {
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

app.put("/api/postits/:id", authenticateToken, (req, res) => {
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

app.delete("/api/postits/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM postits WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting post-it");
    res.send("Post-it deleted successfully");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
