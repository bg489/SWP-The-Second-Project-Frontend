import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
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
  UserCheck,
} from "lucide-react";

import { useMockAuth } from "../../context/MockAuthContext";
import { roleLabels } from "../../services/mockParkingData";
import { logout as logoutAction } from "../../features/backend/auth/authSlice";
import "./Layout.css";

const menus = {
  USER: [
    { path: "/user/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/user/qr-pass", label: "QR & gói tháng", icon: QrCode },
    { path: "/user/profile", label: "Hồ sơ & xe", icon: User },
    { path: "/user/building-change", label: "Đổi tòa nhà", icon: Building2 },
  ],
  PARKING_STAFF: [
    { path: "/staff/dashboard", label: "Bàn vận hành", icon: LayoutDashboard },
    { path: "/staff/check-in", label: "Xe vào", icon: ArrowDownLeft },
    { path: "/staff/check-out", label: "Xe ra", icon: ArrowUpRight },
    { path: "/staff/temp-qr-cards", label: "QR tạm", icon: QrCode },
    { path: "/staff/violations", label: "Vi phạm", icon: AlertTriangle },
    { path: "/staff/motorbike-status", label: "Sức chứa xe máy", icon: Layers },
    { path: "/staff/car-slots", label: "Ô đỗ ô tô", icon: Car },
  ],
  PARKING_MANAGER: [
    { path: "/manager/dashboard", label: "Tổng quan quản lý", icon: LayoutDashboard },
    { path: "/manager/building", label: "Tòa nhà", icon: Building2 },
    { path: "/manager/floors", label: "Tầng & ô đỗ", icon: Layers },
    { path: "/manager/pricing-packages", label: "Bảng giá & gói tháng", icon: BadgeDollarSign },
    { path: "/manager/temp-qr-cards", label: "QR tạm", icon: QrCode },
    { path: "/manager/reports", label: "Báo cáo", icon: BarChart3 },
    { path: "/manager/violation-types", label: "Cấu hình vi phạm", icon: AlertTriangle }
  ],
  ADMIN: [
    { path: "/admin/dashboard", label: "Tổng quan duyệt", icon: ShieldCheck },
    { path: "/admin/users", label: "Duyệt tài khoản", icon: UserCheck },
    { path: "/admin/vehicles", label: "Duyệt xe", icon: Car },
    { path: "/admin/building-change-requests", label: "Duyệt đổi tòa nhà", icon: Building2 },
    { path: "/admin/settings", label: "Quy tắc chung", icon: Settings },
  ],
};

const Sidebar = ({ isOpen, isHidden, toggleSidebar }) => {
  const { role, user, logout: mockLogout } = useMockAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuItems = menus[role] || [];

  const handleLogout = () => {
    dispatch(logoutAction());
    mockLogout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""} ${isHidden ? "collapsed" : ""}`}>
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
        <div className="badge-role">{roleLabels[role] || "Người dùng"}</div>
        <div className="badge-desc">{user?.details || "Đang sử dụng hệ thống"}</div>
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
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
