import React, { useState } from "react";
import { mockViolations, mockCarSlots, mockMotorbikeFloors } from "../../services/mockParkingData";
import Table from "../../components/Table/Table";
import Button from "../../components/Button/Button";
import {
  FileText,
  TrendingUp,
  Download,
  AlertTriangle,
  Car,
  Layers,
  CircleDot,
  CheckCircle2
} from "lucide-react";

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

  const handleDownload = () => {
    setDownloading(true);
    setDownloadStatus("Đang thu thập dữ liệu báo cáo...");
    setTimeout(() => {
      setDownloadStatus("Đang tổng hợp đồ thị doanh thu...");
      setTimeout(() => {
        setDownloadStatus("Đang tạo tệp PDF...");
        setTimeout(() => {
          setDownloading(false);
          setDownloadStatus("");
          alert("Đã tải xuống tệp báo cáo PDF thành công!");
        }, 800);
      }, 800);
    }, 800);
  };

  // Car slot occupancy calculations
  const totalSlots = mockCarSlots.length;
  const occupiedSlots = mockCarSlots.filter(s => s.status === "đang dùng").length;
  const reservedSlots = mockCarSlots.filter(s => s.status === "đặt trước").length;
  const maintenanceSlots = mockCarSlots.filter(s => s.status === "bảo trì").length;
  const conflictSlots = mockCarSlots.filter(s => s.status === "xung đột").length;
  const emptySlots = mockCarSlots.filter(s => s.status === "trống").length;

  // Motorbike calculations
  const totalMB = mockMotorbikeFloors.reduce((acc, f) => acc + f.capacity, 0);
  const parkedMB = mockMotorbikeFloors.reduce((acc, f) => acc + f.parkedCount, 0);
  const leftMB = totalMB - parkedMB;

  const violationColumns = [
    { header: "Mã lỗi", key: "id", width: "100px" },
    { header: "Biển số xe", key: "plate", width: "120px" },
    { header: "Loại vi phạm", key: "type" },
    { header: "Ngày ghi nhận", key: "date", width: "130px" },
    { header: "Tiền phạt", key: "fine", width: "120px" },
    {
      header: "Thanh toán",
      key: "status",
      render: (row) => {
        const paid = row.status === "Đã thanh toán";
        return (
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: paid ? "var(--success-light)" : "var(--danger-light)",
            color: paid ? "var(--success)" : "var(--danger)"
          }}>{row.status}</span>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* Loading Overlay */}
      {downloading && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          color: "white",
          gap: "16px"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "btn-spin 1s linear infinite"
          }}></div>
          <span style={{ fontSize: "16px", fontWeight: "700" }}>{downloadStatus}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            Báo cáo Vận hành bãi đỗ xe <FileText style={{ color: "var(--primary)" }} />
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Phân tích số liệu thống kê lượt xe gửi, công suất hầm xe máy, tỷ lệ chiếm dụng ô tô và danh sách vi phạm.
          </p>
        </div>
        <Button variant="primary" onClick={handleDownload} icon={Download}>
          Xuất Báo cáo PDF
        </Button>
      </div>

      {/* Key Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Tổng doanh thu đỗ xe</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>124,500,000đ</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Lượt xe vào/ra hôm nay</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>1,842 lượt</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Số vụ vi phạm phạt</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{mockViolations.length} vụ việc</h3>
          </div>
        </div>
      </div>

      {/* Occupancy and Capacity details layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        
        {/* Motorbike occupancy statistics */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} style={{ color: "var(--primary)" }} /> Dung lượng bãi xe máy
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Tổng tỷ lệ chiếm dụng:</span>
                <span style={{ fontWeight: "700" }}>{Math.round((parkedMB / totalMB) * 100)}%</span>
              </div>
              <div style={{ height: "10px", backgroundColor: "var(--bg-secondary)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${(parkedMB / totalMB) * 100}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "5px" }}></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px", fontSize: "13px" }}>
              <div style={{ padding: "10px", backgroundColor: "var(--bg-secondary)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700" }}>TỔNG CHỖ GỬI</span>
                <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "2px" }}>{totalMB}</div>
              </div>
              <div style={{ padding: "10px", backgroundColor: "var(--bg-secondary)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700" }}>CÒN TRỐNG</span>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--success)", marginTop: "2px" }}>{leftMB}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Car slots occupancy details */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <Car size={18} style={{ color: "var(--primary)" }} /> Tình trạng Ô đỗ Ô tô
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontSize: "12px", textAlign: "center" }}>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(100, 116, 139, 0.1)", border: "1px solid #64748b" }}>
              <span style={{ color: "#64748b", fontWeight: "700" }}>Trống:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{emptySlots}</div>
            </div>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "var(--primary-light)", border: "1px solid var(--primary)" }}>
              <span style={{ color: "var(--primary)", fontWeight: "700" }}>Đang đỗ:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{occupiedSlots}</div>
            </div>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(14, 165, 233, 0.1)", border: "1px solid #0ea5e9" }}>
              <span style={{ color: "#0ea5e9", fontWeight: "700" }}>Đặt trước:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{reservedSlots}</div>
            </div>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "var(--warning-light)", border: "1px solid var(--warning)" }}>
              <span style={{ color: "var(--warning)", fontWeight: "700" }}>Bảo trì:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{maintenanceSlots}</div>
            </div>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "var(--danger-light)", border: "1px solid var(--danger)" }}>
              <span style={{ color: "var(--danger)", fontWeight: "700" }}>Xung đột:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{conflictSlots}</div>
            </div>
            <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: "700" }}>Tổng slot:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{totalSlots}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Violations Report Table */}
      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CircleDot size={18} style={{ color: "var(--danger)" }} /> Danh sách Vi phạm trong bãi đỗ
        </h3>
        <Table columns={violationColumns} data={mockViolations} />
      </div>
    </div>
  );
};

export default ReportsPage;
