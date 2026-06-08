import React from "react";
import { useSelector } from "react-redux";
import { useMockAuth } from "../../context/MockAuthContext";
import UserList from "../users/UserList";
import Button from "../../components/Button/Button";
import { ShieldCheck, HardDrive, RefreshCw, Cpu, Server } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useMockAuth();
  const { users } = useSelector((state) => state.users);

  const [systemAlert, setSystemAlert] = React.useState(null);

  const handleSystemAction = (actionName) => {
    setSystemAlert(`Đang thực hiện: ${actionName}...`);
    setTimeout(() => {
      setSystemAlert(`Thành công: ${actionName} đã hoàn tất.`);
      setTimeout(() => setSystemAlert(null), 3000);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Brand Header */}
      <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            Hệ thống Quản trị viên <ShieldCheck style={{ color: "var(--primary)" }} />
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Xin chào <strong>{user.name}</strong>. Giám sát toàn cục tài nguyên máy chủ và quản lý tài khoản người dùng.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" size="sm" onClick={() => handleSystemAction("Xóa cache hệ thống")} icon={RefreshCw}>
            Dọn Cache
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSystemAction("Khởi động lại Server")}>
            Restart Nodes
          </Button>
        </div>
      </div>

      {systemAlert && (
        <div className="card animate-fade-in" style={{ padding: "12px 20px", borderLeft: "4px solid var(--primary)", backgroundColor: "var(--primary-light)", color: "var(--text-primary)", fontWeight: "600", fontSize: "14px" }}>
          {systemAlert}
        </div>
      )}

      {/* Grid Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Tổng số người dùng</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{users.length} tài khoản</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <Cpu size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Tải CPU máy chủ</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>12.4%</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <HardDrive size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Dung lượng ổ cứng</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>32% / 100 GB</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <Server size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Trạng thái Nodes</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: "var(--success)" }}>3 Đang chạy</h3>
          </div>
        </div>
      </div>

      {/* Nested User Management Section */}
      <div>
        <UserList />
      </div>
    </div>
  );
};

export default AdminDashboard;
