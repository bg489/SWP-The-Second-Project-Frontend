import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useMockAuth } from "../context/MockAuthContext";

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role } = useMockAuth();

  if (!isAuthenticated) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to unauthorized if role is not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children/sub-routes
  return <Outlet />;
};

export default RoleProtectedRoute;
