import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useMockAuth } from "../context/MockAuthContext";

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated: contextAuthenticated, role: contextRole } = useMockAuth();
  const { isAuthenticated: storeAuthenticated, frontendRole } = useSelector((state) => state.auth);
  const isAuthenticated = contextAuthenticated && storeAuthenticated;
  const role = frontendRole || contextRole;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
