/**
 * @fileoverview Xây dựng màn hình MyQRPassPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Calendar,
  Car,
  CreditCard,
  Hash,
  MapPin,
  QrCode,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import QrCodeImage from "../../components/QrCode/QrCodeImage";
import Select from "../../components/Form/Select";
import {
  buyPackagePlanRequest,
  clearParkingNotice,
  continueMonthlyPassPaymentRequest,
  createSlotRegistrationRequest,
  fetchMyMonthlyPassesRequest,
  fetchMyQrPassesRequest,
  fetchMySlotRegistrationsRequest,
  fetchMyVehiclesRequest,
  fetchPackagePlansRequest,
} from "../backend/parking/parkingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { fetchSlotsByFloorRequest } from "../backend/slots/slotSlice";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import {
  clearPaymentReturnState,
  getPaymentReturnFromUrl,
} from "../../utils/paymentReturn";
import "./MyQRPassPage.css";

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizePlateQrValue` (normalize plate qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizePlateQrValue
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizePlateQrValue = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s.-]/g, "");

/**
 * Lấy nghiệp vụ `getPassQrValue` (get pass qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassQrValue
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassQrValue = (pass) =>
  normalizePlateQrValue(pass?.plateNumber || pass?.vehiclePlateNumber) || pass?.qrCode || pass?.code || "";

/**
 * Lấy nghiệp vụ `getPassPackageName` (get pass package name). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassPackageName
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassPackageName = (pass) =>
  pass?.packagePlanName || pass?.packageName || pass?.planName || "Gói tháng";

/**
 * Lấy nghiệp vụ `getPassStartDate` (get pass start date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassStartDate
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassStartDate = (pass) => pass?.monthlyPassStartDate || pass?.startDate || pass?.validFrom;

/**
 * Lấy nghiệp vụ `getPassEndDate` (get pass end date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassEndDate
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassEndDate = (pass) => pass?.monthlyPassEndDate || pass?.endDate || pass?.validTo;

/**
 * Lấy nghiệp vụ `getPassTypeLabel` (get pass type label). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassTypeLabel
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassTypeLabel = (pass) =>
  pass?.passType === "SLOT_REGISTRATION" ? "Gói tháng có ô ô tô" : "Gói tháng theo xe";

/**
 * Lấy nghiệp vụ `getPassLocation` (get pass location). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassLocation
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassLocation = (pass) =>
  [pass?.slotFloorName, pass?.slotCode ? `Ô ${pass.slotCode}` : null]
    .filter(Boolean)
    .join(" - ") ||
  (pass?.vehicleType === "CAR" ? "Chưa gán ô đỗ" : "Khu xe máy");

/**
 * Thực hiện nghiệp vụ `PassInformation` (pass information). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function PassInformation
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const PassInformation = ({ pass, compact = false }) => (
  <div className={`qr-pass-information ${compact ? "compact" : ""}`}>
    <div>
      <span><UserRound size={13} /> Chủ thẻ</span>
      <strong>{pass.ownerName || "Chủ phương tiện"}</strong>
    </div>
    <div>
      <span><Car size={13} /> Xe đăng ký</span>
      <strong>{pass.plateNumber || pass.vehiclePlateNumber || "Chưa có"} - {getVehicleTypeLabel(pass.vehicleType)}</strong>
    </div>
    <div>
      <span><Building2 size={13} /> Tòa nhà</span>
      <strong>{pass.buildingName || "Tòa nhà đã đăng ký"}</strong>
    </div>
    <div>
      <span><MapPin size={13} /> Vị trí</span>
      <strong>{getPassLocation(pass)}</strong>
    </div>
    <div>
      <span><Calendar size={13} /> Hiệu lực</span>
      <strong>{formatDate(getPassStartDate(pass))} - {formatDate(getPassEndDate(pass))}</strong>
    </div>
    <div>
      <span><CreditCard size={13} /> Giá trị gói</span>
      <strong>{formatCurrency(pass.amount || pass.price || 0)}</strong>
    </div>
    <div>
      <span><QrCode size={13} /> Nội dung khi quét</span>
      <strong className="qr-pass-code">{getPassQrValue(pass) || "Đang chờ tạo"}</strong>
    </div>
    <div>
      <span><Hash size={13} /> Mã thẻ hệ thống</span>
      <strong className="qr-pass-code">{pass.qrCode || `#${pass.id}`}</strong>
    </div>
  </div>
);

/**
 * Thực hiện nghiệp vụ `MyQRPassPage` (my qrpass page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function MyQRPassPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const MyQRPassPage = () => {
  const dispatch = useDispatch();
  const {
    packagePlans,
    monthlyPasses,
    qrPasses,
    slotRegistrations,
    vehicles,
    notice,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  const {
    floors,
    loading: floorsLoading,
    error: floorsError,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.floors);
  const {
    slotsByFloor,
    activeFloorId,
    loading: slotsLoading,
    error: slotsError,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.slots);
  const userBuildingId = user?.buildingId || user?.building_id;

  const [selectedPass, setSelectedPass] = useState(null);
  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [paymentReturn] = useState(() =>
    getPaymentReturnFromUrl({
      successMessage: "Thanh toán thành công. Gói tháng của bạn đang được cập nhật.",
      failureMessage: "Thanh toán chưa hoàn tất. Bạn có thể gửi lại yêu cầu khi cần.",
    })
  );
  const [purchaseForm, setPurchaseForm] = useState({
    packagePlanId: "",
    vehicleId: "",
    slotId: "",
    carFloorId: "",
  });

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchPackagePlansRequest({ status: "ACTIVE", buildingId: userBuildingId }));
    dispatch(fetchMyVehiclesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
  }, [dispatch, userBuildingId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!userBuildingId) return;
    dispatch(fetchFloorsRequest({
      buildingId: userBuildingId,
      floorType: "CAR",
      status: "ACTIVE",
      limit: 100,
    }));
  }, [dispatch, userBuildingId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!paymentReturn) return;

    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
    clearPaymentReturnState();
  }, [dispatch, paymentReturn]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const approvedVehicles = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return vehicles.mine.filter((vehicle) => ["APPROVED", "ACTIVE"].includes(vehicle.status));
  }, [vehicles.mine]);

  const effectiveVehicleId = purchaseForm.vehicleId || approvedVehicles[0]?.id || "";

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedVehicle = useMemo(() => {
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return approvedVehicles.find((vehicle) => String(vehicle.id) === String(effectiveVehicleId));
  }, [approvedVehicles, effectiveVehicleId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const availablePackagePlans = useMemo(() => {
    return packagePlans.items.filter(
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (plan) => !selectedVehicle || plan.vehicleType === selectedVehicle.vehicleType
    );
  }, [packagePlans.items, selectedVehicle]);

  const effectivePackagePlanId =
    purchaseForm.packagePlanId &&
    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    availablePackagePlans.some((plan) => String(plan.id) === String(purchaseForm.packagePlanId))
      ? purchaseForm.packagePlanId
      : availablePackagePlans[0]?.id || "";

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedPackage = useMemo(() => {
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return availablePackagePlans.find((plan) => String(plan.id) === String(effectivePackagePlanId));
  }, [availablePackagePlans, effectivePackagePlanId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const carFloors = useMemo(() => {
    return floors.filter(
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (floor) =>
        Number(floor.buildingId || floor.building_id) === Number(userBuildingId) &&
        String(floor.floorType || floor.floor_type).toUpperCase() === "CAR" &&
        String(floor.status).toUpperCase() === "ACTIVE"
    );
  }, [floors, userBuildingId]);

  const effectiveCarFloorId =
    purchaseForm.carFloorId &&
    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    carFloors.some((floor) => String(floor.id) === String(purchaseForm.carFloorId))
      ? purchaseForm.carFloorId
      : (carFloors[0]?.id ? String(carFloors[0].id) : "");
  const selectedCarFloor = carFloors.find(
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (floor) => String(floor.id) === String(effectiveCarFloorId)
  );
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const carSlotsInFloor = useMemo(() => {
    if (!effectiveCarFloorId) return [];

    const fetchedSlots = slotsByFloor[effectiveCarFloorId];
    if (Array.isArray(fetchedSlots) && fetchedSlots.length > 0) return fetchedSlots;

    return Array.isArray(selectedCarFloor?.slots) ? selectedCarFloor.slots : [];
  }, [effectiveCarFloorId, selectedCarFloor, slotsByFloor]);
  const availableCarSlots = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => carSlotsInFloor.filter(
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (slot) => String(slot.status).toUpperCase() === "AVAILABLE"
    ),
    [carSlotsInFloor]
  );
  const effectiveSlotId =
    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    purchaseForm.slotId && availableCarSlots.some((slot) => String(slot.id) === String(purchaseForm.slotId))
      ? purchaseForm.slotId
      : String(availableCarSlots[0]?.id || "");

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveCarFloorId }));
  }, [dispatch, effectiveCarFloorId]);

  /**
   * Cập nhật nghiệp vụ `updatePurchaseForm` (update purchase form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updatePurchaseForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updatePurchaseForm = (field, value) => {
    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setPurchaseForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setPurchaseForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Thực hiện nghiệp vụ `buyPackage` (buy package). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function buyPackage
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const buyPackage = () => {
    if (!selectedPackage || !selectedVehicle) return;

    if (selectedVehicle.vehicleType === "CAR") {
      dispatch(
        createSlotRegistrationRequest({
          vehicleId: selectedVehicle.id,
          slotId: Number(effectiveSlotId),
          packagePlanId: selectedPackage.id,
          bankCode: "NCB",
        })
      );
      return;
    }

    dispatch(
      buyPackagePlanRequest({
        id: selectedPackage.id,
        vehicleId: selectedVehicle.id,
        bankCode: "NCB",
        locale: "vn",
      })
    );
  };

  /**
   * Thực hiện nghiệp vụ `continueMonthlyPayment` (continue monthly payment). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function continueMonthlyPayment
   * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const continueMonthlyPayment = (pass) => {
    dispatch(
      continueMonthlyPassPaymentRequest({
        id: pass.id,
        bankCode: "NCB",
        locale: "vn",
      })
    );
  };

  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const activePassCount = qrPasses.mine.filter((pass) => (pass.status || "ACTIVE") === "ACTIVE").length;
  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const pendingMonthlyPasses = monthlyPasses.mine.filter((pass) =>
    ["PENDING_PAYMENT", "CANCELLED"].includes(pass.status)
  );
  const hasPendingRequests =
    pendingMonthlyPasses.length > 0 || slotRegistrations.mine.length > 0;

  return (
    <div className="parking-page my-qr-pass-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> Mã QR của tôi</div>
          <h1 className="page-title">Mã QR dùng để ra vào bãi và thay thẻ vật lý</h1>
          <p className="page-subtitle">
            Mỗi mã QR gắn với một phương tiện. Nếu hết hạn, sai xe hoặc xe chưa duyệt, nhân viên sẽ xử lý như xe chưa có gói hợp lệ.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Còn hiệu lực</span>
          <span className="page-hero-number">{activePassCount}</span>
          <span className="page-hero-label">mã QR</span>
        </div>
      </section>

      <StatusBanner
        success={[
          notice,
          paymentReturn?.tone === "success" ? paymentReturn.message : null,
        ]}
        warning={paymentReturn?.tone === "warning" ? paymentReturn.message : null}
        info={paymentReturn?.transactionRef ? `Mã giao dịch: ${paymentReturn.transactionRef}` : null}
        errors={[
          packagePlans.error,
          monthlyPasses.error,
          qrPasses.error,
          slotRegistrations.error,
          floorsError,
          slotsError,
        ]}
      />
      <section className="my-qr-grid" aria-label="Danh sách mã QR còn hiển thị">
        {qrPasses.mine.map((pass) => (
          <article className="card section-card qr-pass-card" key={pass.id}>
            <div className="section-header qr-pass-card-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {pass.plateNumber || pass.vehiclePlateNumber}</h2>
                <p className="section-copy">{getPassPackageName(pass)} • {getPassTypeLabel(pass)}</p>
              </div>
              <span className={`pill ${getStatusTone(pass.status || "ACTIVE")}`}>{getStatusLabel(pass.status || "ACTIVE")}</span>
            </div>
            <div className="qr-pass-card-body">
              <button
                className="qr-box qr-pass-thumb"
                onClick={() => setSelectedPass(pass)}
                aria-label={`Phóng to QR ${pass.plateNumber || ""}`}
                disabled={!getPassQrValue(pass)}
              >
                {getPassQrValue(pass) ? (
                  <QrCodeImage value={getPassQrValue(pass)} size={96} title={`QR ${pass.plateNumber || ""}`} />
                ) : (
                  <div className="qr-image-error" style={{ width: 96, height: 96 }}>Đang chờ tạo</div>
                )}
              </button>
              <PassInformation pass={pass} compact />
            </div>
            <div className="action-row qr-pass-actions">
              <Button variant="primary" size="sm" icon={QrCode} disabled={!getPassQrValue(pass)} onClick={() => setSelectedPass(pass)}>Phóng to QR</Button>
              <Button variant="outline" size="sm" icon={Calendar}>Gia hạn</Button>
            </div>
          </article>
        ))}
        {qrPasses.mine.length === 0 && (
          <section className="card section-card qr-pass-empty">
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> Chưa có QR gói tháng</h2>
                <p className="section-copy">
                  Sau khi thanh toán thành công, hệ thống sẽ tự tạo QR cho gói tháng và xe đã đăng ký.
                </p>
              </div>
            </div>
          </section>
        )}
      </section>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Mua gói tháng</h2>
              <p className="section-copy">Chỉ xe đã được duyệt mới có thể mua gói tháng.</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <FormField label="Chọn gói">
              <Select
                value={effectivePackagePlanId}
                onChange={(event) => updatePurchaseForm("packagePlanId", event.target.value)}
                options={availablePackagePlans.map((plan) => ({
                  value: plan.id,
                  label: `${plan.name} - ${formatCurrency(plan.price)}`,
                }))}
                placeholder="Chọn gói tháng"
              />
            </FormField>

            <FormField label="Chọn xe">
              <Select
                value={effectiveVehicleId}
                onChange={(event) => updatePurchaseForm("vehicleId", event.target.value)}
                options={approvedVehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.plateNumber} - ${getVehicleTypeLabel(vehicle.vehicleType)}`,
                }))}
                placeholder="Chọn xe đã duyệt"
              />
            </FormField>

            {selectedVehicle?.vehicleType === "CAR" && (
              <FormField label="Ô đỗ ô tô">
                <div style={{ display: "grid", gap: 12 }}>
                  {carFloors.length > 0 && (
                    <Select
                      value={effectiveCarFloorId}
                      onChange={(event) => {
                        updatePurchaseForm("carFloorId", event.target.value);
                        updatePurchaseForm("slotId", "");
                      }}
                      options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                      placeholder="Chọn tầng ô tô"
                    />
                  )}

                  <div className="car-slot-grid">
                    {carSlotsInFloor.map((slot) => {
                      const isAvailable = String(slot.status).toUpperCase() === "AVAILABLE";
                      const isSelected = String(effectiveSlotId) === String(slot.id);

                      return (
                        <button
                          type="button"
                          key={slot.id}
                          className={`car-slot-card ${String(slot.status || "AVAILABLE").toLowerCase()} ${isSelected ? "selected" : ""}`}
                          disabled={!isAvailable}
                          onClick={() => updatePurchaseForm("slotId", String(slot.id))}
                        >
                          <span className="car-slot-code">{slot.slotCode}</span>
                          <span className="car-slot-status">{getStatusLabel(slot.status)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {(floorsLoading || (slotsLoading && String(activeFloorId) === String(effectiveCarFloorId))) && (
                    <p className="section-copy">Đang tải tầng và ô đỗ...</p>
                  )}
                  {!floorsLoading && !slotsLoading && !floorsError && !slotsError && carFloors.length === 0 && (
                    <p className="section-copy">Tòa nhà của bạn chưa có ô ô tô còn hoạt động.</p>
                  )}
                  {!floorsLoading && !slotsLoading && carFloors.length > 0 && carSlotsInFloor.length === 0 && (
                    <p className="section-copy">Tầng đã chọn chưa có ô đỗ ô tô.</p>
                  )}
                </div>
              </FormField>
            )}

            <Button
              variant="primary"
              icon={ShieldCheck}
              loading={packagePlans.buyingId === selectedPackage?.id || slotRegistrations.creating}
              disabled={!selectedPackage || !selectedVehicle || (selectedVehicle.vehicleType === "CAR" && !effectiveSlotId)}
              onClick={buyPackage}
            >
              Gửi yêu cầu thanh toán
            </Button>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Calendar size={19} /> Yêu cầu đang xử lý</h2>
              <p className="section-copy">Các yêu cầu mua gói hoặc giữ ô đỗ đang chờ thanh toán, duyệt hoặc hoàn tất.</p>
            </div>
          </div>
          <div className="data-list">
            {pendingMonthlyPasses.map((pass) => (
              <div className="soft-panel" key={`monthly-${pass.id}`}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{pass.plateNumber || `Xe #${pass.vehicleId}`}</strong>
                  <span className={`pill ${getStatusTone(pass.status)}`}>{getStatusLabel(pass.status)}</span>
                </div>
                <p className="section-copy">
                  {getPassPackageName(pass)} - {formatCurrency(pass.amount || 0)}
                </p>
                {pass.status === "PENDING_PAYMENT" && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CreditCard}
                    loading={String(monthlyPasses.payingId) === String(pass.id)}
                    onClick={() => continueMonthlyPayment(pass)}
                  >
                    Tiếp tục thanh toán
                  </Button>
                )}
              </div>
            ))}
            {slotRegistrations.mine.map((registration) => (
              <div className="soft-panel" key={registration.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{registration.plateNumber || `Xe #${registration.vehicleId}`}</strong>
                  <span className={`pill ${getStatusTone(registration.status)}`}>{getStatusLabel(registration.status)}</span>
                </div>
                <p className="section-copy">
                  Số tiền: {formatCurrency(registration.amount || selectedPackage?.price || 0)} {registration.slotCode ? `- Ô ${registration.slotCode}` : "- Xe máy theo sức chứa"}
                </p>
              </div>
            ))}
            {!hasPendingRequests && <p className="section-copy">Chưa có yêu cầu nào đang xử lý.</p>}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><ShieldCheck size={19} /> Xe đủ điều kiện mua gói</h2>
            <p className="section-copy">Xe đã duyệt mới được mua gói tháng và dùng mã QR hợp lệ.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {vehicles.mine.map((vehicle) => (
            <div className="soft-panel" key={vehicle.id}>
              <strong>{vehicle.plateNumber}</strong>
              <p className="section-copy">{getVehicleTypeLabel(vehicle.vehicleType)} - {vehicle.brand}</p>
              <span className={`pill ${getStatusTone(vehicle.status)}`}>{getStatusLabel(vehicle.status)}</span>
            </div>
          ))}
        </div>
      </section>

      {selectedPass && createPortal(
        <div
          className="modal-backdrop qr-pass-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-pass-modal-title"
          onClick={() => setSelectedPass(null)}
        >
          <section
            className="card section-card animate-fade-in qr-pass-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-header qr-pass-modal-header">
              <div>
                <h2 className="section-title" id="qr-pass-modal-title">
                  <QrCode size={19} /> {selectedPass.plateNumber || selectedPass.vehiclePlateNumber}
                </h2>
                <p className="section-copy">{getPassPackageName(selectedPass)} • {getPassTypeLabel(selectedPass)}</p>
              </div>
              <div className="qr-pass-modal-heading-actions">
                <span className={`pill ${getStatusTone(selectedPass.status || "ACTIVE")}`}>
                  {getStatusLabel(selectedPass.status || "ACTIVE")}
                </span>
                <button
                  type="button"
                  className="theme-toggle-btn"
                  onClick={() => setSelectedPass(null)}
                  aria-label="Đóng QR"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="qr-pass-modal-body">
              <div className="qr-pass-modal-code">
                <div className="qr-box">
                  <QrCodeImage
                    value={getPassQrValue(selectedPass)}
                    size={226}
                    title={`QR ${selectedPass.plateNumber || ""}`}
                  />
                </div>
                <strong>{selectedPass.plateNumber || selectedPass.vehiclePlateNumber}</strong>
                <span>Đưa mã này cho nhân viên quét khi xe vào hoặc ra bãi.</span>
              </div>
              <PassInformation pass={selectedPass} />
            </div>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyQRPassPage;
