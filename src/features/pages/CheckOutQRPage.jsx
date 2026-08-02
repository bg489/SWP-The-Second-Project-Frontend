/**
 * @fileoverview Xây dựng màn hình CheckOutQRPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ArrowUpRight, Camera, CreditCard, QrCode, ReceiptText, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import PlateCameraScanner from "../../components/PlateScanner/PlateCameraScanner";
import QrCameraScanner from "../../components/QrScanner/QrCameraScanner";
import Select from "../../components/Form/Select";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  checkOutByQrRequest,
  checkOutRequest,
  fetchActiveParkingSessionsRequest,
  fetchPricingPoliciesRequest,
  fetchViolationsRequest,
} from "../backend/parking/parkingSlice";
import {
  formatCurrency,
  formatDateTime,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import {
  clearPaymentReturnState,
  getPaymentReturnFromUrl,
} from "../../utils/paymentReturn";
import { formatPlateNumber, normalizePlateSearch } from "../../utils/licensePlate";
import "./CheckOutQRPage.css";

/**
 * Khai báo `paymentOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/CheckOutQRPage.jsx.
 */
const paymentOptions = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "VNPAY", label: "VNPay" },
];

/**
 * Lấy nghiệp vụ `getSessionQrCodes` (get session qr codes). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getSessionQrCodes
 * @param {*} session - Giá trị `session` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getSessionQrCodes = (session) => {
  return [
    session.sessionQrCode,
    session.session_qr_code,
    session.qrCode,
    session.qrCardId,
    session.tempQrCardCode,
    session.temp_qr_card_code,
    session.monthlyPassQrCode,
    session.plateNumber,
  ]
    .filter(Boolean)
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .map((value) => String(value).trim());
};

/**
 * Lấy nghiệp vụ `findSessionByQrCode` (find session by qr code). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function findSessionByQrCode
 * @param {*} sessions - Giá trị `sessions` được hàm sử dụng trong quá trình xử lý.
 * @param {*} qrCode - Giá trị `qrCode` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const findSessionByQrCode = (sessions, qrCode) => {
  const normalizedCode = normalizePlateSearch(qrCode);
  if (!normalizedCode) return null;

  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  return sessions.find((session) =>
    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    getSessionQrCodes(session).some((value) => normalizePlateSearch(value) === normalizedCode)
  ) || null;
};

/**
 * Lấy nghiệp vụ `getViolationAmount` (get violation amount). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getViolationAmount
 * @param {*} violation - Giá trị `violation` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getViolationAmount = (violation) =>
  Number(violation?.penaltyFee ?? violation?.fine ?? 0);

/**
 * Thực hiện nghiệp vụ `ViolationFeeList` (violation fee list). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ViolationFeeList
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ViolationFeeList = ({ items = [] }) => {
  if (!items.length) return null;

  const total = items.reduce(
    /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (sum, violation) => sum + getViolationAmount(violation),
    0
  );

  return (
    <div className="checkout-violation-list">
      <div className="checkout-violation-heading">
        <span><AlertTriangle size={16} /> Chi tiết từng khoản vi phạm</span>
        <strong>{items.length} khoản</strong>
      </div>
      {items.map((violation, index) => (
        <article
          className="checkout-violation-item"
          key={violation.id || `${violation.violationType || "violation"}-${index}`}
        >
          <span className="checkout-violation-number">{index + 1}</span>
          <div>
            <strong>
              {violation.violationTypeName ||
                violation.violationType ||
                violation.name ||
                "Vi phạm quy định bãi xe"}
            </strong>
            {violation.note && <p>Ghi chú: {violation.note}</p>}
            {(violation.detectedAt || violation.createdAt) && (
              <small>
                Ghi nhận lúc {formatDateTime(violation.detectedAt || violation.createdAt)}
              </small>
            )}
          </div>
          <strong className="checkout-violation-amount">
            {formatCurrency(getViolationAmount(violation))}
          </strong>
        </article>
      ))}
      <div className="checkout-violation-total">
        <span>Tổng phí vi phạm</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  );
};

/**
 * Lấy nghiệp vụ `getPaymentMethodLabel` (get payment method label). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPaymentMethodLabel
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPaymentMethodLabel = (value) => {
  if (value === "NO_PAYMENT") return "Không cần thanh toán";
  if (value === "MONTHLY_PASS") return "Gói tháng";
  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  return paymentOptions.find((item) => item.value === value)?.label || value || "-";
};

/**
 * Kiểm tra nghiệp vụ `CheckOutQRPage` (check out qrpage). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function CheckOutQRPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const CheckOutQRPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { parkingSessions, pricingPolicies, violations, notice } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [qrCode, setQrCode] = useState("");
  const [checkoutMode, setCheckoutMode] = useState("SESSION");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [plateScannerOpen, setPlateScannerOpen] = useState(false);
  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [paymentReturn] = useState(() =>
    getPaymentReturnFromUrl({
      successMessage: "Thanh toán thành công. Lượt xe ra đã được hoàn tất.",
      failureMessage: "Thanh toán chưa hoàn tất. Xe vẫn đang chờ xử lý thanh toán.",
    })
  );

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchActiveParkingSessionsRequest(user?.buildingId ? { buildingId: user.buildingId } : undefined));
    dispatch(fetchPricingPoliciesRequest({ status: "ACTIVE" }));
    dispatch(fetchViolationsRequest());
  }, [dispatch, user?.buildingId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!paymentReturn) return;

    dispatch(fetchActiveParkingSessionsRequest(user?.buildingId ? { buildingId: user.buildingId } : undefined));
    dispatch(fetchViolationsRequest());
    clearPaymentReturnState();
  }, [dispatch, paymentReturn, user?.buildingId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const filteredSessions = useMemo(() => {
    const keyword = normalizePlateSearch(sessionSearch);
    if (!keyword) return parkingSessions.active;

    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return parkingSessions.active.filter((session) =>
      normalizePlateSearch(session.plateNumber).includes(keyword)
    );
  }, [parkingSessions.active, sessionSearch]);

  const effectiveSessionId = selectedSessionId || filteredSessions[0]?.id || "";
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const scannedSession = useMemo(() => {
    return findSessionByQrCode(parkingSessions.active, qrCode);
  }, [parkingSessions.active, qrCode]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const currentSession = useMemo(() => {
    if (checkoutMode === "QR") return scannedSession;
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return parkingSessions.active.find((session) => String(session.id) === String(effectiveSessionId));
  }, [checkoutMode, effectiveSessionId, parkingSessions.active, scannedSession]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const checkoutTime = useMemo(() => new Date(), []);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const feeDetails = useMemo(() => {
    if (!currentSession) return null;

    const hasMonthlyPass =
      currentSession.pricingType === "MONTHLY_PASS" ||
      Boolean(currentSession.monthlyPassId);
    const checkIn = new Date(currentSession.checkInAt);
    const hours = Math.max(1, Math.ceil((checkoutTime - checkIn) / (1000 * 60 * 60)));
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const storedViolations = violations.items.filter((item) =>
      String(item.parkingSessionId || item.sessionId) === String(currentSession.id)
      && ["OPEN", "RESOLVED", "UNPAID"].includes(item.status)
    );
    const embeddedViolations = Array.isArray(currentSession.violations)
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ? currentSession.violations.filter((item) =>
          !item.status || ["OPEN", "RESOLVED", "UNPAID"].includes(item.status)
        )
      : [];
    const sessionViolations = storedViolations.length > 0
      ? storedViolations
      : embeddedViolations;
    /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const violationFee = sessionViolations.reduce((sum, item) => sum + Number(item.penaltyFee || item.fine || 0), 0);

    const motorbikePolicy = pricingPolicies.items.find(
      /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (item) => item.vehicleType === "MOTORBIKE" && item.pricingType === "TURN" && item.status === "ACTIVE"
    );
    const carPolicy = pricingPolicies.items.find(
      /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (item) => item.vehicleType === "CAR" && item.pricingType === "HOURLY" && item.status === "ACTIVE"
    );
    const motorbikeTurnAmount = Number(motorbikePolicy?.amount || 4000);
    const carHourlyAmount = Number(carPolicy?.amount || 20000);

    const baseFee = hasMonthlyPass
      ? 0
      : currentSession.vehicleType === "CAR"
        ? hours * carHourlyAmount
        : motorbikeTurnAmount;

    return {
      hasMonthlyPass,
      hours,
      baseFee,
      sessionViolations,
      violationFee,
      total: baseFee + violationFee,
    };
  }, [checkoutTime, currentSession, pricingPolicies.items, violations.items]);

  const markCheckoutSubmitted = useResetAfterSuccess({
    submitting: parkingSessions.checkingOut,
    success: parkingSessions.checkoutResult,
    error: parkingSessions.error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    onSuccess: () => {
      setSelectedSessionId("");
      setSessionSearch("");
      setPaymentMethod("CASH");
      setQrCode("");
      setCheckoutMode("SESSION");
      setScannerOpen(false);
      setPlateScannerOpen(false);
    },
  });

  /**
   * Lấy nghiệp vụ `getCheckoutPayload` (get checkout payload). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function getCheckoutPayload
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const getCheckoutPayload = () => {
    const totalAmount = Number(feeDetails?.total || 0);

    return {
      totalAmount,
      ...(totalAmount > 0 ? { paymentMethod } : {}),
    };
  };

  /**
   * Xử lý nghiệp vụ `confirmCheckout` (confirm checkout). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function confirmCheckout
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const confirmCheckout = () => {
    if (checkoutMode === "QR") {
      if (!qrCode.trim()) return;

      markCheckoutSubmitted();
      dispatch(
        checkOutByQrRequest({
          qrCode: qrCode.trim(),
          ...getCheckoutPayload(),
        })
      );
      return;
    }

    if (!currentSession || !feeDetails) return;

    markCheckoutSubmitted();
    dispatch(
      checkOutRequest({
        id: currentSession.id,
        ...getCheckoutPayload(),
      })
    );
  };

  /**
   * Hiển thị nghiệp vụ `openQrScanner` (open qr scanner). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function openQrScanner
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const openQrScanner = () => {
    dispatch(fetchActiveParkingSessionsRequest());
    setCheckoutMode("QR");
    setScannerOpen(true);
  };

  /**
   * Xử lý nghiệp vụ `handleQrScan` (handle qr scan). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleQrScan
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleQrScan = (value) => {
    const scannedValue = value.trim();
    const foundSession = findSessionByQrCode(parkingSessions.active, scannedValue);

    setQrCode(scannedValue);

    if (foundSession) {
      setSelectedSessionId(foundSession.id);
    }
  };

  /**
   * Xử lý nghiệp vụ `handlePlateScan` (handle plate scan). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handlePlateScan
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handlePlateScan = (value) => {
    const plateNumber = formatPlateNumber(value);
    const normalizedPlate = normalizePlateSearch(plateNumber);
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const foundSession = parkingSessions.active.find((session) =>
      normalizePlateSearch(session.plateNumber) === normalizedPlate
    );

    setCheckoutMode("SESSION");
    setSessionSearch(plateNumber);
    setSelectedSessionId(foundSession?.id || "");
  };

  const receipt = parkingSessions.checkoutResult;
  const receiptSession = receipt?.session || receipt;
  const receiptFeeDetail = receipt?.feeDetail || {};
  const receiptViolations = Array.isArray(receiptFeeDetail.violations)
    ? receiptFeeDetail.violations
    : [];
  const rawReceiptPaymentMethod =
    receipt?.payment?.method ||
    receipt?.payment?.provider ||
    receiptSession?.paymentMethod ||
    paymentMethod;
  const receiptBaseFee = Number(
    receiptFeeDetail.baseFee ?? receiptSession?.baseFee ?? 0
  );
  const receiptViolationFee = Number(
    receiptFeeDetail.violationFee ??
      receiptViolations.reduce(
        /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        (sum, violation) => sum + getViolationAmount(violation),
        0
      )
  );
  const receiptTotal = Number(
    receiptFeeDetail.totalAmount ??
      receipt?.payment?.amount ??
      receiptSession?.totalAmount ??
      receiptBaseFee + receiptViolationFee
  );
  const receiptPaymentMethod = receiptTotal === 0
    ? "NO_PAYMENT"
    : rawReceiptPaymentMethod;

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

      <StatusBanner
        success={[
          notice,
          paymentReturn?.tone === "success" ? paymentReturn.message : null,
        ]}
        warning={paymentReturn?.tone === "warning" ? paymentReturn.message : null}
        info={paymentReturn?.transactionRef ? `Mã giao dịch: ${paymentReturn.transactionRef}` : null}
        errors={[parkingSessions.error, violations.error]}
      />

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
              <>
                <FormField label="Tìm biển số xe">
                  <div className="plate-input-row">
                    <Input
                      value={sessionSearch}
                      onChange={(event) => {
                        setSessionSearch(event.target.value);
                        setSelectedSessionId("");
                      }}
                      placeholder="Gõ một phần biển số, không cần dấu chấm/gạch"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      icon={Camera}
                      onClick={() => setPlateScannerOpen(true)}
                    >
                      Quét biển số
                    </Button>
                  </div>
                </FormField>
                <FormField label="Lượt gửi">
                  <Select
                    value={effectiveSessionId}
                    onChange={(event) => setSelectedSessionId(event.target.value)}
                    options={filteredSessions.map((session) => ({
                      value: session.id,
                      label: `${session.plateNumber} - ${getVehicleTypeLabel(session.vehicleType)}`,
                    }))}
                    placeholder="Chọn xe đang gửi"
                  />
                </FormField>
              </>
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

            {feeDetails?.total > 0 && (
              <FormField label="Cách thanh toán">
                <Select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  options={paymentOptions}
                  placeholder={null}
                />
              </FormField>
            )}
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
              {feeDetails.hasMonthlyPass && (
                <div className="soft-panel">
                  <span className="pill success"><ShieldCheck size={14} /> Gói tháng hợp lệ</span>
                  <p className="section-copy">Xe có gói tháng, không thu thêm phí gửi xe.</p>
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
              <ViolationFeeList items={feeDetails.sessionViolations} />
              <div className="soft-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="metric-label">Tổng cần thu</span>
                <strong className="metric-value">{formatCurrency(feeDetails.total)}</strong>
              </div>
              {feeDetails.total === 0 && (
                <div className="soft-panel">
                  <span className="pill success"><ShieldCheck size={14} /> Không cần thanh toán</span>
                  <p className="section-copy">Lượt xe được hoàn tất trực tiếp vì không phát sinh khoản cần thu.</p>
                </div>
              )}
              {feeDetails.total > 0 && paymentMethod === "VNPAY" && (
                <p className="section-copy">Hệ thống sẽ chuyển sang trang thanh toán sandbox sau khi xác nhận xe ra.</p>
              )}
              <Button
                variant="primary"
                icon={ArrowUpRight}
                onClick={confirmCheckout}
                loading={parkingSessions.checkingOut}
                disabled={violations.loading || pricingPolicies.loading}
              >
                {feeDetails.total === 0 ? "Hoàn tất xe ra" : "Xác nhận xe ra"}
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
            <div className="soft-panel"><span className="metric-label">Lượt gửi</span><div className="metric-value">{receiptSession?.id || currentSession?.id || effectiveSessionId}</div></div>
            <div className="soft-panel"><span className="metric-label">Cách thanh toán</span><div className="metric-value">{getPaymentMethodLabel(receiptPaymentMethod)}</div></div>
            <div className="soft-panel"><span className="metric-label">Trạng thái</span><div className="metric-value">{receiptSession?.status === "PENDING_PAYMENT" ? "Chờ thanh toán" : "Hoàn tất"}</div></div>
            <div className="soft-panel"><span className="metric-label">Tổng thu</span><div className="metric-value">{formatCurrency(receiptTotal)}</div></div>
          </div>
          <div className="checkout-receipt-breakdown">
            <div className="data-row">
              <span>Phí gửi xe</span>
              <strong>{formatCurrency(receiptBaseFee)}</strong>
            </div>
            <ViolationFeeList items={receiptViolations} />
            {receiptViolations.length === 0 && receiptViolationFee > 0 && (
              <div className="data-row">
                <span>Phí vi phạm</span>
                <strong>{formatCurrency(receiptViolationFee)}</strong>
              </div>
            )}
            <div className="checkout-receipt-total">
              <span>Tổng đã xử lý</span>
              <strong>{formatCurrency(receiptTotal)}</strong>
            </div>
          </div>
        </section>
      )}

      <PlateCameraScanner
        open={plateScannerOpen}
        onClose={() => setPlateScannerOpen(false)}
        onScan={handlePlateScan}
        title="Quét biển số xe ra"
      />
    </div>
  );
};

export default CheckOutQRPage;
