/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROLE_KEYS, roleHomePaths } from "../services/mockParkingData";

const MockAuthContext = createContext();

const safeJsonParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const backendToFrontendRole = {
  ADMIN: ROLE_KEYS.ADMIN,
  USER: ROLE_KEYS.USER,
  MANAGER: ROLE_KEYS.PARKING_MANAGER,
  STAFF: ROLE_KEYS.PARKING_STAFF,
  PARKING_MANAGER: ROLE_KEYS.PARKING_MANAGER,
  PARKING_STAFF: ROLE_KEYS.PARKING_STAFF,
};

const normalizeRole = (role) => backendToFrontendRole[String(role || "").toUpperCase()] || ROLE_KEYS.USER;

export const MockAuthProvider = ({ children }) => {
  const initialUser = safeJsonParse(localStorage.getItem("auth_user"));
  const initialToken = localStorage.getItem("access_token");
  const [role, setRole] = useState(() =>
    localStorage.getItem("mock_role") || normalizeRole(initialUser?.role)
  );
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialToken));
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const login = useCallback((selectedRole, nextUser, token) => {
    const nextRole = normalizeRole(selectedRole || nextUser?.role);

    setRole(nextRole);
    setUser(nextUser || null);
    setIsAuthenticated(Boolean(token || localStorage.getItem("access_token")));

    localStorage.setItem("mock_role", nextRole);

    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
    }

    if (token) {
      localStorage.setItem("access_token", token);
    }

    return roleHomePaths[nextRole] || "/login";
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser || null);

    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      const nextRole = normalizeRole(nextUser.role);
      setRole(nextRole);
      localStorage.setItem("mock_role", nextRole);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("mock_role");
    setUser(null);
    setRole(ROLE_KEYS.USER);
    setIsAuthenticated(false);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      role,
      user,
      isAuthenticated,
      isDarkMode,
      login,
      logout,
      toggleDarkMode,
      updateUser,
    }),
    [isAuthenticated, isDarkMode, login, logout, role, toggleDarkMode, updateUser, user]
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth phai duoc su dung trong MockAuthProvider");
  }
  return context;
};
