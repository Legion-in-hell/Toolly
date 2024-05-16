const express = require("express");
const argon2 = require("argon2");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const multer = require("multer");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet.hidePoweredBy());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    done(err, results[0]);
  });
});

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Route de connexion (login)
app.post(
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

app.post(
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

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL");
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

app.post(
  "/api/todos",
  authenticateToken,
  upload.single("file"),
  body("Title")
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 255 })
    .withMessage("Le titre ne doit pas dépasser 255 caractères"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Title, Description, Deadline, Link1, folderId } = req.body;
    const userId = req.user.userId;
    const file = req.file;
    let fileName = null;
    let fileData = null;
    if (file) {
      fileName = file.originalname;
      fileData = file.buffer;
    }

    const query =
      "INSERT INTO Todos (Title, Description, Deadline, Link1, UserID, file_name, file_data, folderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [
        Title,
        Description,
        Deadline,
        Link1,
        userId,
        fileName,
        fileData,
        folderId,
      ],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'ajout de la tâche :", err);
          return res
            .status(500)
            .json({ error: "Erreur lors de l'ajout de la tâche" });
        }
        res.status(201).json({
          id: result.insertId,
          Title,
          Description,
          Deadline,
          Link1,
          fileName: fileName,
        });
      }
    );
  }
);

app.get("/api/todos", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.query("SELECT * FROM Todos WHERE UserID = ?", [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tâches :", err);
      return res.status(500).send("Erreur lors de la récupération des tâches");
    }
    res.json(results);
  });
});

app.put(
  "/api/todos/:todoId",
  authenticateToken,
  upload.single("file"),
  body("Title")
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 255 })
    .withMessage("Le titre ne doit pas dépasser 255 caractères"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { todoId } = req.params;
    const { Title, Description, Deadline, Link1 } = req.body;
    const userId = req.user.userId;
    const file = req.file;
    let fileName = null;
    let fileData = null;
    if (file) {
      fileName = file.originalname;
      fileData = file.buffer;
    }

    const query =
      "UPDATE Todos SET Title = ?, Description = ?, Deadline = ?, Link1 = ?, file_name = ?, file_data = ? WHERE TodoID = ? AND UserID = ?";
    db.query(
      query,
      [Title, Description, Deadline, Link1, fileName, fileData, todoId, userId],
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
            .send(
              "Tâche non trouvée ou vous n'avez pas le droit de la modifier"
            );
        }
        res.send("Tâche mise à jour avec succès");
      }
    );
  }
);

app.delete("/api/todos/:todoId", authenticateToken, (req, res) => {
  const { todoId } = req.params;
  const userId = req.user.userId;

  db.query(
    "DELETE FROM Todos WHERE TodoID = ? AND UserID = ?",
    [todoId, userId],
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
  // Validation des champs avec express-validator
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
