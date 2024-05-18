import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { api } from "../axios";
import Box from "@mui/material/Box";
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  LinearProgress,
} from "@mui/material";
import DOMPurify from "dompurify";

function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleAuthSecret, setGoogleAuthSecret] = useState("");
  const [googleAuthQrCode, setGoogleAuthQrCode] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    checkUsernameAndDisplayError(username);
  }, [username]);

  const isPasswordStrong = (password) => {
    return password.length >= 8;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
    updatePasswordStrengthColors(newPassword);
  };

  const handleGoogleAuthSecret = async () => {
    try {
      const response = await api.get("/signup/google-authenticator");
      setGoogleAuthSecret(response.data.secret);
      setGoogleAuthQrCode(response.data.qrCodeUrl);
    } catch (error) {
      console.error(
        "Erreur lors de la génération du secret Google Authenticator:",
        error
      );
    }
  };

  const handleTwoFactorCodeChange = (event) => {
    setTwoFactorCode(event.target.value);
  };

  const checkUsername = async (username) => {
    try {
      const response = await api.get(`/user/exists?username=${username}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const checkUsernameAndDisplayError = async (username) => {
    try {
      const userExists = await checkUsername(username);
      setUsernameError(userExists ? "Ce nom d'utilisateur existe déjà" : null);
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du nom d'utilisateur :",
        error
      );
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;

    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const numbersCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*]/.test(password);

    if (lengthCriteria) {
      strength += 25;
    }
    if (uppercaseCriteria) {
      strength += 25;
    }
    if (numbersCriteria) {
      strength += 25;
    }
    if (specialCharCriteria) {
      strength += 25;
    }

    return strength;
  };

  const updatePasswordStrengthColors = (password) => {
    const caracMiniElement = document.querySelector(".caracMini");
    const majElement = document.querySelector(".maj");
    const chiffreElement = document.querySelector(".chiffre");
    const specialElement = document.querySelector(".special");

    caracMiniElement.style.color = password.length >= 8 ? "green" : "grey";
    majElement.style.color = /[A-Z]/.test(password) ? "green" : "grey";
    chiffreElement.style.color = /[0-9]/.test(password) ? "green" : "grey";
    specialElement.style.color = /[!@#$%^&*]/.test(password) ? "green" : "grey";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong(password)) {
      setPasswordError("Le mot de passe n'est pas assez fort.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong(password)) {
      setPasswordError("Le mot de passe n'est pas assez fort.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/signup", {
        username,
        password,
        email: "",
        googleAuthSecret: is2FAEnabled ? googleAuthSecret : null,
      });
      console.log("Inscription réussie :", response.data);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        // Gestion des erreurs plus précise ici
        const errorMessage = error.response.data.error || "Erreur inconnue";
        alert(`Erreur d'inscription : ${errorMessage}`);
      } else {
        console.error("Erreur lors de l'inscription : ", error);
      }
    } finally {
      setIsLoading(false);
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
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
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
          <Typography
            color="error"
            display={"none"}
            className="userAlreadyExist"
          >
            Le nom d'utilisateur existe déjà
          </Typography>
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
          <Box sx={{ mt: 2 }} mb={3}>
            <Box mb={1}>
              <Typography variant="caption">Force du mot de passe :</Typography>
            </Box>
            <Box mb={1}>
              <Typography
                variant="caption"
                className="caracMini"
                style={{ color: password.length >= 8 ? "green" : "grey" }}
              >
                - 8 caractères minimum
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography
                variant="caption"
                className="maj"
                style={{ color: /[A-Z]/.test(password) ? "green" : "grey" }}
              >
                - Au moins une majuscule
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography
                variant="caption"
                className="chiffre"
                style={{ color: /[0-9]/.test(password) ? "green" : "grey" }}
              >
                - Au moins un chiffre
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography
                variant="caption"
                className="special"
                style={{
                  color: /[!@#$%^&*]/.test(password) ? "green" : "grey",
                }}
              >
                - Au moins un caractère spécial : ! @ # $ % ^ & *
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              style={{ backgroundColor: "red" }}
            />
          </Box>
          <div style={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            >
              {is2FAEnabled ? "Désactiver 2FA" : "Activer 2FA"}
            </Button>
            {is2FAEnabled && googleAuthQrCode && (
              <Box mb={1} mt={1} alignContent={"center"}>
                <img
                  src={DOMPurify.sanitize(googleAuthQrCode)}
                  alt="QR code pour Google Authenticator"
                />
                <TextField
                  label="Code Google Authenticator"
                  variant="outlined"
                  value={twoFactorCode}
                  onChange={handleTwoFactorCodeChange}
                />
              </Box>
            )}
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ margin: "24px 0px 16px" }}
          >
            {" "}
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
