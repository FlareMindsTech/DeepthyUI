// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = localStorage.getItem("user");
  const user = currentUser ? JSON.parse(currentUser) : null;
  const role = user?.role;

  if (!user) {
    // Not logged in → redirect to Sign In
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but not allowed → redirect to Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
