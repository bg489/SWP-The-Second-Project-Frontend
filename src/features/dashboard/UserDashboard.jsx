import React, { useState, useEffect } from "react";
import { useMockAuth } from "../../context/MockAuthContext";
import { mockVehicles, mockActiveSession } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import {
  Car,
  QrCode,
  Clock,
  CheckCircle,
  FileClock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

const UserDashboard = () => {
  const { user } = useMockAuth();
  
  // Calculate stats from mock data
  const registeredCount = mockVehicles.filter(v => v.status === "Đã duyệt").length;
  const pendingCount = mockVehicles.filter(v => v.status === "Chờ duyệt").length;
  const activePackages = mockVehicles.filter(v => v.package && v.package !== "Chưa đăng ký");

  // Real-time ticking counter for the active parking session
  const [elapsedTime, setElapsedTime] = useState("");
  
  useEffect(() => {
    const checkIn = new Date(mockActiveSession.checkInTime);
    
    const calculateElapsed = () => {
      const now = new Date();
      const diffMs = now - checkIn;
      
      if (diffMs < 0) {
        setElapsedTime("0 giờ 0 phút 0 giây");
        return;
      }
      
      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;
      
      setElapsedTime(`${hours} giờ ${minutes} phút ${seconds} giây`);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        padding: "28px",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <span style={{
            fontSize: "11px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
            marginBottom: "12px"
          }}>
            Khách hàng cá nhân
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "6px" }}>Xin chào, {user.name}!</h1>
          <p style={{ opacity: "0.9", fontSize: "14px" }}>
            Mã định danh của bạn là <strong>{user.id}</strong>. Quản lý phương tiện và theo dõi lịch sử gửi xe thời gian thực.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <Button variant="secondary" size="md" icon={QrCode} onClick={() => window.location.pathname = "/user/qr-pass"}>
            Mã QR Pass của tôi
          </Button>
        </div>
        
        {/* Decorative background lights */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none"
        }}></div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Xe đã duyệt</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{registeredCount} xe</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <FileClock size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Xe chờ duyệt</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{pendingCount} xe</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <Car size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>Gói tháng hoạt động</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{activePackages.length} gói</h3>
          </div>
        </div>
      </div>

      {/* Dynamic Grid: Active Session & QR Pass Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        
        {/* Parking Session Card */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={18} style={{ color: "var(--primary)" }} /> Phiên gửi xe hiện tại
            </h3>
            <span style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "4px", backgroundColor: "var(--success-light)", color: "var(--success)", fontWeight: "700" }}>
              Đang trong bãi
            </span>
          </div>

          <div style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Phương tiện:</span>
              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{mockActiveSession.plate} ({mockActiveSession.type})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Vị trí đỗ ô tô:</span>
              <span style={{ fontWeight: "800", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                Slot {mockActiveSession.slot} <Sparkles size={14} />
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Thời gian vào:</span>
              <span style={{ fontWeight: "600" }}>14:30 - Hôm nay (07/06)</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-color)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", padding: "8px 0 0" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Thời gian gửi lũy kế:</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", fontFamily: "monospace" }}>{elapsedTime}</span>
            </div>
          </div>
        </div>

        {/* Short QR Digital Pass Summary */}
        <div className="card" style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "linear-gradient(135deg, var(--card-bg) 0%, var(--bg-primary) 100%)",
          position: "relative"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <QrCode size={18} style={{ color: "var(--primary)" }} /> Vé QR tháng kỹ thuật số
          </h3>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            border: "1px solid var(--card-border)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--card-bg)"
          }}>
            {/* Mock QR SVG representation */}
            <div style={{
              width: "90px",
              height: "90px",
              backgroundColor: "white",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-sm)"
            }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="10" height="10" x="0" y="0" fill="black" />
                <rect width="10" height="10" x="20" y="0" fill="black" />
                <rect width="10" height="10" x="0" y="20" fill="black" />
                <rect width="10" height="10" x="20" y="20" fill="black" />
                
                <rect width="10" height="10" x="70" y="0" fill="black" />
                <rect width="10" height="10" x="90" y="0" fill="black" />
                <rect width="10" height="10" x="70" y="20" fill="black" />
                <rect width="10" height="10" x="90" y="20" fill="black" />
                
                <rect width="10" height="10" x="0" y="70" fill="black" />
                <rect width="10" height="10" x="20" y="70" fill="black" />
                <rect width="10" height="10" x="0" y="90" fill="black" />
                <rect width="10" height="10" x="20" y="90" fill="black" />

                <rect width="10" height="10" x="40" y="40" fill="black" />
                <rect width="10" height="10" x="60" y="40" fill="black" />
                <rect width="10" height="10" x="40" y="60" fill="black" />
                <rect width="20" height="10" x="70" y="70" fill="black" />
                <rect width="10" height="20" x="50" y="80" fill="black" />
              </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>{mockVehicles[1].plate}</span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{mockVehicles[1].package}</span>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "var(--success)",
                backgroundColor: "var(--success-light)",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-block",
                alignSelf: "flex-start",
                marginTop: "4px"
              }}>
                Còn hạn đến: 15/07/2026
              </span>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => window.location.pathname = "/user/qr-pass"} icon={ExternalLink}>
            Xem chi tiết mã QR Pass
          </Button>
        </div>

      </div>

      {/* Monthly Packages List */}
      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Các phương tiện đăng ký gói tháng của tôi</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px" }}>Biển số xe</th>
                <th style={{ padding: "12px" }}>Loại xe</th>
                <th style={{ padding: "12px" }}>Trạng thái đăng ký</th>
                <th style={{ padding: "12px" }}>Gói tháng hiện tại</th>
                <th style={{ padding: "12px" }}>Ngày hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicles.map((vehicle) => (
                <tr key={vehicle.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: "700" }}>{vehicle.plate}</td>
                  <td style={{ padding: "14px 12px" }}>{vehicle.type}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: vehicle.status === "Đã duyệt" ? "var(--success-light)" : "var(--warning-light)",
                      color: vehicle.status === "Đã duyệt" ? "var(--success)" : "var(--warning)"
                    }}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>{vehicle.package}</td>
                  <td style={{ padding: "14px 12px", color: vehicle.expires ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {vehicle.expires || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
