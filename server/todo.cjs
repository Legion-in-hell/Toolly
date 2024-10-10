const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer();
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
    console.log("Connexion à la base de données réussie pour les todos");
  } catch (e) {
    console.error(
      "Erreur lors de la connexion à la base de données pour les todos",
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
  "/api/todos",
  authenticateToken,
  upload.single("file"),
  body("Title")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Le titre est requis et ne doit pas dépasser 255 caractères"),
  body("Description").optional().trim(),
  body("Deadline").optional().isISO8601().toDate(),
  body("Link1")
    .optional()
    .isURL()
    .withMessage("Le lien doit être une URL valide"),
  body("FolderId").isInt().withMessage("L'ID du dossier doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Title, Description, Deadline, Link1, FolderId } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    try {
      const [result] = await db.execute(
        "INSERT INTO Todos (Title, Description, Deadline, Link1, UserID, file_name, file_data, FolderID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          Title,
          Description,
          Deadline,
          Link1,
          userId,
          file?.originalname,
          file?.buffer,
          FolderId,
        ]
      );
      res.status(201).json({
        id: result.insertId,
        Title,
        Description,
        Deadline,
        Link1,
        fileName: file?.originalname,
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout de la tâche :", err);
      res.status(500).json({ error: "Erreur lors de l'ajout de la tâche" });
    }
  }
);

router.get("/api/todos", authenticateToken, async (req, res) => {
  try {
    const [results] = await db.execute("SELECT * FROM Todos WHERE UserID = ?", [
      req.user.userId,
    ]);
    res.json(results);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des tâches" });
  }
});

router.put(
  "/api/todos/:todoId",
  authenticateToken,
  upload.single("file"),
  param("todoId").isInt().withMessage("L'ID de la tâche doit être un entier"),
  body("Title")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Le titre est requis et ne doit pas dépasser 255 caractères"),
  body("Description").optional().trim(),
  body("Deadline").optional().isISO8601().toDate(),
  body("Link1")
    .optional()
    .isURL()
    .withMessage("Le lien doit être une URL valide"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { todoId } = req.params;
    const { Title, Description, Deadline, Link1 } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    try {
      const [result] = await db.execute(
        "UPDATE Todos SET Title = ?, Description = ?, Deadline = ?, Link1 = ?, file_name = ?, file_data = ? WHERE TodoID = ? AND UserID = ?",
        [
          Title,
          Description,
          Deadline,
          Link1,
          file?.originalname,
          file?.buffer,
          todoId,
          userId,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({
            error:
              "Tâche non trouvée ou vous n'avez pas le droit de la modifier",
          });
      }

      res.json({ message: "Tâche mise à jour avec succès" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la tâche :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour de la tâche" });
    }
  }
);

router.get(
  "/api/todos/:folderId",
  authenticateToken,
  param("folderId").isInt().withMessage("L'ID du dossier doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const folderId = req.params.folderId;

    try {
      const [results] = await db.execute(
        "SELECT * FROM Todos WHERE UserID = ? AND FolderID = ?",
        [userId, folderId]
      );
      res.json(results);
    } catch (err) {
      console.error("Erreur lors de la récupération des tâches :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des tâches" });
    }
  }
);

router.delete(
  "/api/todos/:todoId",
  authenticateToken,
  param("todoId").isInt().withMessage("L'ID de la tâche doit être un entier"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { todoId } = req.params;
    const userId = req.user.userId;

    try {
      const [result] = await db.execute(
        "DELETE FROM Todos WHERE TodoID = ? AND UserID = ?",
        [todoId, userId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({
            error:
              "Tâche non trouvée ou vous n'avez pas le droit de la supprimer",
          });
      }

      res.json({ message: "Tâche supprimée avec succès" });
    } catch (err) {
      console.error("Erreur lors de la suppression de la tâche :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la tâche" });
    }
  }
);

module.exports = router;
