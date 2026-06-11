import { NavLink, useNavigate } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import { roleLabels } from "../../services/mockParkingData";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  Car,
  LayoutDashboard,
  Layers,
  LogOut,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import "./Layout.css";

const menus = {
  USER: [
    { path: "/user/dashboard", label: "Tổng quan của tôi", icon: LayoutDashboard },
    { path: "/user/qr-pass", label: "QR & gói tháng", icon: QrCode },
    { path: "/user/profile", label: "Hồ sơ & xe", icon: User },
  ],
  PARKING_STAFF: [
    { path: "/staff/dashboard", label: "Bàn vận hành", icon: LayoutDashboard },
    { path: "/staff/check-in", label: "Xe vào / QR tạm", icon: ArrowDownLeft },
    { path: "/staff/check-out", label: "Xe ra / tính phí", icon: ArrowUpRight },
    { path: "/staff/motorbike-status", label: "Capacity xe máy", icon: Layers },
    { path: "/staff/car-slots", label: "Sơ đồ slot ô tô", icon: Car },
  ],
  PARKING_MANAGER: [
    { path: "/manager/dashboard", label: "Dashboard quản lý", icon: LayoutDashboard },
    { path: "/manager/building", label: "Tòa nhà", icon: Building2 },
    { path: "/manager/floors", label: "Tầng & slot", icon: Layers },
    { path: "/manager/reports", label: "Báo cáo", icon: BarChart3 },
  ],
  ADMIN: [
    { path: "/admin/dashboard", label: "Duyệt & phân quyền", icon: ShieldCheck },
    { path: "/admin/settings", label: "Chính sách hệ thống", icon: Settings },
  ],
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { role, user, logout } = useMockAuth();
  const navigate = useNavigate();
  const menuItems = menus[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <span>Sunrise Parking</span>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Đóng menu">
          &times;
        </button>
      </div>

      <div className="sidebar-user-badge">
        <div className="badge-role">{roleLabels[role] || role}</div>
        <div className="badge-desc">{user?.details || "Mock mode"}</div>
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
                if (window.innerWidth <= 1100) toggleSidebar();
              }}
            >
              <Icon size={19} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất mock</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
