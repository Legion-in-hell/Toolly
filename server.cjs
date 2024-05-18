const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const postitRouter = require("./server/postit.cjs");
const signupRouter = require("./server/signup.cjs");
const loginRouter = require("./server/login.cjs");
const todoRouter = require("./server/todo.cjs");
const folderRouter = require("./server/folder.cjs");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csurf = require("cors");
const app = express();
dotenv.config();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(csurf({ cookie: true }));

db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.on("error", function (err) {
  console.log(
    "Erreur lors de la connexion à la base de données pour le server principal"
  );
  console.log(err);
});

db.connect(function (err) {
  if (err) {
    console.log(
      "Erreur lors de la connexion à la base de données pour le server principal"
    );
    console.log(err);
  } else {
    console.log(
      "Connexion à la base de données réussie pour le server principal"
    );
  }
});

app.use(express.json());
app.use(helmet.hidePoweredBy());
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", "https://toolly.fr"];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    done(err, results[0]);
  });
});

try {
  app.use(postitRouter);
  console.log("Routes postit ajoutées");
} catch (e) {
  console.log("Erreur lors de l'ajout des routes postit");
  console.log(e);
}

try {
  app.use(signupRouter);
  console.log("Routes signup ajoutées");
} catch (e) {
  console.log("Erreur lors de l'ajout des routes signup");
  console.log(e);
}

try {
  app.use(loginRouter);
  console.log("Routes login ajoutées");
} catch (e) {
  console.log("Erreur lors de l'ajout des routes login");
  console.log(e);
}

try {
  app.use(todoRouter);
  console.log("Routes todo ajoutées");
} catch (e) {
  console.log("Erreur lors de l'ajout des routes todo");
  console.log(e);
}

try {
  app.use(folderRouter);
  console.log("Routes folder ajoutées");
} catch (e) {
  console.log("Erreur lors de l'ajout des routes folder");
  console.log(e);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
