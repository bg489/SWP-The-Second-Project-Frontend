import React from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import Button from "../../components/Button/Button";
import { Sparkles, User, ShieldCheck, HeartHandshake, Eye } from "lucide-react";

const Login = () => {
  const { login, isDarkMode, toggleDarkMode } = useMockAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (roleName) => {
    login(roleName);
    if (roleName === "User") navigate("/user/dashboard");
    else if (roleName === "Staff") navigate("/staff/dashboard");
    else if (roleName === "Manager") navigate("/manager/dashboard");
    else if (roleName === "Admin") navigate("/admin/dashboard");
  };

  const rolesList = [
    {
      name: "User",
      label: "User / Customer",
      desc: "Xem lịch đặt hẹn cá nhân, đặt các dịch vụ thiết kế, bảo dưỡng định kỳ.",
      icon: User,
      color: "var(--primary)"
    },
    {
      name: "Staff",
      label: "Staff / Operator",
      desc: "Theo dõi danh sách các task cần xử lý, cập nhật tiến độ công việc được giao.",
      icon: HeartHandshake,
      color: "var(--success)"
    },
    {
      name: "Manager",
      label: "Manager",
      desc: "Xem biểu đồ tăng trưởng doanh số doanh nghiệp, báo cáo hiệu suất của nhân sự.",
      icon: Eye,
      color: "var(--warning)"
    },
    {
      name: "Admin",
      label: "Administrator",
      desc: "Giám sát hiệu suất tài nguyên máy chủ, quản lý tài khoản người dùng hệ thống.",
      icon: ShieldCheck,
      color: "var(--danger)"
    }
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
      padding: "20px"
    }}>
      <div className="card" style={{
        maxWidth: "800px",
        width: "100%",
        padding: "40px",
        boxShadow: "var(--shadow-premium)",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        position: "relative"
      }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", fontWeight: "800", fontSize: "20px", marginBottom: "8px" }}>
              <Sparkles size={24} />
              <span>Cổng Đăng nhập</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)" }}>
              Đăng nhập Hệ thống
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Hệ thống đang cấu hình chạy dữ liệu mẫu (Mock data). Vui lòng chọn một vai trò bên dưới để kiểm thử.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={toggleDarkMode}>
            {isDarkMode ? "Giao diện Sáng" : "Giao diện Tối"}
          </Button>
        </div>

        {/* Roles Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "20px"
        }}>
          {rolesList.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.name}
                onClick={() => handleRoleSelect(r.name)}
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--card-bg)",
                  cursor: "pointer",
                  transition: "all var(--transition-normal)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxShadow: "var(--shadow-sm)"
                }}
                className="role-card-item"
              >
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: `${r.color}15`,
                  color: r.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={22} />
                </div>

                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>{r.label}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.5" }}>
                    {r.desc}
                  </p>
                </div>

                <div style={{ marginTop: "auto", fontSize: "12px", fontWeight: "700", color: r.color }}>
                  Đăng nhập &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover effects style */}
      <style>{`
        .role-card-item:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
};

export default Login;
