import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownLeft, Camera, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import QrCameraScanner from "../../components/QrScanner/QrCameraScanner";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import {
  checkInRequest,
  clearParkingNotice,
  fetchActiveParkingSessionsRequest,
  fetchTempQrCardsRequest,
  validateQrPassRequest,
} from "../backend/parking/parkingSlice";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { fetchSlotsByFloorRequest } from "../backend/slots/slotSlice";
import {
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";

const slotClassName = (status) => String(status || "AVAILABLE").toLowerCase();

const CheckInQRPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { parkingSessions, qrPasses, tempQrCards, notice } = useSelector((state) => state.parking);
  const { buildings, error: buildingsError } = useSelector((state) => state.buildings);
  const { floors, loading: floorsLoading, error: floorsError } = useSelector((state) => state.floors);
  const { slotsByFloor, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  const [form, setForm] = useState({
    plateNumber: "",
    vehicleType: "CAR",
    customerType: "WALK_IN_GUEST",
    qrCode: "",
    tempQrCardCode: "TMP-001",
    slotId: "",
  });
  const [selectedCarFloorId, setSelectedCarFloorId] = useState("");
  const [selectedMotorbikeFloorId, setSelectedMotorbikeFloorId] = useState("");
  const [scannerTarget, setScannerTarget] = useState("");
  const [formError, setFormError] = useState("");

  const currentBuildingId = user?.buildingId;
  const currentBuilding = useMemo(() => {
    return buildings.find((building) => Number(building.id) === Number(currentBuildingId)) || {
      id: currentBuildingId,
      name: user?.buildingName || "Chưa có tòa nhà",
      address: user?.buildingAddress || "",
    };
  }, [buildings, currentBuildingId, user?.buildingAddress, user?.buildingName]);

  const buildingFloors = useMemo(() => {
    return floors.filter((floor) => Number(floor.buildingId) === Number(currentBuildingId));
  }, [floors, currentBuildingId]);

  const motorbikeFloors = useMemo(() => {
    return buildingFloors.filter((floor) => floor.floorType === "MOTORBIKE" && floor.status === "ACTIVE");
  }, [buildingFloors]);

  const carFloors = useMemo(() => {
    return buildingFloors.filter((floor) => floor.floorType === "CAR" && floor.status === "ACTIVE");
  }, [buildingFloors]);

  const validQrPass = qrPasses.validation?.valid || qrPasses.validation?.isValid
    ? qrPasses.validation.qrPass || qrPasses.validation.pass
    : null;
  const registeredReservedSlotId = validQrPass?.slotId ? String(validQrPass.slotId) : "";
  const registeredSlotFloorId = validQrPass?.slotFloorId ? String(validQrPass.slotFloorId) : "";
  const effectiveCarFloorId =
    (form.customerType === "REGISTERED_USER" && registeredSlotFloorId ? registeredSlotFloorId : "") ||
    selectedCarFloorId ||
    (carFloors[0]?.id ? String(carFloors[0].id) : "");
  const firstAvailableMotorbikeFloor = motorbikeFloors.find((floor) => Number(floor.currentCount || 0) < Number(floor.capacity || 0));
  const effectiveMotorbikeFloorId = selectedMotorbikeFloorId || (firstAvailableMotorbikeFloor?.id ? String(firstAvailableMotorbikeFloor.id) : "");

  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!currentBuildingId) return;

    dispatch(fetchFloorsRequest({ buildingId: currentBuildingId, status: "ACTIVE", limit: 100 }));
    dispatch(fetchActiveParkingSessionsRequest({ buildingId: currentBuildingId }));
    dispatch(fetchTempQrCardsRequest({ buildingId: currentBuildingId, status: "READY" }));
  }, [currentBuildingId, dispatch]);

  useEffect(() => {
    if (!effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveCarFloorId }));
  }, [dispatch, effectiveCarFloorId]);

  const readyCards = tempQrCards.items.filter((card) => card.status === "READY");
  const currentCarSlots = useMemo(() => {
    return effectiveCarFloorId ? slotsByFloor[effectiveCarFloorId] || [] : [];
  }, [effectiveCarFloorId, slotsByFloor]);
  const isRegisteredCustomer = form.customerType === "REGISTERED_USER";
  const isSelectableCarSlot = (slot) =>
    (!isRegisteredCustomer && slot.status === "AVAILABLE") ||
    (isRegisteredCustomer &&
      Boolean(registeredReservedSlotId) &&
      ["AVAILABLE", "RESERVED"].includes(slot.status) &&
      String(slot.id) === registeredReservedSlotId);
  const selectableCarSlots = currentCarSlots.filter(isSelectableCarSlot);
  const availableCarSlots = currentCarSlots.filter((slot) => slot.status === "AVAILABLE");
  const preferredCarSlot = registeredReservedSlotId
    ? selectableCarSlots.find((slot) => String(slot.id) === registeredReservedSlotId)
    : null;
  const fallbackCarSlot = isRegisteredCustomer ? null : selectableCarSlots[0];
  const formSlotStillAvailable = selectableCarSlots.some((slot) => String(slot.id) === String(form.slotId));
  const selectedCarSlotId = String(
    (formSlotStillAvailable ? form.slotId : preferredCarSlot?.id || fallbackCarSlot?.id) || ""
  );
  const selectedSlot = currentCarSlots.find((slot) => String(slot.id) === selectedCarSlotId);

  const motorbikeFloor = useMemo(() => {
    return motorbikeFloors.find((floor) => String(floor.id) === String(effectiveMotorbikeFloorId));
  }, [effectiveMotorbikeFloorId, motorbikeFloors]);

  const motorbikeCapacity = useMemo(() => {
    return motorbikeFloors.reduce(
      (sum, floor) => ({
        capacity: sum.capacity + Number(floor.capacity || 0),
        current: sum.current + Number(floor.currentCount || 0),
      }),
      { capacity: 0, current: 0 }
    );
  }, [motorbikeFloors]);

  const carSummary = useMemo(() => {
    return currentCarSlots.reduce(
      (sum, slot) => {
        const status = slot.status || "AVAILABLE";
        return {
          ...sum,
          total: sum.total + 1,
          available: sum.available + (status === "AVAILABLE" ? 1 : 0),
          occupied: sum.occupied + (status === "OCCUPIED" ? 1 : 0),
          reserved: sum.reserved + (status === "RESERVED" ? 1 : 0),
        };
      },
      { total: 0, available: 0, occupied: 0, reserved: 0 }
    );
  }, [currentCarSlots]);

  const tempQrOptions = useMemo(() => {
    const options = readyCards.map((card) => ({
      value: card.cardCode || card.id,
      label: `${card.cardCode || card.id} - ${card.label || "Sẵn sàng"}`,
    }));
    const selectedCode = form.tempQrCardCode;

    if (selectedCode && !options.some((option) => option.value === selectedCode)) {
      options.unshift({
        value: selectedCode,
        label: `${selectedCode} - Đang chọn`,
      });
    }

    return options;
  }, [form.tempQrCardCode, readyCards]);

  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setFormError("");
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "vehicleType" && value === "MOTORBIKE") {
        next.slotId = "";
      }
      if (field === "vehicleType" && value === "CAR" && !next.slotId) {
        next.slotId = String(availableCarSlots[0]?.id || "");
      }
      return next;
    });
  };

  const validateQr = () => {
    if (!form.qrCode.trim()) return;
    dispatch(validateQrPassRequest({ qrCode: form.qrCode.trim() }));
  };

  const openScanner = (target) => {
    setScannerTarget(target);
  };

  const handleQrScan = (value) => {
    const scannedValue = value.trim();

    if (!scannedValue) return;

    if (scannerTarget === "MONTHLY") {
      dispatch(clearParkingNotice());
      setFormError("");
      setForm((prev) => ({
        ...prev,
        plateNumber: "",
        qrCode: scannedValue,
      }));
      dispatch(validateQrPassRequest({ qrCode: scannedValue }));
      return;
    }

    updateForm("tempQrCardCode", scannedValue.toUpperCase());
  };

  const submitCheckIn = (event) => {
    event.preventDefault();
    setFormError("");

    if (!currentBuildingId) {
      setFormError("Tài khoản nhân viên chưa được gắn tòa nhà.");
      return;
    }

    const payload = {
      plateNumber: form.plateNumber.trim().toUpperCase(),
      vehicleType: form.vehicleType,
      buildingId: Number(currentBuildingId),
    };

    if (form.customerType === "REGISTERED_USER") {
      payload.qrCode = form.qrCode.trim();
    } else {
      payload.tempQrCardCode = form.tempQrCardCode;
    }

    if (form.vehicleType === "CAR") {
      if (isRegisteredCustomer) {
        if (registeredReservedSlotId) {
          payload.slotId = Number(selectedCarSlotId || registeredReservedSlotId);
        }
      } else {
        payload.slotId = Number(form.slotId || selectedCarSlotId);
      }

      if (!isRegisteredCustomer && !payload.slotId) {
        setFormError("Tòa nhà hiện tại chưa còn ô ô tô trống để nhận xe.");
        return;
      }
    } else if (motorbikeFloor?.id) {
      if (Number(motorbikeFloor.currentCount || 0) >= Number(motorbikeFloor.capacity || 0)) {
        setFormError("Tầng xe máy đang chọn đã hết chỗ.");
        return;
      }
      payload.floorId = Number(motorbikeFloor.id);
    } else {
      setFormError("Khu xe máy của tòa nhà hiện tại đã hết chỗ.");
      return;
    }

    dispatch(checkInRequest(payload));
  };

  const columns = [
    { header: "Lượt gửi", key: "id" },
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Thẻ QR", key: "qrCardId", render: (row) => row.qrCardId || row.qrCode || "-" },
    { header: "Vị trí", key: "slotCode", render: (row) => row.slotCode || "Khu xe máy" },
    { header: "Giờ vào", key: "checkInAt", render: (row) => formatDateTime(row.checkInAt) },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ArrowDownLeft size={16} /> Xe vào bãi</div>
          <h1 className="page-title">Quét QR, nhập biển số và ghi nhận xe vào</h1>
          <p className="page-subtitle">
            Cư dân dùng mã QR tháng. Khách vãng lai nhận thẻ QR tạm do nhân viên phát.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">QR tạm sẵn sàng</span>
          <span className="page-hero-number">{readyCards.length}</span>
          <span className="page-hero-label">thẻ</span>
        </div>
      </section>

      <section className="card soft-panel">
        <div className="data-row">
          <span>Tòa nhà đang nhận xe</span>
          <strong>{currentBuilding?.name || "Chưa có tòa nhà"}</strong>
        </div>
        <div className="data-row">
          <span>Địa chỉ</span>
          <strong>{currentBuilding?.address || "Chưa có địa chỉ"}</strong>
        </div>
        <div className="data-row">
          <span>Sức chứa xe máy</span>
          <strong>{motorbikeCapacity.current}/{motorbikeCapacity.capacity}</strong>
        </div>
        <div className="data-row">
          <span>Ô ô tô trống</span>
          <strong>{carSummary.available}/{carSummary.total}</strong>
        </div>
      </section>

      <StatusBanner
        success={notice}
        errors={[
          formError,
          parkingSessions.error,
          qrPasses.error,
          tempQrCards.error,
          buildingsError,
          floorsError,
          slotsError,
        ]}
      />

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Thông tin xe vào</h2>
              <p className="section-copy">Nhập biển số, chọn loại khách và thẻ phù hợp trước khi cho xe vào.</p>
            </div>
          </div>
          <form onSubmit={submitCheckIn} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <Input value={form.plateNumber} onChange={(event) => updateForm("plateNumber", event.target.value.toUpperCase())} />
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={form.vehicleType}
                onChange={(event) => updateForm("vehicleType", event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Loại khách">
              <Select
                value={form.customerType}
                onChange={(event) => updateForm("customerType", event.target.value)}
                options={[
                  { value: "REGISTERED_USER", label: "Cư dân có gói tháng" },
                  { value: "WALK_IN_GUEST", label: "Khách gửi lẻ" },
                ]}
                placeholder={null}
              />
            </FormField>

            {form.customerType === "REGISTERED_USER" ? (
              <FormField label="Mã QR tháng">
                <div style={{ display: "grid", gap: 10 }}>
                  <Input value={form.qrCode} onChange={(event) => updateForm("qrCode", event.target.value)} placeholder="Dán hoặc nhập mã QR" />
                  <Button type="button" variant="secondary" icon={Camera} onClick={() => openScanner("MONTHLY")}>
                    Quét bằng camera
                  </Button>
                  <Button type="button" variant="outline" icon={ShieldCheck} onClick={validateQr} loading={qrPasses.validating}>
                    Kiểm tra mã QR
                  </Button>
                  <QrCameraScanner
                    open={scannerTarget === "MONTHLY"}
                    title="Quét QR tháng"
                    onClose={() => setScannerTarget("")}
                    onScan={handleQrScan}
                  />
                </div>
              </FormField>
            ) : (
              <FormField label="Thẻ QR tạm">
                <div style={{ display: "grid", gap: 10 }}>
                  <Select
                    value={form.tempQrCardCode}
                    onChange={(event) => updateForm("tempQrCardCode", event.target.value)}
                    options={tempQrOptions}
                    placeholder="Chọn thẻ QR tạm"
                  />
                  <Button type="button" variant="secondary" icon={Camera} onClick={() => openScanner("TEMP")}>
                    Quét bằng camera
                  </Button>
                  <QrCameraScanner
                    open={scannerTarget === "TEMP"}
                    title="Quét QR tạm"
                    onClose={() => setScannerTarget("")}
                    onScan={handleQrScan}
                  />
                </div>
              </FormField>
            )}

            {form.vehicleType === "MOTORBIKE" && (
              <FormField label="Tầng xe máy">
                <Select
                  value={effectiveMotorbikeFloorId}
                  onChange={(event) => setSelectedMotorbikeFloorId(event.target.value)}
                  options={motorbikeFloors.map((floor) => ({
                    value: floor.id,
                    label: `${floor.name} - ${Math.max(Number(floor.capacity || 0) - Number(floor.currentCount || 0), 0)} chỗ trống`,
                  }))}
                  placeholder={floorsLoading ? "Đang tải tầng xe máy..." : "Chọn tầng xe máy"}
                />
              </FormField>
            )}

            {form.vehicleType === "CAR" && (
              <FormField label="Ô đỗ ô tô">
                <div style={{ display: "grid", gap: 12 }}>
                  {carFloors.length > 1 && (
                    <Select
                      value={effectiveCarFloorId}
                      onChange={(event) => {
                        setSelectedCarFloorId(event.target.value);
                        updateForm("slotId", "");
                      }}
                      options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                      placeholder="Chọn tầng ô tô"
                    />
                  )}

                  <div className="car-slot-grid">
                    {currentCarSlots.map((slot) => {
                      const isSelectable = isSelectableCarSlot(slot);
                      const isSelected = selectedCarSlotId === String(slot.id);

                      return (
                        <button
                          type="button"
                          key={slot.id}
                          className={`car-slot-card ${slotClassName(slot.status)} ${isSelected ? "selected" : ""}`}
                          disabled={!isSelectable}
                          onClick={() => updateForm("slotId", String(slot.id))}
                        >
                          <span className="car-slot-code">{slot.slotCode}</span>
                          <span className="car-slot-status">{getStatusLabel(slot.status)}</span>
                        </button>
                      );
                    })}

                    {!slotsLoading && currentCarSlots.length === 0 && (
                      <div className="soft-panel">Tầng này chưa có ô ô tô để chọn.</div>
                    )}
                  </div>

                  {slotsLoading && <p className="section-copy">Đang tải ô ô tô...</p>}
                  {isRegisteredCustomer && registeredReservedSlotId && (
                    <p className="section-copy">
                      Xe có ô đã đặt trước, nhân viên có thể chọn đúng ô đó nếu đang còn sẵn sàng.
                    </p>
                  )}
                </div>
              </FormField>
            )}

            <Button type="submit" variant="primary" icon={ArrowDownLeft} loading={parkingSessions.checkingIn}>
              Ghi nhận xe vào
            </Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Kết quả kiểm tra</h2>
              <p className="section-copy">Đối chiếu biển số, tình trạng xe và chỗ còn trống trước khi mở cổng.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel">
              <strong>Tòa nhà nhận xe</strong>
              <p className="section-copy">{currentBuilding?.name || "Chưa có tòa nhà"}{currentBuilding?.address ? ` - ${currentBuilding.address}` : ""}</p>
              <span className="pill success">Chỉ dùng sức chứa và ô của tòa này</span>
            </div>
            {qrPasses.validation && (
              <div className="soft-panel">
                <strong>Mã QR tháng</strong>
                <p className="section-copy">{qrPasses.validation.message || (qrPasses.validation.valid ? "Mã QR hợp lệ." : "Mã QR chưa hợp lệ.")}</p>
                <span className={`pill ${qrPasses.validation.valid ? "success" : "danger"}`}>{qrPasses.validation.valid ? "Có thể dùng" : "Không dùng được"}</span>
              </div>
            )}
            <div className="soft-panel">
              <strong>{form.vehicleType === "CAR" ? "Ô đỗ ô tô" : "Khu xe máy"}</strong>
              <p className="section-copy">
                {form.vehicleType === "CAR"
                  ? selectedSlot
                    ? `Đã chọn ${selectedSlot.slotCode}. Còn ${availableCarSlots.length} ô trống và ${carSummary.reserved} ô đã đặt trước trên tầng này.`
                    : `${selectableCarSlots.length} ô có thể chọn.`
                  : motorbikeFloor
                    ? `${motorbikeFloor.name} còn ${motorbikeFloor.capacity - motorbikeFloor.currentCount} chỗ.`
                    : "Khu xe máy đã đầy."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Xe đang trong bãi</h2>
            <p className="section-copy">Danh sách giúp nhân viên tránh trùng biển số hoặc thẻ QR.</p>
          </div>
        </div>
        <Table columns={columns} data={parkingSessions.active} loading={parkingSessions.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Sức chứa nhanh</h2>
            <p className="section-copy">Xe máy quản lý theo sức chứa, ô tô quản lý theo từng ô đỗ.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {buildingFloors.map((floor) => (
            <div className="soft-panel" key={floor.id}>
              <strong>{floor.name}</strong>
              <p className="section-copy">{floor.floorType === "CAR" ? `${floor.slotsCount} ô đỗ ô tô` : `${floor.currentCount}/${floor.capacity} xe máy`}</p>
              <span className={`pill ${getStatusTone(floor.status)}`}>{getStatusLabel(floor.status)}</span>
            </div>
          ))}
          {!floorsLoading && buildingFloors.length === 0 && (
            <div className="soft-panel">Tòa nhà hiện tại chưa có tầng đang hoạt động.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckInQRPage;
