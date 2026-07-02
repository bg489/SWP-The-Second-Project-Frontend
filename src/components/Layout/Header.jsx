import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useSelector } from "react-redux";

import { useMockAuth } from "../../context/MockAuthContext";
import { roleLabels } from "../../services/mockParkingData";
import "./Layout.css";

const Header = ({ toggleSidebar, sidebarHidden, toggleSidebarHidden }) => {
  const { role: contextRole, user: contextUser, isDarkMode, toggleDarkMode, isAuthenticated } = useMockAuth();
  const { user: authUser, frontendRole } = useSelector((state) => state.auth);
  const user = authUser || contextUser;
  const role = frontendRole || contextRole;
  const avatarUrl = user?.avatarUrl || user?.avatar || "";
  const initials = String(user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <header className="header-container">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Mở menu">
          <Menu size={21} />
        </button>
        <button
          type="button"
          className="sidebar-desktop-toggle-btn"
          onClick={toggleSidebarHidden}
          aria-label={sidebarHidden ? "Hiện thanh bên" : "Ẩn thanh bên"}
          title={sidebarHidden ? "Hiện thanh bên" : "Ẩn thanh bên"}
        >
          {sidebarHidden ? <PanelLeftOpen size={21} /> : <PanelLeftClose size={21} />}
        </button>
        <div className="header-title">
          <h2>Sunrise Parking</h2>
          <p>Quản lý tòa giữ xe bằng QR cho cư dân, khách và nhân viên vận hành</p>
        </div>
      </div>

      <div className="header-right">
        <div className="role-switcher-widget role-display-widget" aria-label="Vai trò hiện tại">
          <span className="switcher-label">Vai trò</span>
          <span className="role-display-value">{roleLabels[role] || role}</span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          aria-label="Đổi giao diện"
        >
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {isAuthenticated && user && (
          <div className="header-user-profile">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="user-profile-avatar" />
            ) : (
              <div className="user-profile-avatar avatar-fallback">{initials}</div>
            )}
            <div className="user-profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.details || roleLabels[role]}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
