import React from "react";
import { NavLink } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  LayoutDashboard,
  QrCode,
  User,
  ArrowRightLeft,
  Layers,
  Car,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";
import "./Layout.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { role, logout } = useMockAuth();

  // Define menu items dynamically based on current logged in role
  const getMenuItems = () => {
    switch (role) {
      case "User":
        return [
          { path: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/user/qr-pass", label: "Vé QR Pass của tôi", icon: QrCode },
          { path: "/user/profile", label: "Hồ sơ cá nhân", icon: User }
        ];
      case "Staff":
        return [
          { path: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/staff/check-in", label: "Quét Xe vào", icon: ArrowDownLeft },
          { path: "/staff/check-out", label: "Quét Xe ra", icon: ArrowUpRight },
          { path: "/staff/motorbike-status", label: "Trạng thái Xe máy", icon: Layers },
          { path: "/staff/car-slots", label: "Sơ đồ đỗ Ô tô", icon: Car }
        ];
      case "Manager":
        return [
          { path: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/manager/building", label: "Quản lý tòa nhà", icon: Building2 },
          { path: "/manager/floors", label: "Quản lý tầng hầm", icon: Layers },
          { path: "/manager/reports", label: "Báo cáo vận hành", icon: BarChart3 }
        ];
      case "Admin":
        return [
          { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/admin/settings", label: "Cấu hình hệ thống", icon: Settings }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles className="logo-icon" size={24} />
          <span>Bãi đỗ xe</span>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          &times;
        </button>
      </div>

      <div className="sidebar-user-badge">
        <div className="badge-role">{role} Panel</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  toggleSidebar();
                }
              }}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
