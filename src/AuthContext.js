import React, { useState, createContext, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
