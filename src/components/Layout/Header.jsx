import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import { roleLabels } from "../../services/mockParkingData";
import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import "./Layout.css";

const Header = ({ toggleSidebar, sidebarHidden, toggleSidebarHidden }) => {
  const { role, roles, user, switchRole, isDarkMode, toggleDarkMode, isAuthenticated } = useMockAuth();
  const navigate = useNavigate();

  const handleRoleChange = (event) => {
    const path = switchRole(event.target.value);
    navigate(path);
  };

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
          aria-label={sidebarHidden ? "Hiện sidebar" : "Ẩn sidebar"}
          title={sidebarHidden ? "Hiện sidebar" : "Ẩn sidebar"}
        >
          {sidebarHidden ? <PanelLeftOpen size={21} /> : <PanelLeftClose size={21} />}
        </button>
        <div className="header-title">
          <h2>Parking Building Management</h2>
          <p>Mock UI trước khi nối Redux Saga với backend</p>
        </div>
      </div>

      <div className="header-right">
        <div className="role-switcher-widget">
          <span className="switcher-label">Role</span>
          <select className="role-select-dropdown" value={role} onChange={handleRoleChange}>
            {roles.map((roleKey) => (
              <option key={roleKey} value={roleKey}>
                {roleLabels[roleKey]}
              </option>
            ))}
          </select>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          aria-label="Đổi theme"
        >
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {isAuthenticated && user && (
          <div className="header-user-profile">
            <img src={user.avatar} alt={user.name} className="user-profile-avatar" />
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
