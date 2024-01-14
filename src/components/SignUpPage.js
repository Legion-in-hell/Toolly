import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import { Container, Typography, TextField, Button, Link } from "@mui/material";

function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // TODO: Envoyer les données au serveur
      await axios.post("http://localhost:3001/api/signup", {
        username,
        email,
        password,
      });
      navigate("/login"); // Redirige vers la page de connexion après l'inscription
    } catch (error) {
      console.error("Erreur lors de l`'inscription", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        style={{
          marginTop: "15%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Inscription
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Nom d'utilisateur"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ margin: "24px 0px 16px" }}
          >
            S'inscrire
          </Button>
          <Typography variant="body2" style={{ textAlign: "center" }}>
            Déjà inscrit?{" "}
            <Link component={RouterLink} to="/login">
              Se connecter
            </Link>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}

export default SignUpPage;
