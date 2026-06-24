import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, CreditCard, QrCode, ShieldCheck, X } from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Select from "../../components/Form/Select";
import {
  buyPackagePlanRequest,
  clearParkingNotice,
  createSlotRegistrationRequest,
  fetchMyQrPassesRequest,
  fetchMySlotRegistrationsRequest,
  fetchMyVehiclesRequest,
  fetchPackagePlansRequest,
} from "../backend/parking/parkingSlice";
import {
  carSlots,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";

const getPaymentReturnFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("paymentStatus");

  if (!paymentStatus) return null;

  const isSuccess = paymentStatus === "SUCCESS";

  return {
    tone: isSuccess ? "success" : "warning",
    message: isSuccess
      ? "Thanh toán thành công. Gói tháng của bạn đang được cập nhật."
      : "Thanh toán chưa hoàn tất. Bạn có thể gửi lại yêu cầu khi cần.",
    transactionRef: params.get("transactionRef"),
  };
};

const MyQRPassPage = () => {
  const dispatch = useDispatch();
  const {
    packagePlans,
    qrPasses,
    slotRegistrations,
    vehicles,
    notice,
  } = useSelector((state) => state.parking);

  const [selectedPass, setSelectedPass] = useState(null);
  const [paymentReturn] = useState(getPaymentReturnFromUrl);
  const [purchaseForm, setPurchaseForm] = useState({
    packagePlanId: "",
    vehicleId: "",
    slotId: "",
  });

  useEffect(() => {
    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchPackagePlansRequest({ status: "ACTIVE" }));
    dispatch(fetchMyVehiclesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!paymentReturn) return;

    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
    window.history.replaceState({}, "", window.location.pathname);
  }, [dispatch, paymentReturn]);

  const approvedVehicles = useMemo(() => {
    return vehicles.mine.filter((vehicle) => ["APPROVED", "ACTIVE"].includes(vehicle.status));
  }, [vehicles.mine]);

  const effectivePackagePlanId = purchaseForm.packagePlanId || packagePlans.items[0]?.id || "";
  const effectiveVehicleId = purchaseForm.vehicleId || approvedVehicles[0]?.id || "";

  const selectedPackage = useMemo(() => {
    return packagePlans.items.find((plan) => String(plan.id) === String(effectivePackagePlanId));
  }, [effectivePackagePlanId, packagePlans.items]);

  const selectedVehicle = useMemo(() => {
    return approvedVehicles.find((vehicle) => String(vehicle.id) === String(effectiveVehicleId));
  }, [approvedVehicles, effectiveVehicleId]);

  const updatePurchaseForm = (field, value) => {
    dispatch(clearParkingNotice());
    setPurchaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const buyPackage = () => {
    if (!selectedPackage || !selectedVehicle) return;

    if (selectedVehicle.vehicleType === "CAR") {
      dispatch(
        createSlotRegistrationRequest({
          vehicleId: selectedVehicle.id,
          slotId: purchaseForm.slotId || carSlots.find((slot) => slot.status === "AVAILABLE")?.id,
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

  const activePassCount = qrPasses.mine.filter((pass) => (pass.status || "ACTIVE") === "ACTIVE").length;
  const availableCarSlots = carSlots.filter((slot) => slot.status === "AVAILABLE");

  return (
    <div className="parking-page">
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

      {(notice || paymentReturn || packagePlans.error || qrPasses.error || slotRegistrations.error) && (
        <section className="card soft-panel">
          {notice && <span className="pill success">{notice}</span>}
          {paymentReturn && (
            <div className="data-list">
              <span className={`pill ${paymentReturn.tone}`}>{paymentReturn.message}</span>
              {paymentReturn.transactionRef && (
                <p className="section-copy">Mã giao dịch: {paymentReturn.transactionRef}</p>
              )}
            </div>
          )}
          {packagePlans.error && <p style={{ color: "var(--danger)" }}>{packagePlans.error}</p>}
          {qrPasses.error && <p style={{ color: "var(--danger)" }}>{qrPasses.error}</p>}
          {slotRegistrations.error && <p style={{ color: "var(--danger)" }}>{slotRegistrations.error}</p>}
        </section>
      )}

      <div className="dashboard-grid">
        {qrPasses.mine.map((pass) => (
          <div className="card section-card" key={pass.id}>
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {pass.plateNumber || pass.vehiclePlateNumber}</h2>
                <p className="section-copy">{pass.packageName || pass.planName || "Gói tháng"} - {getVehicleTypeLabel(pass.vehicleType)}</p>
              </div>
              <span className={`pill ${getStatusTone(pass.status || "ACTIVE")}`}>{getStatusLabel(pass.status || "ACTIVE")}</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button className="qr-box" onClick={() => setSelectedPass(pass)} aria-label={`Phóng to QR ${pass.plateNumber || ""}`}>
                <div className="mock-qr" />
              </button>
              <div className="data-list" style={{ flex: 1 }}>
                <div className="data-row"><span>Hiệu lực</span><strong>{formatDate(pass.startDate)} - {formatDate(pass.endDate)}</strong></div>
                <div className="data-row"><span>Giá trị gói</span><strong>{formatCurrency(pass.amount || pass.price || 0)}</strong></div>
                <div className="data-row"><span>Mã QR</span><strong>{pass.qrCode || pass.code || "Đang chờ tạo"}</strong></div>
              </div>
            </div>
            <div className="action-row" style={{ marginTop: 16 }}>
              <Button variant="primary" size="sm" icon={QrCode} onClick={() => setSelectedPass(pass)}>Phóng to QR</Button>
              <Button variant="outline" size="sm" icon={Calendar}>Gia hạn</Button>
            </div>
          </div>
        ))}
      </div>

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
                options={packagePlans.items.map((plan) => ({
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
                <Select
                  value={purchaseForm.slotId}
                  onChange={(event) => updatePurchaseForm("slotId", event.target.value)}
                  options={availableCarSlots.map((slot) => ({
                    value: slot.id,
                    label: slot.slotCode,
                  }))}
                  placeholder="Chọn ô đỗ còn trống"
                />
              </FormField>
            )}

            <Button
              variant="primary"
              icon={ShieldCheck}
              loading={packagePlans.buyingId === selectedPackage?.id || slotRegistrations.creating}
              disabled={!selectedPackage || !selectedVehicle}
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
            {slotRegistrations.mine.length === 0 && <p className="section-copy">Chưa có yêu cầu nào đang xử lý.</p>}
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
                <p className="section-copy">{selectedPass.packageName || "Gói tháng"}</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedPass(null)} aria-label="Đóng QR">
                <X size={18} />
              </button>
            </div>
            <div className="qr-box" style={{ width: 250, height: 250, margin: "0 auto" }}>
              <div className="mock-qr" />
            </div>
            <p className="section-copy" style={{ marginTop: 16 }}>Đưa mã này cho nhân viên quét khi vào hoặc ra bãi.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQRPassPage;
