import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ArrowUpRight, Camera, CreditCard, QrCode, ReceiptText, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import QrCameraScanner from "../../components/QrScanner/QrCameraScanner";
import Select from "../../components/Form/Select";
import {
  checkOutByQrRequest,
  checkOutRequest,
  fetchActiveParkingSessionsRequest,
  fetchViolationsRequest,
} from "../backend/parking/parkingSlice";
import {
  formatCurrency,
  formatDateTime,
  getVehicleTypeLabel,
  monthlyPasses,
  pricingPolicy,
} from "../../services/mockParkingData";

const paymentOptions = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "CARD", label: "Thẻ ngân hàng" },
  { value: "VNPAY", label: "VNPay" },
];

const getSessionQrCodes = (session) => {
  return [
    session.sessionQrCode,
    session.session_qr_code,
    session.qrCode,
    session.qrCardId,
    session.tempQrCardCode,
    session.temp_qr_card_code,
    session.monthlyPassQrCode,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());
};

const findSessionByQrCode = (sessions, qrCode) => {
  const normalizedCode = String(qrCode || "").trim().toUpperCase();
  if (!normalizedCode) return null;

  return sessions.find((session) =>
    getSessionQrCodes(session).some((value) => value.toUpperCase() === normalizedCode)
  ) || null;
};

