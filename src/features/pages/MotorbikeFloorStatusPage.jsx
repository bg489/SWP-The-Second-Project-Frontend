import React, { useState } from "react";
import { mockMotorbikeFloors } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import { Plus, Minus, Layers, AlertCircle, CheckCircle } from "lucide-react";

const MotorbikeFloorStatusPage = () => {
  const [floors, setFloors] = useState(mockMotorbikeFloors);

  const handleCheckIn = (floorId) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        if (f.parkedCount >= f.capacity) return f;
        const newCount = f.parkedCount + 1;
        return {
          ...f,
          parkedCount: newCount,
          status: newCount >= f.capacity ? "Đầy chỗ" : "Còn chỗ"
        };
      }
      return f;
    }));
  };

  const handleCheckOut = (floorId) => {
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        if (f.parkedCount <= 0) return f;
        const newCount = f.parkedCount - 1;
        return {
          ...f,
          parkedCount: newCount,
          status: "Còn chỗ"
        };
      }
      return f;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="card" style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Trạng thái Khu vực Xe máy</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Giám sát dung lượng và quản lý số lượng xe máy gửi theo từng tầng hầm. Sử dụng các điều khiển giả lập bên dưới để mô phỏng sự kiện xe ra vào bãi.
        </p>
      </div>

      {/* Floors grid layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {floors.map((floor) => {
          const occupancyRate = Math.round((floor.parkedCount / floor.capacity) * 100);
          const slotsLeft = floor.capacity - floor.parkedCount;
          const isFull = floor.parkedCount >= floor.capacity;

          return (
            <div key={floor.id} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Card Title Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Layers size={20} style={{ color: "var(--primary)" }} /> {floor.name}
                </h3>
                
                <span className={`status-badge-custom ${isFull ? "full" : "available"}`}>
                  {isFull ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <AlertCircle size={14} /> Đầy chỗ
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={14} /> Còn chỗ
                    </span>
                  )}
                </span>
              </div>

              {/* Progress visual bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Tỷ lệ lấp đầy:</span>
                  <span style={{ color: isFull ? "var(--danger)" : "var(--primary)" }}>{occupancyRate}%</span>
                </div>
                
                <div style={{
                  height: "12px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)"
                }}>
                  <div style={{
                    width: `${occupancyRate}%`,
                    height: "100%",
                    backgroundColor: isFull ? "var(--danger)" : "var(--primary)",
                    borderRadius: "6px",
                    transition: "width 0.3s ease-out"
                  }}></div>
                </div>
              </div>

              {/* Occupancy Stats grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                textAlign: "center",
                backgroundColor: "var(--bg-secondary)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)"
              }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>SỨC CHỨA</span>
                  <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "2px" }}>{floor.capacity}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>ĐANG GỬI</span>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)", marginTop: "2px" }}>{floor.parkedCount}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>CÒN TRỐNG</span>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: isFull ? "var(--danger)" : "var(--success)", marginTop: "2px" }}>{slotsLeft}</div>
                </div>
              </div>

              {/* Mock check-in and out controls */}
              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  variant="primary"
                  onClick={() => handleCheckIn(floor.id)}
                  disabled={isFull}
                  style={{ flex: 1 }}
                  icon={Plus}
                >
                  + Xe vào
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCheckOut(floor.id)}
                  disabled={floor.parkedCount <= 0}
                  style={{ flex: 1 }}
                  icon={Minus}
                >
                  - Xe ra
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedding Custom styles for motorbike floors status */}
      <style>{`
        .status-badge-custom {
          display: inline-flex;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        .status-badge-custom.available {
          background-color: var(--success-light);
          color: var(--success);
        }
        .status-badge-custom.full {
          background-color: var(--danger-light);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
};

export default MotorbikeFloorStatusPage;
