import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("token");

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" />;
  } else {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
