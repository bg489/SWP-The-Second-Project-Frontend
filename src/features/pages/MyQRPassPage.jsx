import React, { useState } from "react";
import { mockVehicles } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import { QrCode, Calendar, Info, ShieldAlert, ShieldCheck, Minimize2, Maximize2 } from "lucide-react";

const MyQRPassPage = () => {
  // Let's add an expired vehicle mock to test both states: "Còn hạn" & "Hết hạn"
  const qrPassesList = [
    ...mockVehicles.filter(v => v.status === "Đã duyệt" && v.package && v.package !== "Chưa đăng ký"),
    {
      id: "V004",
      plate: "29C-555.22",
      type: "Ô tô",
      status: "Đã duyệt",
      package: "Gói tháng ô tô thường",
      expires: "2026-05-10", // Expired
      owner: "Nguyễn Văn A"
    }
  ];

  const [activeModalPass, setActiveModalPass] = useState(null);

  // Check if a pass is expired compared to a fixed current date (2026-06-07)
  const isExpired = (expiryDateStr) => {
    if (!expiryDateStr) return true;
    const expiry = new Date(expiryDateStr);
    const currentDate = new Date("2026-06-07");
    return expiry < currentDate;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="card" style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Mã QR Pass của tôi</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Sử dụng mã QR kỹ thuật số dưới đây để quẹt quét ra/vào tại bãi đỗ xe tự động. Các phương tiện cần đăng ký gói tháng và được duyệt mới có QR Pass.
        </p>
      </div>

      {/* QR Passes Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px"
      }}>
        {qrPassesList.map((pass) => {
          const expired = isExpired(pass.expires);
          return (
            <div key={pass.id} className="card qr-pass-card" style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              borderTop: expired ? "6px solid var(--danger)" : "6px solid var(--success)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Header inside Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{pass.plate}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{pass.type}</span>
                </div>
                
                <span className={`status-badge-custom ${expired ? "expired" : "active"}`}>
                  {expired ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldAlert size={14} /> Hết hạn
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={14} /> Còn hạn
                    </span>
                  )}
                </span>
              </div>

              {/* QR and Details Layout */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                {/* QR Code Container */}
                <div
                  onClick={() => setActiveModalPass(pass)}
                  style={{
                    width: "110px",
                    height: "110px",
                    backgroundColor: "white",
                    padding: "8px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "zoom-in",
                    position: "relative",
                    flexShrink: 0
                  }}
                  className="qr-img-wrapper"
                  title="Nhấn để phóng to"
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ opacity: expired ? 0.35 : 1 }}>
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
                  {expired && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--danger)"
                    }}>
                      <ShieldAlert size={28} />
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Gói tháng:</span>
                    <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{pass.package}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Hạn dùng:</span>
                    <div style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> {pass.expires}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips banner inside card */}
              <div style={{
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: expired ? "var(--danger-light)" : "var(--bg-secondary)",
                color: expired ? "var(--danger)" : "var(--text-secondary)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <Info size={16} />
                <span>
                  {expired
                    ? "Vui lòng mua thêm gói cước để kích hoạt lại QR Pass này."
                    : "Hướng QR này vào máy quét khi vào hoặc ra khỏi hầm đỗ xe."}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Zoom Modal Dialog */}
      {activeModalPass && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "20px"
        }} onClick={() => setActiveModalPass(null)}>
          <div className="card animate-fade-in" style={{
            maxWidth: "380px",
            width: "100%",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            textAlign: "center",
            boxShadow: "var(--shadow-premium)"
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700" }}>Quét mã QR để Check-in/out</span>
              <button
                onClick={() => setActiveModalPass(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <Minimize2 size={20} />
              </button>
            </div>

            <div style={{
              width: "240px",
              height: "240px",
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)"
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

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>{activeModalPass.plate}</h2>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                Gói tháng: {activeModalPass.package}
              </span>
            </div>

            <Button variant="outline" onClick={() => setActiveModalPass(null)}>
              Đóng lại
            </Button>
          </div>
        </div>
      )}

      {/* Embedding Custom styles for QR Pass Badge */}
      <style>{`
        .status-badge-custom {
          display: inline-flex;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        .status-badge-custom.active {
          background-color: var(--success-light);
          color: var(--success);
        }
        .status-badge-custom.expired {
          background-color: var(--danger-light);
          color: var(--danger);
        }
        .qr-img-wrapper:hover {
          border-color: var(--primary) !important;
          box-shadow: var(--shadow-md);
          transform: scale(1.02);
          transition: all var(--transition-fast);
        }
      `}</style>
    </div>
  );
};

export default MyQRPassPage;
