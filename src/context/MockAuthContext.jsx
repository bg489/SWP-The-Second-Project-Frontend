import React, { createContext, useContext, useState, useEffect } from "react";

const MockAuthContext = createContext();

const mockUsersByRole = {
  User: {
    id: "U001",
    name: "Nguyễn Văn A",
    email: "user@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "User",
    details: "Khách hàng Đồng"
  },
  Staff: {
    id: "S054",
    name: "Trần Thị B",
    email: "staff@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "Staff",
    details: "Nhân viên hỗ trợ khách hàng"
  },
  Manager: {
    id: "M012",
    name: "Phạm Minh C",
    email: "manager@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Manager",
    details: "Quản lý phòng vận hành"
  },
  Admin: {
    id: "A001",
    name: "Lê Hoàng D",
    email: "admin@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    role: "Admin",
    details: "Quản trị viên hệ thống"
  }
};

export const MockAuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("mock_role") || "User";
  });
  
  const [user, setUser] = useState(mockUsersByRole[role]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("mock_role", role);
    setUser(mockUsersByRole[role]);
  }, [role]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const login = (selectedRole) => {
    if (mockUsersByRole[selectedRole]) {
      setRole(selectedRole);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole("");
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (mockUsersByRole[newRole]) {
      setRole(newRole);
      setIsAuthenticated(true);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
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
        switchRole,
        toggleDarkMode
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
