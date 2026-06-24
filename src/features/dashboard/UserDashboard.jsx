import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  monthlyPackages,
  monthlyPasses,
  parkingSessions,
  slotRegistrations,
  vehicles,
} from "../../services/mockParkingData";
import { Calendar, Car, Clock, CreditCard, Plus, QrCode, ShieldCheck } from "lucide-react";

const UserDashboard = () => {
  const { user } = useMockAuth();
  const navigate = useNavigate();
  const myVehicles = vehicles.filter((vehicle) => vehicle.userId === user.id);
  const myPasses = monthlyPasses.filter((pass) => pass.userId === user.id);
  const myActiveSession = parkingSessions.find((session) => session.userId === user.id && session.status === "ACTIVE");
  const pendingRegistration = slotRegistrations.find((registration) => registration.userId === user.id && registration.status === "PENDING_PAYMENT");

  const columns = [
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Hãng / màu", key: "brand", render: (row) => `${row.brand} - ${row.color}` },
    {
      header: "Duyệt xe",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Gói tháng",
      key: "pass",
      render: (row) => {
        const activePass = myPasses.find((pass) => pass.vehicleId === row.id && pass.status === "ACTIVE");
        return activePass ? `${activePass.packageName} đến ${formatDate(activePass.endDate)}` : "Chưa có";
      },
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <ShieldCheck size={16} /> Cư dân
          </div>
          <h1 className="page-title">Xin chào, {user.name}. Mã QR của bạn đã sẵn sàng.</h1>
          <p className="page-subtitle">
            Quản lý xe đã duyệt, mua gói tháng theo từng phương tiện và theo dõi phiên gửi xe hiện tại.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Lượt đang gửi</span>
          <span className="page-hero-number">{myActiveSession ? myActiveSession.slotCode || "MB" : "0"}</span>
          <span className="page-hero-label">{myActiveSession ? myActiveSession.plateNumber : "Không có xe trong bãi"}</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Xe của tôi</div>
          <div className="metric-value">{myVehicles.length}</div>
          <div className="metric-note">{myVehicles.filter((v) => v.status === "APPROVED").length} xe đã duyệt</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">QR gói tháng</div>
          <div className="metric-value">{myPasses.filter((pass) => pass.status === "ACTIVE").length}</div>
          <div className="metric-note">Mỗi QR chỉ hợp lệ cho đúng xe</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CreditCard size={22} /></div>
          <div className="metric-label">Chờ thanh toán</div>
          <div className="metric-value">{pendingRegistration ? formatCurrency(pendingRegistration.amount) : "0đ"}</div>
          <div className="metric-note">{pendingRegistration ? pendingRegistration.plateNumber : "Không có đăng ký mới"}</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Clock size={19} /> Phiên gửi xe hiện tại</h2>
              <p className="section-copy">Theo dõi xe của bạn khi đang gửi trong bãi.</p>
            </div>
            <Button variant="primary" icon={QrCode} onClick={() => navigate("/user/qr-pass")}>
              Xem QR
            </Button>
          </div>

          {myActiveSession ? (
            <div className="soft-panel">
              <div className="data-list">
                <div className="data-row"><span>Mã lượt gửi</span><strong>{myActiveSession.id}</strong></div>
                <div className="data-row"><span>Xe</span><strong>{myActiveSession.plateNumber} - {getVehicleTypeLabel(myActiveSession.vehicleType)}</strong></div>
                <div className="data-row"><span>Khu vực</span><strong>{myActiveSession.floorName}</strong></div>
                <div className="data-row"><span>Vị trí</span><strong>{myActiveSession.slotCode || "Khu xe máy"}</strong></div>
                <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(myActiveSession.checkInAt)}</strong></div>
                <div className="data-row"><span>Thanh toán</span><strong>{getStatusLabel(myActiveSession.paymentStatus)}</strong></div>
              </div>
            </div>
          ) : (
            <div className="soft-panel">Hiện chưa có phiên gửi xe đang mở.</div>
          )}
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Calendar size={19} /> Gói tháng có thể mua</h2>
            <p className="section-copy">Cư dân chọn xe đã duyệt rồi thanh toán qua VNPay.</p>
            </div>
          </div>
          <div className="data-list">
            {monthlyPackages.map((pkg) => (
              <div className="soft-panel" key={pkg.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <strong>{pkg.name}</strong>
                    <div className="metric-note">{getVehicleTypeLabel(pkg.vehicleType)} - {pkg.duration}</div>
                  </div>
                  <strong>{formatCurrency(pkg.price)}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Phương tiện của tôi</h2>
            <p className="section-copy">Tạo xe mới ở trang hồ sơ, quản trị viên duyệt trước khi QR/gói tháng hợp lệ.</p>
          </div>
          <Button variant="secondary" icon={Plus} onClick={() => navigate("/user/profile")}>
            Đăng ký xe
          </Button>
        </div>
        <Table columns={columns} data={myVehicles} />
      </section>
    </div>
  );
};

export default UserDashboard;
