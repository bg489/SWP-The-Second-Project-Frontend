import { useState } from "react";
import Button from "../../components/Button/Button";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  monthlyPackages,
  monthlyPasses,
  slotRegistrations,
  vehicles,
} from "../../services/mockParkingData";
import { Calendar, CreditCard, QrCode, ShieldCheck, X } from "lucide-react";

const MyQRPassPage = () => {
  const { user } = useMockAuth();
  const [selectedPass, setSelectedPass] = useState(null);
  const myPasses = monthlyPasses.filter((pass) => pass.userId === user.id);
  const myVehicles = vehicles.filter((vehicle) => vehicle.userId === user.id);
  const pendingRegistrations = slotRegistrations.filter((registration) => registration.userId === user.id);

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> QR Digital Pass</div>
          <h1 className="page-title">QR dùng để xác thực xe vào/ra và thay thẻ vật lý</h1>
          <p className="page-subtitle">
            Mỗi QR gắn với đúng một phương tiện. Nếu hết hạn, sai xe hoặc xe chưa duyệt, staff xử lý như xe không có gói hợp lệ.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">QR còn hạn</span>
          <span className="page-hero-number">{myPasses.filter((pass) => pass.status === "ACTIVE").length}</span>
          <span className="page-hero-label">pass</span>
        </div>
      </section>

      <div className="dashboard-grid">
        {myPasses.map((pass) => (
          <div className="card section-card" key={pass.id}>
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {pass.plateNumber}</h2>
                <p className="section-copy">{pass.packageName} - {getVehicleTypeLabel(pass.vehicleType)}</p>
              </div>
              <span className={`pill ${getStatusTone(pass.status)}`}>{getStatusLabel(pass.status)}</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button className="qr-box" onClick={() => setSelectedPass(pass)} aria-label={`Phóng to QR ${pass.plateNumber}`}>
                <div className="mock-qr" />
              </button>
              <div className="data-list" style={{ flex: 1 }}>
                <div className="data-row"><span>Hiệu lực</span><strong>{formatDate(pass.startDate)} - {formatDate(pass.endDate)}</strong></div>
                <div className="data-row"><span>Giá trị gói</span><strong>{formatCurrency(pass.amount)}</strong></div>
                <div className="data-row"><span>Mã QR</span><strong>{pass.qrCode}</strong></div>
              </div>
            </div>
            <div className="action-row" style={{ marginTop: 16 }}>
              <Button variant="primary" size="sm" icon={QrCode} onClick={() => setSelectedPass(pass)}>Phóng to QR</Button>
              <Button variant="outline" size="sm" icon={Calendar}>Gia hạn gói</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Gói tháng và VNPay</h2>
              <p className="section-copy">Mock flow tạo slot registration/payment trước khi nối `/api/slot-registrations` và `/api/payments`.</p>
            </div>
          </div>
          <div className="data-list">
            {monthlyPackages.map((pkg) => (
              <div className="soft-panel" key={pkg.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <strong>{pkg.name}</strong>
                    <p className="section-copy">{getVehicleTypeLabel(pkg.vehicleType)} - {pkg.duration}</p>
                  </div>
                  <strong>{formatCurrency(pkg.price)}</strong>
                </div>
                <div className="action-row" style={{ marginTop: 12 }}>
                  <Button size="sm" variant="secondary" icon={ShieldCheck}>
                    Chọn xe đã duyệt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Calendar size={19} /> Đăng ký đang xử lý</h2>
              <p className="section-copy">Các request mua gói/giữ slot theo từng phương tiện.</p>
            </div>
          </div>
          <div className="data-list">
            {pendingRegistrations.map((registration) => (
              <div className="soft-panel" key={registration.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{registration.plateNumber}</strong>
                  <span className={`pill ${getStatusTone(registration.status)}`}>{getStatusLabel(registration.status)}</span>
                </div>
                <p className="section-copy">Số tiền: {formatCurrency(registration.amount)} {registration.slotCode ? `- Slot ${registration.slotCode}` : "- Theo capacity xe máy"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><ShieldCheck size={19} /> Xe đủ điều kiện mua gói</h2>
            <p className="section-copy">Chỉ xe đã được admin duyệt mới dùng gói tháng và QR hợp lệ.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {myVehicles.map((vehicle) => (
            <div className="soft-panel" key={vehicle.id}>
              <strong>{vehicle.plateNumber}</strong>
              <p className="section-copy">{getVehicleTypeLabel(vehicle.vehicleType)} - {vehicle.brand}</p>
              <span className={`pill ${getStatusTone(vehicle.status)}`}>{getStatusLabel(vehicle.status)}</span>
            </div>
          ))}
        </div>
      </section>

      {selectedPass && (
        <div
          onClick={() => setSelectedPass(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(37, 21, 38, 0.72)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="card section-card animate-fade-in" onClick={(event) => event.stopPropagation()} style={{ width: "min(420px, 100%)", textAlign: "center" }}>
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {selectedPass.plateNumber}</h2>
                <p className="section-copy">{selectedPass.packageName}</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedPass(null)} aria-label="Đóng QR">
                <X size={18} />
              </button>
            </div>
            <div className="qr-box" style={{ width: 250, height: 250, margin: "0 auto" }}>
              <div className="mock-qr" />
            </div>
            <p className="section-copy" style={{ marginTop: 16 }}>Đưa mã này cho staff quét khi vào/ra bãi.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQRPassPage;
