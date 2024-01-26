import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import "./App.css";
import { PomodoroProvider } from "./components/PomodoroContext";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import SignUpPage from "./components/SignUpPage";
import Drawlly from "./components/Drawlly";
import IdeaBox from "./components/IdeaBox";
import FolderPage from "./components/FolderPage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  React.useEffect(() => {
    const isAuth = localStorage.getItem("JWT_TOKEN");
    if (
      (!isAuth && window.location.pathname !== "/login") ||
      (window.location.pathname !== "/signup" && !isAuth)
    ) {
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider maxSnack={3}>
        <PomodoroProvider>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login/*" element={<LoginPage />} />
              <Route path="/signup/*" element={<SignUpPage />} />
              <Route path="/*" element={<Dashboard />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/drawlly/*" element={<Drawlly />} />
              <Route path="/ideabox/*" element={<IdeaBox />} />
              <Route path="/folder/:folderId/*" element={<FolderPage />} />
            </Routes>
          </Router>
        </PomodoroProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
