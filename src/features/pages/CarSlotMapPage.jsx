import { useState } from "react";
import Button from "../../components/Button/Button";
import {
  carSlots as mockCarSlots,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  violations,
} from "../../services/mockParkingData";
import { AlertTriangle, Car, CheckCircle, ShieldAlert, Wrench, X } from "lucide-react";

const slotClass = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
  LOCKED: "locked",
  CONFLICT: "conflict",
};

const getSizeLabel = (value) => {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "STANDARD") return "Tiêu chuẩn";
  if (normalized === "LARGE") return "Rộng";
  return value || "-";
};

const CarSlotMapPage = () => {
  const [slots, setSlots] = useState(mockCarSlots);
  const [selectedSlot, setSelectedSlot] = useState(slots.find((slot) => slot.status === "CONFLICT") || slots[0]);

  const updateSlot = (slotId, status) => {
    setSlots((rows) =>
      rows.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              status,
              plateNumber: status === "OCCUPIED" ? "51A-202.66" : null,
              checkInAt: status === "OCCUPIED" ? "2026-06-11T12:00:00+07:00" : null,
            }
          : slot
      )
    );
    setSelectedSlot((slot) =>
      slot?.id === slotId
        ? {
            ...slot,
            status,
            plateNumber: status === "OCCUPIED" ? "51A-202.66" : null,
            checkInAt: status === "OCCUPIED" ? "2026-06-11T12:00:00+07:00" : null,
          }
        : slot
    );
  };

  const summary = {
    available: slots.filter((slot) => slot.status === "AVAILABLE").length,
    occupied: slots.filter((slot) => slot.status === "OCCUPIED").length,
    reserved: slots.filter((slot) => slot.status === "RESERVED").length,
    conflict: slots.filter((slot) => slot.status === "CONFLICT").length,
  };

  const violation = selectedSlot
    ? violations.find((item) => selectedSlot.plateNumber && selectedSlot.plateNumber.includes(item.plateNumber))
    : null;

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Car size={16} /> Ô đỗ ô tô</div>
          <h1 className="page-title">Sơ đồ ô đỗ ô tô và các vị trí cần kiểm tra</h1>
          <p className="page-subtitle">
            Ô tô phải được gán ô đỗ cụ thể. Nhân viên xác nhận vị trí cuối cùng và xử lý nếu xe đỗ sai.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Ô trống</span>
          <span className="page-hero-number">{summary.available}</span>
          <span className="page-hero-label">trên {slots.length} ô</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card"><div className="metric-label">Trống</div><div className="metric-value">{summary.available}</div></div>
        <div className="card metric-card"><div className="metric-label">Đang dùng</div><div className="metric-value">{summary.occupied}</div></div>
        <div className="card metric-card"><div className="metric-label">Đã đặt</div><div className="metric-value">{summary.reserved}</div></div>
        <div className="card metric-card"><div className="metric-label">Xung đột</div><div className="metric-value">{summary.conflict}</div></div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Car size={19} /> Sơ đồ tầng B3</h2>
              <p className="section-copy">Bấm từng ô để xem chi tiết và đổi trạng thái vận hành.</p>
            </div>
          </div>
          <div className="action-row" style={{ marginBottom: 16 }}>
            {["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "LOCKED", "CONFLICT"].map((status) => (
              <span className={`pill ${getStatusTone(status)}`} key={status}>{getStatusLabel(status)}</span>
            ))}
          </div>
          <div className="slot-map-grid">
            {slots.map((slot) => (
              <button
                className={`slot-tile ${slotClass[slot.status]} ${selectedSlot?.id === slot.id ? "selected" : ""}`}
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
              >
                <div>{slot.slotCode}</div>
                <small>{getStatusLabel(slot.status)}</small>
              </button>
            ))}
          </div>
        </section>

        {selectedSlot && (
          <section className="card section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Car size={19} /> Ô {selectedSlot.slotCode}</h2>
                <p className="section-copy">{getSizeLabel(selectedSlot.sizeLabel)} - {selectedSlot.note || "Không có ghi chú vận hành."}</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedSlot(null)} aria-label="Đóng chi tiết">
                <X size={18} />
              </button>
            </div>

            <div className="data-list">
              <div className="data-row"><span>Trạng thái</span><strong>{getStatusLabel(selectedSlot.status)}</strong></div>
              <div className="data-row"><span>Biển số</span><strong>{selectedSlot.plateNumber || "-"}</strong></div>
              <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(selectedSlot.checkInAt)}</strong></div>
            </div>

            {selectedSlot.status === "CONFLICT" && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill danger"><ShieldAlert size={14} /> Cần nhân viên kiểm tra</span>
                <p className="section-copy">Có thể là đỗ sai ô, chiếm ô đã đặt hoặc không khớp QR.</p>
              </div>
            )}

            {selectedSlot.status === "MAINTENANCE" && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill warning"><Wrench size={14} /> Đang bảo trì</span>
                <p className="section-copy">Không phân ô này cho xe mới.</p>
              </div>
            )}

            {violation && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill danger"><AlertTriangle size={14} /> Vi phạm đã ghi nhận</span>
                <p className="section-copy">{violation.type}</p>
              </div>
            )}

            <div className="action-row" style={{ marginTop: 18 }}>
              <Button variant="primary" icon={CheckCircle} disabled={selectedSlot.status !== "AVAILABLE"} onClick={() => updateSlot(selectedSlot.id, "OCCUPIED")}>
                Gán xe vào ô
              </Button>
              <Button variant="outline" disabled={selectedSlot.status !== "OCCUPIED"} onClick={() => updateSlot(selectedSlot.id, "AVAILABLE")}>
                Giải phóng ô
              </Button>
              <Button variant="secondary" disabled={selectedSlot.status !== "OCCUPIED"} onClick={() => updateSlot(selectedSlot.id, "CONFLICT")}>
                Báo cần kiểm tra
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CarSlotMapPage;
