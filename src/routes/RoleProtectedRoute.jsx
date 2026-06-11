import { Navigate, Outlet } from "react-router-dom";
import { useMockAuth } from "../context/MockAuthContext";

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role } = useMockAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
