import React from "react";
import { useMockAuth } from "../../context/MockAuthContext";
import Table from "../../components/Table/Table";
import { TrendingUp, Users, ClipboardCheck, ArrowUpRight, Percent } from "lucide-react";

const ManagerDashboard = () => {
  const { user } = useMockAuth();

  // Mock staff performance data
  const staffData = [
    { id: "S054", name: "Trần Thị B", role: "Support", rating: 4.8, tasks: 42, completed: 40 },
    { id: "S021", name: "Nguyễn Văn Hùng", role: "Kỹ thuật", rating: 4.5, tasks: 38, completed: 35 },
    { id: "S089", name: "Phạm Thúy Vy", role: "Kỹ thuật", rating: 4.9, tasks: 50, completed: 49 },
    { id: "S102", name: "Ngô Quốc Khánh", role: "Hỗ trợ", rating: 4.2, tasks: 24, completed: 20 }
  ];

  const columns = [
    { header: "Mã NV", key: "id" },
    { header: "Nhân viên", key: "name" },
    { header: "Vai trò chuyên môn", key: "role" },
    {
      header: "Đánh giá",
      key: "rating",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: "700", color: "var(--warning)" }}>{row.rating} ★</span>
          <div style={{ width: "80px", height: "6px", borderRadius: "3px", backgroundColor: "var(--border-color)", overflow: "hidden" }}>
            <div style={{ width: `${(row.rating / 5) * 100}%`, height: "100%", backgroundColor: "var(--warning)", borderRadius: "3px" }}></div>
          </div>
        </div>
      )
    },
    { header: "Tổng số Task", key: "tasks" },
    {
      header: "Tỷ lệ hoàn thành",
      key: "completed",
      render: (row) => {
        const pct = Math.round((row.completed / row.tasks) * 100);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>{pct}%</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({row.completed}/{row.tasks})</span>
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome & Target Banner */}
      <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Báo cáo Tổng quan Quản lý</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Xin chào <strong>{user.name}</strong>. Phòng ban của bạn đã đạt <strong>92%</strong> chỉ tiêu tháng này.
          </p>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "var(--success-light)", color: "var(--success)", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
          Target Đạt <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Grid Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Doanh thu tháng</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>124,500,000đ</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Nhân viên tích cực</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>4 Nhân sự</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Tổng số Task xử lý</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>154 Lịch hẹn</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <Percent size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Tỷ lệ SLA đạt</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>97.4%</h3>
          </div>
        </div>
      </div>

      {/* SVG Chart + Staff List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* SVG Graphic Chart */}
        <div className="card" style={{ padding: "24px", gridColumn: "span 2" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "18px" }}>Biểu đồ tăng trưởng doanh số (6 tháng qua)</h3>
          
          <div style={{ width: "100%", overflow: "hidden", display: "flex", justifyContent: "center" }}>
            <svg viewBox="0 0 700 220" width="100%" height="220" style={{ overflow: "visible" }}>
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="30" x2="650" y2="30" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="50" y1="80" x2="650" y2="80" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="50" y1="130" x2="650" y2="130" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="50" y1="180" x2="650" y2="180" stroke="var(--border-color)" />

              {/* Chart line area fill */}
              <path
                d="M 50 180 Q 150 140, 200 120 T 350 90 T 500 50 T 650 30 L 650 180 Z"
                fill="url(#chartGradient)"
              />

              {/* Main curve path */}
              <path
                d="M 50 180 Q 150 140, 200 120 T 350 90 T 500 50 T 650 30"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="50" cy="180" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="170" cy="132" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="290" cy="102" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="410" cy="72" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="530" cy="46" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="650" cy="30" r="5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="3" />

              {/* X Axis Labels */}
              <text x="50" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 1</text>
              <text x="170" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 2</text>
              <text x="290" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 3</text>
              <text x="410" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 4</text>
              <text x="530" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 5</text>
              <text x="650" y="205" fill="var(--text-secondary)" fontSize="12" fontWeight="600" textAnchor="middle">Tháng 6</text>

              {/* Y Axis Labels */}
              <text x="40" y="184" fill="var(--text-muted)" fontSize="11" textAnchor="end">0đ</text>
              <text x="40" y="134" fill="var(--text-muted)" fontSize="11" textAnchor="end">50M</text>
              <text x="40" y="84" fill="var(--text-muted)" fontSize="11" textAnchor="end">100M</text>
              <text x="40" y="34" fill="var(--text-muted)" fontSize="11" textAnchor="end">150M</text>
            </svg>
          </div>
        </div>

        {/* Staff performance table */}
        <div className="card" style={{ padding: "24px", gridColumn: "span 2" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Bảng xếp hạng hiệu năng nhân sự</h3>
          <Table columns={columns} data={staffData} />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
