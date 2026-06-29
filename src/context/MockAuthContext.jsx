/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { ROLE_KEYS, roleHomePaths } from "../services/mockParkingData";

const MockAuthContext = createContext();

const mockUsersByRole = {
  USER: {
    id: 1,
    name: "Nguyễn An",
    email: "nguyen.an@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    role: ROLE_KEYS.USER,
    details: "Cư dân có xe đã duyệt",
  },
  PARKING_STAFF: {
    id: 2,
    name: "Trần Bảo",
    email: "staff@example.com",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80",
    role: ROLE_KEYS.PARKING_STAFF,
    details: "Nhân viên vận hành cổng xe",
  },
  PARKING_MANAGER: {
    id: 3,
    name: "Phạm Minh Châu",
    email: "manager@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    role: ROLE_KEYS.PARKING_MANAGER,
    details: "Quản lý vận hành bãi xe",
  },
  ADMIN: {
    id: 4,
    name: "Lê Hoàng Duy",
    email: "admin@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    role: ROLE_KEYS.ADMIN,
    details: "Quản trị viên hệ thống",
  },
};

export const MockAuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem("mock_role") || ROLE_KEYS.USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const user = mockUsersByRole[role] || mockUsersByRole.USER;

  useEffect(() => {
    localStorage.setItem("mock_role", role);
  }, [role]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const login = (selectedRole) => {
    const nextRole = mockUsersByRole[selectedRole] ? selectedRole : ROLE_KEYS.USER;
    setRole(nextRole);
    setIsAuthenticated(true);
    return roleHomePaths[nextRole];
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <MockAuthContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        isDarkMode,
        login,
        logout,
        toggleDarkMode,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth phải được sử dụng trong MockAuthProvider");
  }
  return context;
};
