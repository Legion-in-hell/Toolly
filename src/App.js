import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./AuthContext";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import SignUpPage from "./components/SignUpPage";
import { SnackbarProvider } from "notistack";
import Drawlly from "./components/Drawlly";
import IdeaBox from "./components/IdeaBox";
import ProtectedRoute from "./components/ProtectedRoute";
import FolderPage from "./components/FolderPage";
import { PomodoroProvider } from "./components/PomodoroContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider maxSnack={3}>
        <PomodoroProvider>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="*"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route
                  path="/drawlly"
                  element={<ProtectedRoute element={<Drawlly />} />}
                />
                <Route
                  path="/ideabox"
                  element={<ProtectedRoute element={<IdeaBox />} />}
                />
                <Route
                  path="/folder/:folderId"
                  element={<ProtectedRoute element={<FolderPage />} />}
                />
              </Routes>
            </Router>
          </AuthProvider>
        </PomodoroProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
