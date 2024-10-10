const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csurf = require("csurf");
const rateLimit = require("express-rate-limit");

const postitRouter = require("./server/postit.cjs");
const signupRouter = require("./server/signup.cjs");
const loginRouter = require("./server/login.cjs");
const todoRouter = require("./server/todo.cjs");
const folderRouter = require("./server/folder.cjs");

dotenv.config();

const app = express();

// Configuration de la base de données
let db;
const initDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    console.log(
      "Connexion à la base de données réussie pour le serveur principal"
    );
  } catch (err) {
    console.error(
      "Erreur lors de la connexion à la base de données pour le serveur principal:",
      err
    );
    process.exit(1);
  }
};

initDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["http://localhost:5173", "https://toolly.fr"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  credentials: true,
};

app.use(cors(corsOptions));

// Protection CSRF
app.use(csurf({ cookie: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Routes
const routes = [
  { path: postitRouter, name: "postit" },
  { path: signupRouter, name: "signup" },
  { path: loginRouter, name: "login" },
  { path: todoRouter, name: "todo" },
  { path: folderRouter, name: "folder" },
];

routes.forEach((route) => {
  try {
    app.use(route.path);
    console.log(`Routes ${route.name} ajoutées`);
  } catch (e) {
    console.error(`Erreur lors de l'ajout des routes ${route.name}:`, e);
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Une erreur est survenue!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { db };
