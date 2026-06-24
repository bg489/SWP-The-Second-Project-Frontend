import { useMemo, useState } from "react";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  carSlots,
  floors,
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  parkingSessions,
  tempQrCards,
  violations,
} from "../../services/mockParkingData";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

const StaffDashboard = () => {
  const { user } = useMockAuth();
  const [activeSessions] = useState(parkingSessions.filter((session) => session.status === "ACTIVE"));

  const motorbikeLeft = floors
    .filter((floor) => floor.floorType === "MOTORBIKE")
    .reduce((sum, floor) => sum + floor.capacity - floor.currentCount, 0);
  const availableCarSlots = carSlots.filter((slot) => slot.status === "AVAILABLE").length;
  const readyQr = tempQrCards.filter((card) => card.status === "READY").length;
  const unpaidViolations = violations.filter((violation) => violation.status === "UNPAID").length;

  const queue = useMemo(
    () => [
      { id: "IN-01", title: "Khách ô tô vãng lai", desc: "Nhập biển 51G-776.51, gán ô C-09, phát QR TMP-002.", action: "Đã gán ô" },
      { id: "IN-02", title: "Cư dân xe máy có gói", desc: "QR-MB-59S1-22345 hợp lệ, cho vào B1 nếu còn chỗ.", action: "Cho vào" },
      { id: "OUT-01", title: "Ô tô chờ thanh toán", desc: "SESS-0990 có phí 400.000đ gồm vi phạm.", action: "Thu phí" },
    ],
    []
  );

  const sessionColumns = [
    { header: "Phiên", key: "id" },
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại khách", key: "customerType", render: (row) => (row.customerType === "REGISTERED_USER" ? "Cư dân" : "Khách vãng lai") },
    { header: "Xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Vị trí", key: "slotCode", render: (row) => row.slotCode || "Khu xe máy" },
    { header: "Giờ vào", key: "checkInAt", render: (row) => formatDateTime(row.checkInAt) },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> Nhân viên cổng</div>
          <h1 className="page-title">Bàn vận hành của {user.name}</h1>
          <p className="page-subtitle">
            Quét QR, nhập biển số, phát QR tạm, gán ô đỗ ô tô, kiểm tra vi phạm và xác nhận xe ra/vào.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang trong bãi</span>
          <span className="page-hero-number">{activeSessions.length}</span>
          <span className="page-hero-label">lượt đang gửi</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><Layers size={22} /></div>
          <div className="metric-label">Xe máy còn chỗ</div>
          <div className="metric-value">{motorbikeLeft}</div>
          <div className="metric-note">Theo sức chứa, không gán ô riêng</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Ô đỗ ô tô trống</div>
          <div className="metric-value">{availableCarSlots}</div>
          <div className="metric-note">Chỉ chọn ô hợp lệ</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">QR tạm sẵn sàng</div>
          <div className="metric-value">{readyQr}</div>
          <div className="metric-note">Phát như thẻ xe vật lý</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm chưa thu</div>
          <div className="metric-value">{unpaidViolations}</div>
          <div className="metric-note">Cộng vào phí khi xe ra</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ArrowDownLeft size={19} /> Hàng đợi xử lý tại cổng</h2>
              <p className="section-copy">Các việc thường gặp trong ca trực tại cổng xe.</p>
            </div>
            <div className="action-row">
              <Button variant="primary" icon={ArrowDownLeft} onClick={() => (window.location.pathname = "/staff/check-in")}>Xe vào</Button>
              <Button variant="outline" icon={ArrowUpRight} onClick={() => (window.location.pathname = "/staff/check-out")}>Xe ra</Button>
            </div>
          </div>
          <div className="timeline">
            {queue.map((item, index) => (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-dot">{index + 1}</div>
                <div className="soft-panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{item.title}</strong>
                    <span className="pill success">{item.action}</span>
                  </div>
                  <p className="section-copy">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Vi phạm cần chú ý</h2>
              <p className="section-copy">Nhân viên ghi nhận thủ công khi phát hiện xe đỗ sai hoặc mất thẻ.</p>
            </div>
          </div>
          <div className="data-list">
            {violations.slice(0, 3).map((violation) => (
              <div className="soft-panel" key={violation.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{violation.plateNumber}</strong>
                  <span className={`pill ${getStatusTone(violation.status)}`}>{getStatusLabel(violation.status)}</span>
                </div>
                <p className="section-copy">{violation.type}</p>
                <strong>{formatCurrency(violation.fine)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Phiên gửi xe đang mở</h2>
            <p className="section-copy">Danh sách xe đang ở trong bãi để đối chiếu khi xe ra vào.</p>
          </div>
        </div>
        <Table columns={sessionColumns} data={activeSessions} />
      </section>
    </div>
  );
};

export default StaffDashboard;
