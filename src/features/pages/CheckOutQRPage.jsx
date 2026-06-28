import { useState } from "react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Select from "../../components/Form/Select";
import {
  formatCurrency,
  formatDateTime,
  getVehicleTypeLabel,
  monthlyPasses,
  parkingSessions,
  pricingPolicy,
  violations,
} from "../../services/mockParkingData";
import { AlertTriangle, ArrowUpRight, CreditCard, QrCode, ReceiptText, ShieldCheck } from "lucide-react";

const MOCK_CHECKOUT = new Date("2026-06-11T12:05:00+07:00");

const CheckOutQRPage = () => {
  const [selectedSessionId, setSelectedSessionId] = useState("SESS-0990");
  const [receipt, setReceipt] = useState(null);
  const selectableSessions = parkingSessions.filter((session) => ["ACTIVE", "PENDING_PAYMENT"].includes(session.status));
  const currentSession = selectableSessions.find((session) => session.id === selectedSessionId);

  const feeDetails = (() => {
    if (!currentSession) return null;
    let activePass = monthlyPasses.find((pass) => pass.plateNumber === currentSession.plateNumber && pass.status === "ACTIVE");
    if (!activePass && currentSession.pricingType === "MONTHLY_PASS") {
      activePass = {
        packageName: currentSession.vehicleType === "CAR" ? "Gói tháng ô tô B3" : "Gói tháng xe máy",
      };
    }
    const checkIn = new Date(currentSession.checkInAt);
    const hours = Math.max(1, Math.ceil((MOCK_CHECKOUT - checkIn) / (1000 * 60 * 60)));
    const violation = violations.find((item) => item.sessionId === currentSession.id && item.status === "UNPAID");

    let baseFee = 0;
    if (!activePass) {
      baseFee = currentSession.vehicleType === "CAR" ? hours * pricingPolicy.carHourly : pricingPolicy.motorbikeTurn;
    }

    const violationFee = violation?.fine || currentSession.violationFee || 0;
    return {
      activePass,
      hours,
      baseFee,
      violation,
      violationFee,
      total: baseFee + violationFee,
    };
  })();

  const handleConfirm = () => {
    if (!currentSession || !feeDetails) return;
    setReceipt({
      id: `REC-${currentSession.id.replace("SESS-", "")}`,
      sessionId: currentSession.id,
      plateNumber: currentSession.plateNumber,
      total: feeDetails.total,
      baseFee: feeDetails.baseFee,
      violationFee: feeDetails.violationFee,
      method: feeDetails.total > 0 ? "CASH/VNPAY" : "MONTHLY_PASS",
    });
  };

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ArrowUpRight size={16} /> Xe ra bãi</div>
          <h1 className="page-title">Quét QR, tính phí và kết thúc phiên gửi xe</h1>
          <p className="page-subtitle">
            Nếu có gói tháng hợp lệ thì miễn phí thời gian; nếu có vi phạm thì cộng phí phạt vào hóa đơn.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Giờ mock</span>
          <span className="page-hero-number">12:05</span>
          <span className="page-hero-label">11/06/2026</span>
        </div>
      </section>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Quét QR/session card</h2>
              <p className="section-copy">Mock bằng dropdown, sau này thay bằng scanner hoặc nhập mã QR.</p>
            </div>
          </div>
          <FormField label="Chọn phiên gửi xe">
            <Select
              value={selectedSessionId}
              onChange={(event) => {
                setSelectedSessionId(event.target.value);
                setReceipt(null);
              }}
              options={selectableSessions.map((session) => ({
                value: session.id,
                label: `${session.id} - ${session.plateNumber} (${getVehicleTypeLabel(session.vehicleType)})`,
              }))}
              placeholder={null}
            />
          </FormField>

          {currentSession && feeDetails && (
            <div className="data-list" style={{ marginTop: 18 }}>
              <div className="data-row"><span>Biển số</span><strong>{currentSession.plateNumber}</strong></div>
              <div className="data-row"><span>Loại xe</span><strong>{getVehicleTypeLabel(currentSession.vehicleType)}</strong></div>
              <div className="data-row"><span>Vị trí</span><strong>{currentSession.slotCode || "Capacity xe máy"}</strong></div>
              <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(currentSession.checkInAt)}</strong></div>
              <div className="data-row"><span>Giờ ra</span><strong>{formatDateTime(MOCK_CHECKOUT)}</strong></div>
            </div>
          )}
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Hóa đơn tạm tính</h2>
              <p className="section-copy">Áp dụng phí xe máy lượt và ô tô theo giờ từ backend constants.</p>
            </div>
          </div>

          {feeDetails && (
            <div className="data-list">
              {feeDetails.activePass && (
                <div className="soft-panel">
                  <span className="pill success"><ShieldCheck size={14} /> Gói tháng hợp lệ</span>
                  <p className="section-copy">{feeDetails.activePass.packageName}, miễn phí theo thời gian gửi.</p>
                </div>
              )}
              {feeDetails.violation && (
                <div className="soft-panel">
                  <span className="pill danger"><AlertTriangle size={14} /> Có vi phạm</span>
                  <p className="section-copy">{feeDetails.violation.type}: {formatCurrency(feeDetails.violationFee)}</p>
                </div>
              )}
              <div className="data-row"><span>Thời gian tính phí</span><strong>{feeDetails.hours} giờ</strong></div>
              <div className="data-row"><span>Phí gửi xe</span><strong>{formatCurrency(feeDetails.baseFee)}</strong></div>
              <div className="data-row"><span>Phí vi phạm</span><strong>{formatCurrency(feeDetails.violationFee)}</strong></div>
              <div className="soft-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="metric-label">Tổng cần thu</span>
                <strong className="metric-value">{formatCurrency(feeDetails.total)}</strong>
              </div>
              <Button variant="primary" icon={ArrowUpRight} onClick={handleConfirm}>
                Xác nhận xe ra
              </Button>
            </div>
          )}
        </section>
      </div>

      {receipt && (
        <section className="card section-card animate-fade-in">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ReceiptText size={19} /> Biên lai hoàn tất</h2>
              <p className="section-copy">Mock receipt để sau này map với bảng `payments`.</p>
            </div>
            <span className="pill success">Đã kết thúc phiên</span>
          </div>
          <div className="dashboard-grid">
            <div className="soft-panel"><span className="metric-label">Receipt</span><div className="metric-value">{receipt.id}</div></div>
            <div className="soft-panel"><span className="metric-label">Biển số</span><div className="metric-value">{receipt.plateNumber}</div></div>
            <div className="soft-panel"><span className="metric-label">Phương thức</span><div className="metric-value">{receipt.method}</div></div>
            <div className="soft-panel"><span className="metric-label">Tổng thu</span><div className="metric-value">{formatCurrency(receipt.total)}</div></div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CheckOutQRPage;