const CheckOutQRPage = () => {
  const dispatch = useDispatch();
  const { parkingSessions, violations, notice } = useSelector((state) => state.parking);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [qrCode, setQrCode] = useState("");
  const [checkoutMode, setCheckoutMode] = useState("SESSION");
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveParkingSessionsRequest());
    dispatch(fetchViolationsRequest());
  }, [dispatch]);

  const effectiveSessionId = selectedSessionId || parkingSessions.active[0]?.id || "";
  const scannedSession = useMemo(() => {
    return findSessionByQrCode(parkingSessions.active, qrCode);
  }, [parkingSessions.active, qrCode]);

  const currentSession = useMemo(() => {
    if (checkoutMode === "QR") return scannedSession;
    return parkingSessions.active.find((session) => String(session.id) === String(effectiveSessionId));
  }, [checkoutMode, effectiveSessionId, parkingSessions.active, scannedSession]);

  const checkoutTime = useMemo(() => new Date(), []);

  const feeDetails = useMemo(() => {
    if (!currentSession) return null;

    const activePass = monthlyPasses.find(
      (pass) => pass.plateNumber === currentSession.plateNumber && pass.status === "ACTIVE"
    );
    const checkIn = new Date(currentSession.checkInAt);
    const hours = Math.max(1, Math.ceil((checkoutTime - checkIn) / (1000 * 60 * 60)));
    const sessionViolations = violations.items.filter((item) =>
      String(item.parkingSessionId || item.sessionId) === String(currentSession.id)
      && ["OPEN", "RESOLVED", "UNPAID"].includes(item.status)
    );
    const violationFee = sessionViolations.reduce((sum, item) => sum + Number(item.penaltyFee || item.fine || 0), 0);

    const baseFee = activePass
      ? 0
      : currentSession.vehicleType === "CAR"
        ? hours * pricingPolicy.carHourly
        : pricingPolicy.motorbikeTurn;

    return {
      activePass,
      hours,
      baseFee,
      sessionViolations,
      violationFee,
      total: baseFee + violationFee,
    };
  }, [checkoutTime, currentSession, violations.items]);

  const confirmCheckout = () => {
    if (checkoutMode === "QR") {
      if (!qrCode.trim()) return;

      dispatch(
        checkOutByQrRequest({
          qrCode: qrCode.trim(),
          paymentMethod,
          totalAmount: feeDetails?.total || 0,
        })
      );
      return;
    }

    if (!currentSession || !feeDetails) return;

    dispatch(
      checkOutRequest({
        id: currentSession.id,
        paymentMethod,
        totalAmount: feeDetails.total,
      })
    );
  };

  const openQrScanner = () => {
    dispatch(fetchActiveParkingSessionsRequest());
    setCheckoutMode("QR");
    setScannerOpen(true);
  };

  const handleQrScan = (value) => {
    const scannedValue = value.trim();
    const foundSession = findSessionByQrCode(parkingSessions.active, scannedValue);

    setQrCode(scannedValue);

    if (foundSession) {
      setSelectedSessionId(foundSession.id);
    }
  };

  const receipt = parkingSessions.checkoutResult;

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ArrowUpRight size={16} /> Xe ra bãi</div>
          <h1 className="page-title">Quét QR, tính phí và hoàn tất xe ra</h1>
          <p className="page-subtitle">
            Xe có gói tháng hợp lệ được miễn phí gửi xe, nhưng phí vi phạm vẫn cần thu trước khi rời bãi.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Thời điểm xử lý</span>
          <span className="page-hero-number">{checkoutTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="page-hero-label">{checkoutTime.toLocaleDateString("vi-VN")}</span>
        </div>
      </section>

      {(notice || parkingSessions.error || violations.error) && (
        <section className="card soft-panel">
          {notice && <span className="pill success">{notice}</span>}
          {parkingSessions.error && <p style={{ color: "var(--danger)" }}>{parkingSessions.error}</p>}
          {violations.error && <p style={{ color: "var(--danger)" }}>{violations.error}</p>}
        </section>
      )}

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Thông tin xe ra</h2>
              <p className="section-copy">Chọn lượt gửi đang mở hoặc nhập mã QR để tìm xe cần ra bãi.</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <FormField label="Cách tìm xe">
              <Select
                value={checkoutMode}
                onChange={(event) => setCheckoutMode(event.target.value)}
                options={[
                  { value: "SESSION", label: "Chọn từ danh sách đang gửi" },
                  { value: "QR", label: "Nhập mã QR" },
                ]}
                placeholder={null}
              />
            </FormField>

            {checkoutMode === "SESSION" ? (
              <FormField label="Lượt gửi">
                <Select
                  value={effectiveSessionId}
                  onChange={(event) => setSelectedSessionId(event.target.value)}
                  options={parkingSessions.active.map((session) => ({
                    value: session.id,
                    label: `${session.plateNumber} - ${getVehicleTypeLabel(session.vehicleType)}`,
                  }))}
                  placeholder="Chọn xe đang gửi"
                />
              </FormField>
            ) : (
              <FormField label="Mã QR">
                <div style={{ display: "grid", gap: 10 }}>
                  <Input value={qrCode} onChange={(event) => setQrCode(event.target.value)} placeholder="Nhập mã QR trên thẻ" />
                  <Button type="button" variant="secondary" icon={Camera} onClick={openQrScanner}>
                    Quét bằng camera
                  </Button>
                  <QrCameraScanner
                    open={scannerOpen}
                    title="Quét QR xe ra"
                    onClose={() => setScannerOpen(false)}
                    onScan={handleQrScan}
                  />
                  {qrCode && scannedSession && (
                    <span className="pill success">Đã tìm thấy xe {scannedSession.plateNumber}</span>
                  )}
                  {qrCode && !scannedSession && (
                    <p className="section-copy" style={{ color: "var(--danger)" }}>
                      Chưa tìm thấy xe đang gửi với mã này. Hãy làm mới danh sách hoặc kiểm tra lại mã.
                    </p>
                  )}
                </div>
              </FormField>
            )}

            <FormField label="Cách thanh toán">
              <Select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                options={paymentOptions}
                placeholder={null}
              />
            </FormField>
          </div>

          {currentSession && (
            <div className="data-list" style={{ marginTop: 18 }}>
              {checkoutMode === "QR" && (
                <div className="data-row"><span>Mã QR</span><strong>{qrCode}</strong></div>
              )}
              <div className="data-row"><span>Biển số</span><strong>{currentSession.plateNumber}</strong></div>
              <div className="data-row"><span>Loại xe</span><strong>{getVehicleTypeLabel(currentSession.vehicleType)}</strong></div>
              <div className="data-row"><span>Vị trí</span><strong>{currentSession.slotCode || "Khu xe máy"}</strong></div>
              <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(currentSession.checkInAt)}</strong></div>
              <div className="data-row"><span>Giờ ra</span><strong>{formatDateTime(checkoutTime)}</strong></div>
            </div>
          )}
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Hóa đơn tạm tính</h2>
              <p className="section-copy">Tính theo lượt với xe máy, theo giờ với ô tô và cộng thêm phí vi phạm nếu có.</p>
            </div>
          </div>

          {feeDetails ? (
            <div className="data-list">
              {feeDetails.activePass && (
                <div className="soft-panel">
                  <span className="pill success"><ShieldCheck size={14} /> Gói tháng hợp lệ</span>
                  <p className="section-copy">{feeDetails.activePass.packageName}, không thu thêm phí gửi xe.</p>
                </div>
              )}
              {feeDetails.sessionViolations.length > 0 && (
                <div className="soft-panel">
                  <span className="pill danger"><AlertTriangle size={14} /> Có vi phạm</span>
                  <p className="section-copy">{feeDetails.sessionViolations.length} mục cần xử lý: {formatCurrency(feeDetails.violationFee)}</p>
                </div>
              )}
              <div className="data-row"><span>Thời gian tính phí</span><strong>{feeDetails.hours} giờ</strong></div>
              <div className="data-row"><span>Phí gửi xe</span><strong>{formatCurrency(feeDetails.baseFee)}</strong></div>
              <div className="data-row"><span>Phí vi phạm</span><strong>{formatCurrency(feeDetails.violationFee)}</strong></div>
              <div className="soft-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="metric-label">Tổng cần thu</span>
                <strong className="metric-value">{formatCurrency(feeDetails.total)}</strong>
              </div>
              {paymentMethod === "VNPAY" && (
                <p className="section-copy">Thanh toán VNPay sẽ hoàn tất sau khi có xác nhận thanh toán.</p>
              )}
              <Button variant="primary" icon={ArrowUpRight} onClick={confirmCheckout} loading={parkingSessions.checkingOut}>
                Xác nhận xe ra
              </Button>
            </div>
          ) : (
            <p className="section-copy">
              {checkoutMode === "QR" ? "Quét QR để xem thông tin xe và hóa đơn." : "Chọn lượt gửi để xem hóa đơn."}
            </p>
          )}
        </section>
      </div>

      {receipt && (
        <section className="card section-card animate-fade-in">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ReceiptText size={19} /> Biên lai hoàn tất</h2>
              <p className="section-copy">Thông tin xe ra và số tiền đã xử lý.</p>
            </div>
            <span className="pill success">Đã ghi nhận</span>
          </div>
          <div className="dashboard-grid">
            <div className="soft-panel"><span className="metric-label">Lượt gửi</span><div className="metric-value">{receipt.id || currentSession?.id || effectiveSessionId}</div></div>
            <div className="soft-panel"><span className="metric-label">Cách thanh toán</span><div className="metric-value">{paymentOptions.find((item) => item.value === paymentMethod)?.label}</div></div>
            <div className="soft-panel"><span className="metric-label">Trạng thái</span><div className="metric-value">{receipt.status === "PENDING_PAYMENT" ? "Chờ thanh toán" : "Hoàn tất"}</div></div>
            <div className="soft-panel"><span className="metric-label">Tổng thu</span><div className="metric-value">{formatCurrency(receipt.totalAmount || feeDetails?.total || 0)}</div></div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CheckOutQRPage;
