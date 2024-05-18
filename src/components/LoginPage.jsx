import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { api } from "../axios";
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        const csrfToken = Cookies.get("_csrf");
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post("/login", { username, password });

      if (response.data.requires2FA) {
        setShow2FA(true);
      } else if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Login error:", error.response?.data || error);
    }
  };

  const handleTwoFactorSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post("/login/validate-2fa", {
        username,
        code: twoFactorCode,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("2FA validation error:", error.response?.data || error);
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
        <form onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
        </form>
        {show2FA && (
          <form onSubmit={handleTwoFactorSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Code 2FA"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              fullWidth
              required
            />
            <Button type="submit" fullWidth variant="contained" color="primary">
              Valider
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
          </form>
        )}
        <Typography variant="body2" style={{ marginTop: "20px" }}>
          Pas encore de compte?{" "}
          <Link component={RouterLink} to="/signup">
            Inscrivez-vous
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default LoginPage;
