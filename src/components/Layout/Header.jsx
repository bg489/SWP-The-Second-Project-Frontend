import { useEffect, useMemo, useState } from "react";
import { Bell, Mail, MailX, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { useMockAuth } from "../../context/MockAuthContext";
import {
  fetchMyNotificationsRequest,
  fetchNotificationPreferencesRequest,
  updateNotificationPreferencesRequest,
} from "../../features/backend/parking/parkingSlice";
import { roleLabels } from "../../services/mockParkingData";
import "./Layout.css";

const Header = ({ toggleSidebar, sidebarHidden, toggleSidebarHidden }) => {
  const { role: contextRole, user: contextUser, isDarkMode, toggleDarkMode, isAuthenticated } = useMockAuth();
  const dispatch = useDispatch();
  const { user: authUser, frontendRole, isAuthenticated: storeAuthenticated } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.parking);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const user = authUser || contextUser;
  const role = frontendRole || contextRole;
  const loggedIn = Boolean((storeAuthenticated || isAuthenticated) && user);
  const avatarUrl = user?.avatarUrl || user?.avatar || "";
  const initials = String(user?.name || "U").slice(0, 1).toUpperCase();
  const recentNotifications = useMemo(
    () => (notifications.mine || []).slice(0, 6),
    [notifications.mine]
  );
  const unreadCount = (notifications.mine || []).filter((item) => item.status !== "READ").length;
  const emailEnabled = notifications.preferences.emailNotificationsEnabled;

  useEffect(() => {
    if (!loggedIn) return;

    dispatch(fetchMyNotificationsRequest());
    dispatch(fetchNotificationPreferencesRequest());
  }, [dispatch, loggedIn, user?.id]);

  const formatNotificationTime = (value) => {
    if (!value) return "";

    try {
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(value));
    } catch {
      return "";
    }
  };

  const handleEmailToggle = () => {
    dispatch(
      updateNotificationPreferencesRequest({
        emailNotificationsEnabled: !emailEnabled,
      })
    );
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

        {loggedIn && (
          <div className="notification-widget">
            <button
              className="theme-toggle-btn notification-toggle-btn"
              onClick={() => setNotificationOpen((value) => !value)}
              title="Thông báo"
              aria-label="Thông báo"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isNotificationOpen && (
              <div className="notification-popover">
                <div className="notification-popover-header">
                  <div>
                    <strong>Thông báo</strong>
                    <span>{recentNotifications.length} mục gần nhất</span>
                  </div>
                  <button
                    type="button"
                    className={`notification-email-switch ${emailEnabled ? "active" : ""}`}
                    onClick={handleEmailToggle}
                    disabled={notifications.preferences.saving}
                  >
                    {emailEnabled ? <Mail size={16} /> : <MailX size={16} />}
                    <span>{emailEnabled ? "Đang gửi email" : "Tắt email"}</span>
                  </button>
                </div>

                <div className="notification-list">
                  {recentNotifications.map((item) => (
                    <div className="notification-item" key={item.id}>
                      <div className="notification-dot" />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                        <span>{formatNotificationTime(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}

                  {!notifications.loading && recentNotifications.length === 0 && (
                    <div className="notification-empty">Chưa có thông báo mới.</div>
                  )}

                  {notifications.loading && (
                    <div className="notification-empty">Đang tải thông báo...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {loggedIn && user && (
          <div className="header-user-profile">
            {avatarUrl ? (
              <span className="user-profile-avatar user-profile-avatar-crop">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  style={{
                    objectPosition: `${Number(user.avatarCropX ?? 50)}% ${Number(user.avatarCropY ?? 50)}%`,
                    transform: `scale(${Number(user.avatarCropZoom ?? 1)})`,
                  }}
                />
              </span>
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
