import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, CreditCard, QrCode, ShieldCheck, X } from "lucide-react";

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

const getPassQrValue = (pass) => pass?.qrCode || pass?.code || "";

const getPassPackageName = (pass) =>
  pass?.packagePlanName || pass?.packageName || pass?.planName || "Gói tháng";

const getPassStartDate = (pass) => pass?.monthlyPassStartDate || pass?.startDate || pass?.validFrom;

const getPassEndDate = (pass) => pass?.monthlyPassEndDate || pass?.endDate || pass?.validTo;

const showLegacyQrModal = false;

const MyQRPassPage = () => {
  const dispatch = useDispatch();
  const {
    packagePlans,
    monthlyPasses,
    qrPasses,
    slotRegistrations,
    vehicles,
    notice,
  } = useSelector((state) => state.parking);
  const { user } = useSelector((state) => state.auth);
  const { floors } = useSelector((state) => state.floors);
  const { slotsByFloor, loading: slotsLoading } = useSelector((state) => state.slots);

  const [selectedPass, setSelectedPass] = useState(null);
  const [paymentReturn] = useState(getPaymentReturnFromUrl);
  const [purchaseForm, setPurchaseForm] = useState({
    packagePlanId: "",
    vehicleId: "",
    slotId: "",
    carFloorId: "",
  });

  useEffect(() => {
    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchPackagePlansRequest({ status: "ACTIVE", buildingId: user?.buildingId }));
    dispatch(fetchMyVehiclesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
  }, [dispatch, user?.buildingId]);

  useEffect(() => {
    if (!user?.buildingId) return;
    dispatch(fetchFloorsRequest({ buildingId: user.buildingId, status: "ACTIVE", limit: 100 }));
  }, [dispatch, user?.buildingId]);

  useEffect(() => {
    if (!paymentReturn) return;

    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
    window.history.replaceState({}, "", window.location.pathname);
  }, [dispatch, paymentReturn]);

  const approvedVehicles = useMemo(() => {
    return vehicles.mine.filter((vehicle) => ["APPROVED", "ACTIVE"].includes(vehicle.status));
  }, [vehicles.mine]);

  const effectiveVehicleId = purchaseForm.vehicleId || approvedVehicles[0]?.id || "";

  const selectedVehicle = useMemo(() => {
    return approvedVehicles.find((vehicle) => String(vehicle.id) === String(effectiveVehicleId));
  }, [approvedVehicles, effectiveVehicleId]);

  const availablePackagePlans = useMemo(() => {
    return packagePlans.items.filter(
      (plan) => !selectedVehicle || plan.vehicleType === selectedVehicle.vehicleType
    );
  }, [packagePlans.items, selectedVehicle]);

  const effectivePackagePlanId =
    purchaseForm.packagePlanId &&
    availablePackagePlans.some((plan) => String(plan.id) === String(purchaseForm.packagePlanId))
      ? purchaseForm.packagePlanId
      : availablePackagePlans[0]?.id || "";

  const selectedPackage = useMemo(() => {
    return availablePackagePlans.find((plan) => String(plan.id) === String(effectivePackagePlanId));
  }, [availablePackagePlans, effectivePackagePlanId]);

  const carFloors = useMemo(() => {
    return floors.filter(
      (floor) =>
        Number(floor.buildingId) === Number(user?.buildingId) &&
        floor.floorType === "CAR" &&
        floor.status === "ACTIVE"
    );
  }, [floors, user?.buildingId]);

  const effectiveCarFloorId = purchaseForm.carFloorId || (carFloors[0]?.id ? String(carFloors[0].id) : "");
  const carSlotsInFloor = useMemo(() => {
    return effectiveCarFloorId ? slotsByFloor[effectiveCarFloorId] || [] : [];
  }, [effectiveCarFloorId, slotsByFloor]);
  const availableCarSlots = useMemo(
    () => carSlotsInFloor.filter((slot) => slot.status === "AVAILABLE"),
    [carSlotsInFloor]
  );
  const effectiveSlotId =
    purchaseForm.slotId && availableCarSlots.some((slot) => String(slot.id) === String(purchaseForm.slotId))
      ? purchaseForm.slotId
      : String(availableCarSlots[0]?.id || "");

  useEffect(() => {
    if (!effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveCarFloorId }));
  }, [dispatch, effectiveCarFloorId]);

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

  const continueMonthlyPayment = (pass) => {
    dispatch(
      continueMonthlyPassPaymentRequest({
        id: pass.id,
        bankCode: "NCB",
        locale: "vn",
      })
    );
  };

  const activePassCount = qrPasses.mine.filter((pass) => (pass.status || "ACTIVE") === "ACTIVE").length;
  const pendingMonthlyPasses = monthlyPasses.mine.filter((pass) =>
    ["PENDING_PAYMENT", "CANCELLED"].includes(pass.status)
  );
  const hasPendingRequests =
    pendingMonthlyPasses.length > 0 || slotRegistrations.mine.length > 0;

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
        ]}
      />
      {selectedPass && (
        <section className="card section-card animate-fade-in qr-follow-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> {selectedPass.plateNumber}</h2>
              <p className="section-copy">{getPassPackageName(selectedPass)}</p>
            </div>
            <button className="theme-toggle-btn" onClick={() => setSelectedPass(null)} aria-label="Đóng QR">
              <X size={18} />
            </button>
          </div>
          <div className="qr-box" style={{ width: 250, height: 250, margin: "0 auto" }}>
            <QrCodeImage
              value={getPassQrValue(selectedPass)}
              size={226}
              title={`QR ${selectedPass.plateNumber || ""}`}
            />
          </div>
          <div className="data-list" style={{ marginTop: 16, textAlign: "left" }}>
            <div className="data-row"><span>Xe đăng ký</span><strong>{selectedPass.plateNumber || selectedPass.vehiclePlateNumber}</strong></div>
            <div className="data-row"><span>Loại xe</span><strong>{getVehicleTypeLabel(selectedPass.vehicleType)}</strong></div>
            <div className="data-row"><span>Gói tháng</span><strong>{getPassPackageName(selectedPass)}</strong></div>
            <div className="data-row"><span>Hiệu lực</span><strong>{formatDate(getPassStartDate(selectedPass))} - {formatDate(getPassEndDate(selectedPass))}</strong></div>
            <div className="data-row"><span>Mã QR</span><strong>{getPassQrValue(selectedPass)}</strong></div>
          </div>
          <p className="section-copy" style={{ marginTop: 16 }}>Đưa mã này cho nhân viên quét khi vào hoặc ra bãi.</p>
        </section>
      )}

      <div className="dashboard-grid">
        {qrPasses.mine.map((pass) => (
          <div className="card section-card" key={pass.id}>
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {pass.plateNumber || pass.vehiclePlateNumber}</h2>
                <p className="section-copy">{getPassPackageName(pass)} - {getVehicleTypeLabel(pass.vehicleType)}</p>
              </div>
              <span className={`pill ${getStatusTone(pass.status || "ACTIVE")}`}>{getStatusLabel(pass.status || "ACTIVE")}</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button
                className="qr-box"
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
              <div className="data-list" style={{ flex: 1 }}>
                <div className="data-row"><span>Gói tháng</span><strong>{getPassPackageName(pass)}</strong></div>
                <div className="data-row"><span>Xe đăng ký</span><strong>{pass.plateNumber || pass.vehiclePlateNumber} - {getVehicleTypeLabel(pass.vehicleType)}</strong></div>
                <div className="data-row"><span>Tòa nhà</span><strong>{pass.buildingName || "Tòa nhà đã đăng ký"}</strong></div>
                <div className="data-row"><span>Hiệu lực</span><strong>{formatDate(getPassStartDate(pass))} - {formatDate(getPassEndDate(pass))}</strong></div>
                <div className="data-row"><span>Giá trị gói</span><strong>{formatCurrency(pass.amount || pass.price || 0)}</strong></div>
                <div className="data-row"><span>Mã QR</span><strong>{getPassQrValue(pass) || "Đang chờ tạo"}</strong></div>
              </div>
            </div>
            <div className="action-row" style={{ marginTop: 16 }}>
              <Button variant="primary" size="sm" icon={QrCode} disabled={!getPassQrValue(pass)} onClick={() => setSelectedPass(pass)}>Phóng to QR</Button>
              <Button variant="outline" size="sm" icon={Calendar}>Gia hạn</Button>
            </div>
          </div>
        ))}
        {qrPasses.mine.length === 0 && (
          <section className="card section-card">
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
                  {carFloors.length > 1 && (
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
                      const isAvailable = slot.status === "AVAILABLE";
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

                  {slotsLoading && <p className="section-copy">Đang tải ô đỗ...</p>}
                  {!slotsLoading && carSlotsInFloor.length === 0 && (
                    <p className="section-copy">Tòa nhà của bạn chưa có ô ô tô còn hoạt động.</p>
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

      {showLegacyQrModal && selectedPass && (
        <div
          className="qr-modal-overlay"
          onClick={() => setSelectedPass(null)}
        >
          <div className="card section-card animate-fade-in qr-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <div>
                <h2 className="section-title"><QrCode size={19} /> {selectedPass.plateNumber}</h2>
                <p className="section-copy">{getPassPackageName(selectedPass)}</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedPass(null)} aria-label="Đóng QR">
                <X size={18} />
              </button>
            </div>
            <div className="qr-box" style={{ width: 250, height: 250, margin: "0 auto" }}>
              <QrCodeImage
                value={getPassQrValue(selectedPass)}
                size={226}
                title={`QR ${selectedPass.plateNumber || ""}`}
              />
            </div>
            <div className="data-list" style={{ marginTop: 16, textAlign: "left" }}>
              <div className="data-row"><span>Xe đăng ký</span><strong>{selectedPass.plateNumber || selectedPass.vehiclePlateNumber}</strong></div>
              <div className="data-row"><span>Loại xe</span><strong>{getVehicleTypeLabel(selectedPass.vehicleType)}</strong></div>
              <div className="data-row"><span>Gói tháng</span><strong>{getPassPackageName(selectedPass)}</strong></div>
              <div className="data-row"><span>Hiệu lực</span><strong>{formatDate(getPassStartDate(selectedPass))} - {formatDate(getPassEndDate(selectedPass))}</strong></div>
              <div className="data-row"><span>Mã QR</span><strong>{getPassQrValue(selectedPass)}</strong></div>
            </div>
            <p className="section-copy" style={{ marginTop: 16 }}>Đưa mã này cho nhân viên quét khi vào hoặc ra bãi.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQRPassPage;
