import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  LinearProgress,
} from "@mui/material";

function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const isPasswordStrong = (password) => {
    return password.length >= 8;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;

    const lengthCriteria = password.length >= 16;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const numbersCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*]/.test(password);

    if (lengthCriteria) strength += 25;
    if (uppercaseCriteria) strength += 25;
    if (numbersCriteria) strength += 25;
    if (specialCharCriteria) strength += 25;

    return strength;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!isPasswordStrong(password)) {
      setPasswordError("Le mot de passe n'est pas assez fort.");
      return;
    }
    try {
      await axios.post("https://toolly.fr/api/signup", {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.error("Erreur lors de l'inscription :", error.response.data);
        alert("Erreur d'inscription: " + error.response.data.message);
      } else if (error.request) {
        console.error("Le serveur ne répond pas :", error.request);
      } else {
        console.error("Erreur :", error.message);
      }
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
            onChange={handlePasswordChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && (
            <Typography color="error">{passwordError}</Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">Force du mot de passe :</Typography>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              style={{ backgroundColor: "red" }}
            />
          </Box>{" "}
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
