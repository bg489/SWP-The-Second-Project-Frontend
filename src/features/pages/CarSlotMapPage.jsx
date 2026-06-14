import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFloorsRequest,
  fetchSlotsRequest,
  addSlotRequest,
  updateSlotStatusLocal
} from "../floors/floorSlice";
import { mockViolations } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import Select from "../../components/Form/Select";
import FormField from "../../components/Form/FormField";
import { X, ShieldAlert, Sparkles, Wrench, Clock, RefreshCw, Plus } from "lucide-react";

const CarSlotMapPage = () => {
  const dispatch = useDispatch();
  const { floors } = useSelector((state) => state.floors);
  const { slots, loading, error } = useSelector((state) => state.floors); // We keep floors and slots in the same slice

  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Filter CAR floors (Ô tô)
  const carFloors = floors.filter(f => f.type === "Ô tô");

  // Load floors on component mount
  useEffect(() => {
    dispatch(fetchFloorsRequest());
  }, [dispatch]);

  // Set default selected floor
  useEffect(() => {
    if (carFloors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(carFloors[0].id);
    }
  }, [carFloors, selectedFloorId]);

  // Load slots when selected floor changes
  useEffect(() => {
    if (selectedFloorId) {
      dispatch(fetchSlotsRequest(selectedFloorId));
      setSelectedSlot(null); // Clear selected drawer
    }
  }, [dispatch, selectedFloorId]);

  // Status mapping details
  const statusConfig = {
    "trống": { label: "Trống", color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", border: "#64748b" },
    "đang dùng": { label: "Đang dùng", color: "#6366f1", bg: "var(--primary-light)", border: "#6366f1" },
    "đặt trước": { label: "Đặt trước", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.1)", border: "#0ea5e9" },
    "bảo trì": { label: "Bảo trì", color: "#f59e0b", bg: "var(--warning-light)", border: "#f59e0b" },
    "xung đột": { label: "Xung đột", color: "#ef4444", bg: "var(--danger-light)", border: "#ef4444" }
  };

  const handleSlotClick = (slot) => {
    // Check if slot has violations registered
    const violation = mockViolations.find(v => slot.plate && slot.plate.includes(v.plate));
    
    setSelectedSlot({
      ...slot,
      violation: violation || null
    });
  };

  const handleCloseDrawer = () => {
    setSelectedSlot(null);
  };

  // Mock slot state change in Redux for testing purposes
  const toggleSlotState = (slotId, newStatus) => {
    const plate = newStatus === "đang dùng" ? "30F-999.99" : null;
    const checkInTime = newStatus === "đang dùng" ? new Date().toISOString() : null;

    dispatch(updateSlotStatusLocal({
      id: slotId,
      status: newStatus,
      plate,
      checkInTime
    }));

    // Update local drawer state if it matches the current slot
    if (selectedSlot && selectedSlot.id === slotId) {
      setSelectedSlot(prev => ({
        ...prev,
        status: newStatus,
        plate,
        checkInTime
      }));
    }
  };

  const handleAddSlot = () => {
    if (selectedFloorId) {
      dispatch(addSlotRequest({
        floorId: selectedFloorId,
        slotData: {
          slot_number: `C-${slots.length + 1}`
        }
      }));
    }
  };

  return (
    <div style={{ display: "flex", position: "relative", minHeight: "75vh", gap: "24px", flexDirection: "column" }}>
      {/* Page Header and Selector */}
      <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Sơ đồ Vị trí đỗ xe Ô tô</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Bản đồ kiểm soát vị trí đỗ xe của các tầng hầm ô tô. Chọn tầng hầm bên dưới để xem sơ đồ chi tiết.
          </p>
        </div>
        
        {/* Floor Selection & Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "220px" }}>
            <FormField label="Chọn tầng hầm ô tô">
              <Select
                value={selectedFloorId}
                onChange={(e) => setSelectedFloorId(e.target.value)}
                options={carFloors.map(f => ({ value: f.id, label: f.name }))}
                placeholder={carFloors.length === 0 ? "Không có tầng ô tô" : null}
                disabled={carFloors.length === 0}
              />
            </FormField>
          </div>
          <Button
            variant="primary"
            onClick={handleAddSlot}
            disabled={!selectedFloorId || loading}
            icon={Plus}
            style={{ height: "42px" }}
          >
            Tạo thêm ô đỗ
          </Button>
          <Button
            variant="outline"
            onClick={() => selectedFloorId && dispatch(fetchSlotsRequest(selectedFloorId))}
            loading={loading}
            icon={RefreshCw}
            style={{ height: "42px" }}
            title="Tải lại dữ liệu ô đỗ"
          />
        </div>
      </div>

      {/* Main content grid: Map on left, drawer pushes on right */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: "24px", flex: "1 1 500px" }}>
          
          {/* Map Status Legends */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-color)"
          }}>
            {Object.keys(statusConfig).map((statusKey) => {
              const cfg = statusConfig[statusKey];
              return (
                <div key={statusKey} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "4px",
                    backgroundColor: cfg.bg,
                    border: `2px solid ${cfg.border}`
                  }}></span>
                  <span style={{ color: "var(--text-secondary)" }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>

          {/* Slots count overview */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>
            <span>Tổng số ô đỗ: {slots.length}</span>
            <span>Trống: {slots.filter(s => s.status === "trống").length} | Đang dùng: {slots.filter(s => s.status === "đang dùng").length}</span>
          </div>

          {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

          {/* Seat Grid Map */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "12px",
            justifyContent: "center"
          }}>
            {slots.map((slot) => {
              const cfg = statusConfig[slot.status] || statusConfig["trống"];
              const isSelected = selectedSlot && selectedSlot.id === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    height: "65px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: cfg.bg,
                    border: isSelected ? "3px solid var(--text-primary)" : `1.5px solid ${cfg.border}`,
                    color: cfg.color,
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    boxShadow: isSelected ? "var(--shadow-md)" : "none",
                    position: "relative",
                    transition: "all var(--transition-fast)"
                  }}
                  className="theater-seat-slot"
                >
                  <span>{slot.id}</span>
                  {slot.status === "xung đột" && (
                    <span style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      backgroundColor: "var(--danger)",
                      color: "white",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      fontSize: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>!</span>
                  )}
                </button>
              );
            })}
            {slots.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                Không có dữ liệu ô đỗ nào cho tầng hầm này. Vui lòng nhấn "Tạo thêm ô đỗ".
              </div>
            )}
          </div>
        </div>

        {/* Sliding Detail Drawer Panel */}
        {selectedSlot && (
          <div className="card slot-detail-drawer-card animate-slide-in" style={{
            width: "350px",
            padding: "24px",
            borderLeft: `4px solid ${statusConfig[selectedSlot.status].border}`,
            flexShrink: 0
          }}>
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800" }}>Chi tiết ô đỗ {selectedSlot.id}</h3>
              <button
                onClick={handleCloseDrawer}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  padding: "4px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "14px" }}>
              
              {/* Status Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Trạng thái ô đỗ:</span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: statusConfig[selectedSlot.status].bg,
                  color: statusConfig[selectedSlot.status].color,
                  border: `1px solid ${statusConfig[selectedSlot.status].border}`
                }}>
                  {statusConfig[selectedSlot.status].label}
                </span>
              </div>

              {/* Active Parking Session Details */}
              {(selectedSlot.status === "đang dùng" || selectedSlot.status === "xung đột") && (
                <div style={{
                  backgroundColor: "var(--bg-secondary)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Biển số xe ghi nhận:</span>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginTop: "2px" }}>{selectedSlot.plate}</div>
                  </div>
                  {selectedSlot.checkInTime && (
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Thời điểm check-in:</span>
                      <div style={{ fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Clock size={14} /> {new Date(selectedSlot.checkInTime).toLocaleTimeString("vi-VN")} — {new Date(selectedSlot.checkInTime).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conflict Warnings */}
              {selectedSlot.status === "xung đột" && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--danger-light)",
                  color: "var(--danger)",
                  border: "1px solid var(--danger)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Cảnh báo cảm biến!</strong>
                    {selectedSlot.warning || "Phát hiện sai khớp thông tin đỗ."}. Vui lòng cử nhân viên hỗ trợ di chuyển hoặc kiểm tra lại thẻ quét.
                  </div>
                </div>
              )}

              {/* Maintenance status indicator */}
              {selectedSlot.status === "bảo trì" && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--warning-light)",
                  color: "var(--warning)",
                  border: "1px solid var(--warning)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <Wrench size={20} />
                  <span>Ô đỗ đang tạm khóa để bảo trì hoặc kẻ vạch.</span>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid var(--border-color)" }} />

              {/* Mock controls to help testing */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Giao diện mô phỏng (Dành cho Tester)</span>
                {selectedSlot.status === "trống" && (
                  <Button variant="primary" style={{ width: "100%" }} onClick={() => toggleSlotState(selectedSlot.id, "đang dùng")}>
                    Cho xe đỗ vào ô
                  </Button>
                )}
                {selectedSlot.status === "đang dùng" && (
                  <Button variant="outline" style={{ width: "100%" }} onClick={() => toggleSlotState(selectedSlot.id, "trống")}>
                    Giải phóng ô trống
                  </Button>
                )}
                <Button
                  variant="secondary"
                  style={{ width: "100%" }}
                  disabled={selectedSlot.status !== "đang dùng"}
                  onClick={() => toggleSlotState(selectedSlot.id, "xung đột")}
                >
                  Tạo vi phạm / xung đột
                </Button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Embedding Custom styles for slots */}
      <style>{`
        .theater-seat-slot:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CarSlotMapPage;
