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
import { setCookie, getCookie, eraseCookie } from "../utils/cookieUtils";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post("/login", { username, password });

      if (response.data.requires2FA) {
        setShow2FA(true);
      } else if (response.data.token) {
        setCookie("token", response.data.token);
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.error || "An unknown error occurred.");
      console.error("Login error:", error);
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
      setError(error.response?.data?.error || "An unknown error occurred.");
      console.error("2FA validation error:", error);
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
        {error && <Alert severity="error">{error}</Alert>}
        <form
          onSubmit={show2FA ? handleTwoFactorSubmit : handleSubmit}
          sx={{ mt: 1 }}
        >
          {!show2FA && (
            <>
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
            </>
          )}
          {show2FA && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Code 2FA"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {show2FA ? "Valider" : "Se Connecter"}
          </Button>
        </form>
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
