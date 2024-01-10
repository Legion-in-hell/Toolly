import React from 'react';
import Dashboard from './components/Dashboard';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // Vous pouvez personnaliser davantage les couleurs ici
  },
});

function App() {
  return (
    <Router>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
    </Router>
  );
}

export default App;

