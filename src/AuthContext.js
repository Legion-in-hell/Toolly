import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (token) => {
    localStorage.setItem("token", token);
    // TODO: Définir l'utilisateur connecté ici
  };

  const logout = () => {
    localStorage.removeItem("token");
    // TODO: Réinitialiser l'état de l'utilisateur ici
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
