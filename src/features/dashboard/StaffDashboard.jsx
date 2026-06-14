import React, { useState } from "react";
import { useMockAuth } from "../../context/MockAuthContext";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import { CheckCircle2, Circle, AlertCircle, Play, Eye } from "lucide-react";

const StaffDashboard = () => {
  const { user } = useMockAuth();

  // Mock tasks
  const [tasks, setTasks] = useState([
    { id: "TSK-129", customer: "Lê Văn Tám", service: "Bảo dưỡng định kỳ máy phát", priority: "Cao", status: "Chờ xử lý", deadline: "2026-06-08" },
    { id: "TSK-128", customer: "Trần Thế Anh", service: "Khảo sát hạ tầng mạng công ty", priority: "Trung bình", status: "Đang tiến hành", deadline: "2026-06-09" },
    { id: "TSK-114", customer: "Hoàng Khánh Vy", service: "Tư vấn lắp đặt hệ thống lọc nước", priority: "Cao", status: "Hoàn thành", deadline: "2026-06-05" },
    { id: "TSK-102", customer: "Ngô Quốc Khánh", service: "Cài đặt lại hệ điều hành Linux", priority: "Thấp", status: "Đang tiến hành", deadline: "2026-06-11" }
  ]);

  const [activeTab, setActiveTab] = useState("Tất cả");

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "Tất cả") return true;
    return task.status === activeTab;
  });

  const columns = [
    { header: "Mã Task", key: "id" },
    { header: "Khách hàng", key: "customer" },
    { header: "Nhiệm vụ chuyên môn", key: "service" },
    {
      header: "Độ ưu tiên",
      key: "priority",
      render: (row) => {
        let badgeColor = "";
        if (row.priority === "Cao") badgeColor = "#ef4444";
        if (row.priority === "Trung bình") badgeColor = "#f59e0b";
        if (row.priority === "Thấp") badgeColor = "#64748b";

        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "13px", color: badgeColor }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: badgeColor }}></span>
            {row.priority}
          </span>
        );
      }
    },
    { header: "Hạn chót", key: "deadline" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        let badgeClass = "";
        if (row.status === "Chờ xử lý") badgeClass = "badge-danger";
        if (row.status === "Đang tiến hành") badgeClass = "badge-warning";
        if (row.status === "Hoàn thành") badgeClass = "badge-success";

        return <span className={`status-badge ${badgeClass}`}>{row.status}</span>;
      }
    },
    {
      header: "Hành động",
      key: "actions",
      render: (row) => {
        return (
          <div style={{ display: "flex", gap: "6px" }}>
            {row.status === "Chờ xử lý" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateTaskStatus(row.id, "Đang tiến hành")}
                icon={Play}
              >
                Bắt đầu
              </Button>
            )}
            {row.status === "Đang tiến hành" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateTaskStatus(row.id, "Hoàn thành")}
                icon={CheckCircle2}
              >
                Hoàn thành
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Eye} title="Xem chi tiết" />
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Brand Header */}
      <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Khu vực vận hành nhân viên</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Xin chào <strong>{user.name}</strong> ({user.details}). Theo dõi và xử lý các đầu việc được giao trong ngày của bạn tại đây.
        </p>
      </div>

      {/* Quick stats counter */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger)" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Chờ xử lý</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>
              {tasks.filter(t => t.status === "Chờ xử lý").length}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderLeft: "4px solid var(--warning)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <Circle size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Đang tiến hành</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>
              {tasks.filter(t => t.status === "Đang tiến hành").length}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderLeft: "4px solid var(--success)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Đã hoàn thành</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>
              {tasks.filter(t => t.status === "Hoàn thành").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Task Filter Tab & List Table */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Danh sách công việc của tôi</h3>
          <div className="tabs-container">
            {["Tất cả", "Chờ xử lý", "Đang tiến hành", "Hoàn thành"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filteredTasks} />
      </div>

      {/* Styling specific to tabs */}
      <style>{`
        .tabs-container {
          display: flex;
          background-color: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 6px 14px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-btn.active {
          background-color: var(--card-bg);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .status-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }
        .badge-success {
          background-color: var(--success-light);
          color: var(--success);
        }
        .badge-warning {
          background-color: var(--warning-light);
          color: var(--warning);
        }
        .badge-danger {
          background-color: var(--danger-light);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;
