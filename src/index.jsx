import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Fonction pour rendre l'application
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Vérifier si le navigateur prend en charge requestIdleCallback
if (window.requestIdleCallback) {
  window.requestIdleCallback(renderApp);
} else {
  // Fallback pour les navigateurs qui ne prennent pas en charge requestIdleCallback
  setTimeout(renderApp, 0);
}

// Gestion des erreurs non capturées
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  // Vous pouvez ajouter ici une logique pour envoyer les erreurs à un service de suivi
});
