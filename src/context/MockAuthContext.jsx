/**
 * @fileoverview Khai báo chức năng frontend của module MockAuthContext.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ROLE_KEYS, roleHomePaths } from "../services/mockParkingData";

/**
 * Khai báo `MockAuthContext` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/context/MockAuthContext.jsx.
 */
const MockAuthContext = createContext();

/**
 * Thực hiện nghiệp vụ `safeJsonParse` (safe json parse). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function safeJsonParse
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const safeJsonParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Khai báo `backendToFrontendRole` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/context/MockAuthContext.jsx.
 */
const backendToFrontendRole = {
  ADMIN: ROLE_KEYS.ADMIN,
  USER: ROLE_KEYS.USER,
  MANAGER: ROLE_KEYS.PARKING_MANAGER,
  STAFF: ROLE_KEYS.PARKING_STAFF,
  PARKING_MANAGER: ROLE_KEYS.PARKING_MANAGER,
  PARKING_STAFF: ROLE_KEYS.PARKING_STAFF,
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeRole` (normalize role). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function normalizeRole
 * @param {*} role - Giá trị `role` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeRole = (role) => backendToFrontendRole[String(role || "").toUpperCase()] || ROLE_KEYS.USER;

/**
 * Thực hiện nghiệp vụ `MockAuthProvider` (mock auth provider). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function MockAuthProvider
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
export const MockAuthProvider = ({ children }) => {
  const initialUser = safeJsonParse(localStorage.getItem("auth_user"));
  const initialToken = localStorage.getItem("access_token");
  const {
    frontendRole: storeRole,
    isAuthenticated: storeAuthenticated,
    user: storeUser,
  } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [role, setRole] = useState(() =>
    localStorage.getItem("mock_role") || normalizeRole(initialUser?.role)
  );
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialToken));
  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  /* Callback nội bộ của lời gọi `useCallback`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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

  /* Callback nội bộ của lời gọi `useCallback`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const updateUser = useCallback((nextUser) => {
    setUser(nextUser || null);

    if (nextUser) {
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      const nextRole = normalizeRole(nextUser.role);
      setRole(nextRole);
      localStorage.setItem("mock_role", nextRole);
    }
  }, []);

  /* Callback nội bộ của lời gọi `useCallback`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("mock_role");
    setUser(null);
    setRole(ROLE_KEYS.USER);
    setIsAuthenticated(false);
  }, []);

  /* Callback nội bộ của lời gọi `useCallback`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const toggleDarkMode = useCallback(() => {
    /* Callback nội bộ của lời gọi `setIsDarkMode`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setIsDarkMode((prev) => !prev);
  }, []);

  const hasLocalSession = Boolean(
    isAuthenticated && localStorage.getItem("access_token")
  );
  const resolvedUser = storeAuthenticated ? storeUser : hasLocalSession ? user : null;
  const resolvedRole = storeAuthenticated
    ? storeRole || normalizeRole(storeUser?.role)
    : role;
  const resolvedAuthenticated = Boolean(storeAuthenticated || hasLocalSession);

  const value = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => ({
      role: resolvedRole,
      user: resolvedUser,
      isAuthenticated: resolvedAuthenticated,
      isDarkMode,
      login,
      logout,
      toggleDarkMode,
      updateUser,
    }),
    [
      isDarkMode,
      login,
      logout,
      resolvedAuthenticated,
      resolvedRole,
      resolvedUser,
      toggleDarkMode,
      updateUser,
    ]
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

/**
 * Thực hiện nghiệp vụ `useMockAuth` (use mock auth). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function useMockAuth
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
	throw new Error("useMockAuth phải được sử dụng trong MockAuthProvider");
  }
  return context;
};
