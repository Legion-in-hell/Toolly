import React, { useState, useEffect } from "react";
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
import DOMPurify from "dompurify";

function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleAuthSecret, setGoogleAuthSecret] = useState("");
  const [googleAuthQrCode, setGoogleAuthQrCode] = useState("");

  useEffect(() => {
    checkUsernameAndDisplayError(username);
  }, [username]);

  const isPasswordStrong = (password) => {
    return password.length >= 8;
  };

  const handleGenerateGoogleAuthSecret = async () => {
    try {
      const response = await axios.get("/api/signup/google-authenticator");
      setGoogleAuthSecret(response.data.secret);
      const qrCode = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/Toolly:${username}?secret=${response.data.secret}&issuer=Toolly`;
      setGoogleAuthQrCode(DOMPurify.sanitize(qrCode));
    } catch (error) {
      console.error("Error generating Google Authenticator secret:", error);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
    updatePasswordStrengthColors(newPassword);
  };

  const checkUsername = async (username) => {
    try {
      const response = await axios.get(`/api/user/exists?username=${username}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  axios.get("/api/signup/google-authenticator", (req, res) => {
    const secret = speakeasy.generateSecret();
    res.json({ secret: secret.base32 });
  });

  const checkUsernameAndDisplayError = async (username) => {
    try {
      const userExists = await checkUsername(username);
      const userAlreadyExistElement =
        document.querySelector(".userAlreadyExist");
      userAlreadyExistElement.style.display = userExists ? "block" : "none";
    } catch (error) {
      console.error("Error checking username:", error);
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
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!googleAuthSecret) {
      alert("Veuillez configurer Google Authenticator avant de vous inscrire");
      return;
    }

    if (!isPasswordStrong(password)) {
      setPasswordError("Le mot de passe n'est pas assez fort.");
      return;
    }
    try {
      await axios.post("/api/signup", {
        username,
        password,
        googleAuthSecret,
      });
      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.error("Error signing up:", error.response.data);
        alert("Erreur d'inscription: " + error.response.data.message);
      } else if (error.request) {
        console.error("Server not responding:", error.request);
      } else {
        console.error("Error:", error.message);
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
          <Box sx={{ mt: 2 }}>
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
          </Box>{" "}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateGoogleAuthSecret}
            style={{ margin: "24px 0px 16px" }}
          >
            Configurer Google Authenticator
          </Button>
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
