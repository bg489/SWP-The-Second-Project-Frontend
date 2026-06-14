import React from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import { Sun, Moon, Menu, ChevronDown, User, ShieldAlert } from "lucide-react";
import "./Layout.css";

const Header = ({ toggleSidebar }) => {
  const {
    role,
    user,
    switchRole,
    isDarkMode,
    toggleDarkMode,
    isAuthenticated
  } = useMockAuth();
  
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    
    // Redirect to the default dashboard for the switched role
    if (newRole === "User") navigate("/user/dashboard");
    else if (newRole === "Staff") navigate("/staff/dashboard");
    else if (newRole === "Manager") navigate("/manager/dashboard");
    else if (newRole === "Admin") navigate("/admin/dashboard");
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="header-title">
          <h2>Hệ thống quản trị</h2>
        </div>
      </div>

      <div className="header-right">

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User profile dropdown info */}
        {isAuthenticated && user && (
          <div className="header-user-profile">
            <img
              src={user.avatar}
              alt={user.name}
              className="user-profile-avatar"
              onError={(e) => {
                // Fallback avatar
                e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
              }}
            />
            <div className="user-profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.details}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
