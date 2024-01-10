import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import TodoList from './components/TodoList';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // Vous pouvez personnaliser davantage les couleurs ici
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = (username, password) => {
    // Ici, vous pouvez ajouter votre logique de vérification d'authentification
    // Par exemple, vérifier contre un backend ou une liste d'utilisateurs
    // Pour cet exemple, nous allons simplement simuler une authentification réussie
    setIsAuthenticated(true);
  }
  return (

    <>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
    <Router>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dashboard />
      <h1>Ma Todo List</h1>
      <TodoList />
    </ThemeProvider>
    </Router>

      )}
    </>

  );
}

export default App;

