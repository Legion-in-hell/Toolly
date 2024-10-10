import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import CircularProgress from "@mui/material/CircularProgress";
import "./App.css";
import { PomodoroProvider } from "./components/PomodoroContext";

// Lazy load components
const LoginPage = lazy(() => import("./components/LoginPage"));
const SignUpPage = lazy(() => import("./components/SignUpPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Drawlly = lazy(() => import("./components/Drawlly"));
const IdeaBox = lazy(() => import("./components/IdeaBox"));
const FolderPage = lazy(() => import("./components/FolderPage"));

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("JWT_TOKEN");
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    const isAuth = localStorage.getItem("JWT_TOKEN");
    if (!isAuth && !["/login", "/signup"].includes(window.location.pathname)) {
      window.location.replace("/login");
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider maxSnack={3}>
        <PomodoroProvider>
          <CssBaseline />
          <Router>
            <Suspense fallback={<CircularProgress />}>
              <Routes>
                <Route path="/login/*" element={<LoginPage />} />
                <Route path="/signup/*" element={<SignUpPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/drawlly/*"
                  element={
                    <ProtectedRoute>
                      <Drawlly />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ideabox/*"
                  element={
                    <ProtectedRoute>
                      <IdeaBox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/folder/:folderId/*"
                  element={
                    <ProtectedRoute>
                      <FolderPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </PomodoroProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
