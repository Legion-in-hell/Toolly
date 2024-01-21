import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useSnackbar } from "notistack";
import { Link as RouterLink } from "react-router-dom";

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        username,
        password,
      });
      login(response.data.token);
      enqueueSnackbar("Connexion réussie!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      navigate("/");
    } catch (error) {
      enqueueSnackbar("Erreur de connexion", { variant: "error" });
      console.error("Erreur de connexion", error.response?.data || error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Connexion
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nom d'utilisateur"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Se Connecter
          </Button>
          <Typography variant="body2" style={{ marginTop: "20px" }}>
            Pas encore de compte?{" "}
            <Link component={RouterLink} to="/signup">
              Inscrivez-vous
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;
