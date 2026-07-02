import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import {
  fetchActiveParkingSessionsRequest,
  fetchTempQrCardsRequest,
  fetchViolationsRequest,
} from "../backend/parking/parkingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Building2, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const { floors, loading: floorsLoading } = useSelector((state) => state.floors);
  const { parkingSessions, tempQrCards, violations } = useSelector((state) => state.parking);

  const buildingId = user?.buildingId;

  useEffect(() => {
    dispatch(fetchActiveParkingSessionsRequest(buildingId ? { buildingId } : undefined));
    dispatch(fetchFloorsRequest({ buildingId, status: "ACTIVE", limit: 100 }));
    dispatch(fetchTempQrCardsRequest({ buildingId, status: "READY" }));
    dispatch(fetchViolationsRequest());
  }, [buildingId, dispatch]);

  const activeSessions = parkingSessions.active;
  const motorbikeFloors = floors.filter((floor) => floor.floorType === "MOTORBIKE");
  const carFloors = floors.filter((floor) => floor.floorType === "CAR");
  const motorbikeLeft = motorbikeFloors.reduce(
    (sum, floor) => sum + Math.max(Number(floor.capacity || 0) - Number(floor.currentCount || 0), 0),
    0
  );
  const availableCarSlots = carFloors.reduce((sum, floor) => {
    const availableFromSlots = Array.isArray(floor.slots)
      ? floor.slots.filter((slot) => slot.status === "AVAILABLE").length
      : 0;
    return sum + Number(floor.availableSlotCount || availableFromSlots || 0);
  }, 0);
  const readyQr = tempQrCards.items.filter((card) => card.status === "READY").length;
  const openViolations = violations.items.filter((violation) =>
    ["OPEN", "UNPAID", "RESOLVED"].includes(violation.status)
  );

  const queue = useMemo(() => {
    const rows = [];
    const newestSession = activeSessions[0];
    const newestViolation = openViolations[0];

    if (newestSession) {
      rows.push({
        id: `SESSION-${newestSession.id}`,
        title: `Xe đang trong bãi: ${newestSession.plateNumber}`,
        desc: `${getVehicleTypeLabel(newestSession.vehicleType)} - ${newestSession.slotCode || "Khu xe máy"}`,
        action: "Theo dõi",
      });
    }

    if (readyQr > 0) {
      rows.push({
        id: "TEMP-QR",
        title: "QR tạm sẵn sàng",
        desc: `${readyQr} thẻ có thể phát cho khách gửi lẻ.`,
        action: "Có thể dùng",
      });
    }

    if (newestViolation) {
      rows.push({
        id: `VIOLATION-${newestViolation.id}`,
        title: `Vi phạm: ${newestViolation.plateNumber}`,
        desc: newestViolation.violationType || newestViolation.type || "Cần kiểm tra",
        action: "Cần thu",
      });
    }

    return rows;
  }, [activeSessions, openViolations, readyQr]);

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
          <h1 className="page-title">Bàn vận hành của {user?.name || "nhân viên"}</h1>
          <p className="page-subtitle">
            Dữ liệu trong ca trực được lấy trực tiếp từ hệ thống: sức chứa, phiên đang gửi, QR tạm và vi phạm.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang trong bãi</span>
          <span className="page-hero-number">{activeSessions.length}</span>
          <span className="page-hero-label">lượt đang gửi</span>
        </div>
      </section>

      <StatusBanner errors={[parkingSessions.error, tempQrCards.error, violations.error]} />

      <section className="card soft-panel">
        <div className="data-row">
          <span><Building2 size={16} /> Tòa nhà đang trực</span>
          <strong>{user?.buildingName || "Chưa có tòa nhà"}</strong>
        </div>
        <div className="data-row">
          <span>Địa chỉ</span>
          <strong>{user?.buildingAddress || "Chưa có địa chỉ"}</strong>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><Layers size={22} /></div>
          <div className="metric-label">Xe máy còn chỗ</div>
          <div className="metric-value">{motorbikeLeft}</div>
          <div className="metric-note">{floorsLoading ? "Đang tải sức chứa" : "Theo tòa nhà đang trực"}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Ô ô tô trống</div>
          <div className="metric-value">{availableCarSlots}</div>
          <div className="metric-note">Từ danh sách ô thật</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">QR tạm sẵn sàng</div>
          <div className="metric-value">{readyQr}</div>
          <div className="metric-note">Phát cho khách gửi lẻ</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm cần thu</div>
          <div className="metric-value">{openViolations.length}</div>
          <div className="metric-note">Cộng vào phí khi xe ra</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ArrowDownLeft size={19} /> Việc cần chú ý tại cổng</h2>
              <p className="section-copy">Tổng hợp từ dữ liệu đang mở trong hệ thống.</p>
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
            {queue.length === 0 && <div className="soft-panel">Chưa có việc cần chú ý trong ca trực.</div>}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Vi phạm cần chú ý</h2>
              <p className="section-copy">Các khoản còn cần xử lý khi xe ra bãi.</p>
            </div>
          </div>
          <div className="data-list">
            {openViolations.slice(0, 3).map((violation) => (
              <div className="soft-panel" key={violation.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{violation.plateNumber}</strong>
                  <span className={`pill ${getStatusTone(violation.status)}`}>{getStatusLabel(violation.status)}</span>
                </div>
                <p className="section-copy">{violation.violationType || violation.type}</p>
                <strong>{formatCurrency(violation.penaltyFee || violation.fine || 0)}</strong>
              </div>
            ))}
            {openViolations.length === 0 && <div className="soft-panel">Chưa có vi phạm cần thu.</div>}
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
        <Table columns={sessionColumns} data={activeSessions} loading={parkingSessions.loading} />
      </section>
    </div>
  );
};

export default StaffDashboard;
