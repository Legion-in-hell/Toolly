import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { api } from "../axios";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  LinearProgress,
  Alert,
} from "@mui/material";
import DOMPurify from "dompurify";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    twoFactorCode: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleAuthSecret, setGoogleAuthSecret] = useState("");
  const [googleAuthQrCode, setGoogleAuthQrCode] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  }, []);

  const checkUsername = useCallback(async (username) => {
    try {
      const response = await api.get(`/user/exists?username=${username}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
      throw error;
    }
  }, []);

  const handleGoogleAuthSecret = useCallback(async () => {
    try {
      const response = await api.get("/signup/google-authenticator");
      setGoogleAuthSecret(response.data.secret);
      setGoogleAuthQrCode(response.data.qrCodeUrl);
    } catch (error) {
      console.error("Error generating Google Authenticator secret:", error);
      setError("Failed to generate 2FA secret. Please try again.");
    }
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (passwordStrength < 75) {
      setError("Password is not strong enough.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const userExists = await checkUsername(formData.username);
      if (userExists) {
        setError("Username already exists.");
        setIsLoading(false);
        return;
      }

      const response = await api.post("/signup", {
        username: formData.username,
        password: formData.password,
        googleAuthSecret: is2FAEnabled ? googleAuthSecret : null,
        twoFactorCode: formData.twoFactorCode,
      });

      console.log("Signup successful:", response.data);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.error || "An unknown error occurred.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
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
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoFocus
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          <Box sx={{ mt: 2 }} mb={3}>
            <Typography variant="caption">Password strength:</Typography>
            <LinearProgress variant="determinate" value={passwordStrength} />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
          >
            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
          {is2FAEnabled && (
            <>
              <Button onClick={handleGoogleAuthSecret}>
                Generate 2FA Secret
              </Button>
              {googleAuthQrCode && (
                <Box mb={1} mt={1}>
                  <img
                    src={DOMPurify.sanitize(googleAuthQrCode)}
                    alt="QR code for Google Authenticator"
                  />
                  <TextField
                    label="2FA Code"
                    name="twoFactorCode"
                    variant="outlined"
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                  />
                </Box>
              )}
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Log In
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default SignUpPage;
