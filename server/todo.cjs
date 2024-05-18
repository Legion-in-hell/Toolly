const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer();
const dotenv = require("dotenv");
const app = express();
const helmet = require("helmet");
dotenv.config();
let db;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  app.use(express.json());
  app.use(helmet.hidePoweredBy());
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
  console.log("Connexion à la base de données réussie pour les todos");
} catch (e) {
  console.log(
    "Erreur lors de la connexion à la base de données pour les todos"
  );
  console.log(e);
}

router.post(
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

    const { Title, Description, Deadline, Link1, FolderId } = req.body;
    const userId = req.user.userId;

    const file = req.file;
    let fileName = null;
    let fileData = null;
    if (file) {
      fileName = file.originalname;
      fileData = file.buffer;
    }

    if (!FolderId) {
      return res.status(400).json({ error: "Le dossier est requis" });
    }

    const query =
      "INSERT INTO Todos (Title, Description, Deadline, Link1, UserID, file_name, file_data, FolderID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
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
        FolderId,
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

router.get("/api/todos", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.query("SELECT * FROM Todos WHERE UserID = ?", [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tâches :", err);
      return res.status(500).send("Erreur lors de la récupération des tâches");
    }
    res.json(results);
  });
});

router.put(
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

router.get("/api/todos/:folderId", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const folderId = req.params.folderId;

  db.query(
    "SELECT * FROM Todos WHERE UserID = ? AND FolderID = ?",
    [userId, folderId],
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

router.delete("/api/todos/:todoId", authenticateToken, (req, res) => {
  const { TodoID } = req.params;
  const userId = req.user.userId;

  db.query(
    "DELETE FROM Todos WHERE TodoID = ? AND UserID = ?",
    [TodoID, userId],
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

module.exports = router;
