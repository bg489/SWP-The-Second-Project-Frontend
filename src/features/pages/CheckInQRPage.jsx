import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownLeft, Camera, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
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
import {
  carSlots,
  floors,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  vehicles,
} from "../../services/mockParkingData";

const CheckInQRPage = () => {
  const dispatch = useDispatch();
  const { parkingSessions, qrPasses, tempQrCards, notice } = useSelector((state) => state.parking);

  const [form, setForm] = useState({
    plateNumber: "51G-776.51",
    vehicleType: "CAR",
    customerType: "WALK_IN_GUEST",
    qrCode: "",
    tempQrCardCode: "TMP-001",
    slotId: "4",
  });
  const [scannerTarget, setScannerTarget] = useState("");

  useEffect(() => {
    dispatch(fetchTempQrCardsRequest({ status: "READY" }));
    dispatch(fetchActiveParkingSessionsRequest());
  }, [dispatch]);

  const readyCards = tempQrCards.items.filter((card) => card.status === "READY");
  const availableCarSlots = carSlots.filter((slot) => slot.status === "AVAILABLE");
  const approvedVehicle = vehicles.find(
    (vehicle) => vehicle.plateNumber === form.plateNumber && vehicle.status === "APPROVED"
  );

  const motorbikeFloor = useMemo(() => {
    return floors.find((floor) => floor.floorType === "MOTORBIKE" && floor.currentCount < floor.capacity);
  }, []);

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
      updateForm("qrCode", scannedValue);
      return;
    }

    updateForm("tempQrCardCode", scannedValue.toUpperCase());
  };

  const submitCheckIn = (event) => {
    event.preventDefault();

    const payload = {
      plateNumber: form.plateNumber.trim().toUpperCase(),
      vehicleType: form.vehicleType,
      buildingId: 1,
    };

    if (form.customerType === "REGISTERED_USER") {
      payload.qrCode = form.qrCode.trim();
    } else {
      payload.tempQrCardCode = form.tempQrCardCode;
    }

    if (form.vehicleType === "CAR") {
      payload.slotId = Number(form.slotId || availableCarSlots[0]?.id);
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

      {(notice || parkingSessions.error || qrPasses.error || tempQrCards.error) && (
        <section className="card soft-panel">
          {notice && <span className="pill success">{notice}</span>}
          {parkingSessions.error && <p style={{ color: "var(--danger)" }}>{parkingSessions.error}</p>}
          {qrPasses.error && <p style={{ color: "var(--danger)" }}>{qrPasses.error}</p>}
          {tempQrCards.error && <p style={{ color: "var(--danger)" }}>{tempQrCards.error}</p>}
        </section>
      )}

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

            {form.vehicleType === "CAR" && (
              <FormField label="Ô đỗ ô tô">
                <Select
                  value={form.slotId}
                  onChange={(event) => updateForm("slotId", event.target.value)}
                  options={availableCarSlots.map((slot) => ({ value: slot.id, label: slot.slotCode }))}
                  placeholder="Chọn ô còn trống"
                />
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
              <strong>Hồ sơ xe</strong>
              <p className="section-copy">{approvedVehicle ? `${approvedVehicle.owner} - đã duyệt` : "Chưa thấy xe đã duyệt, xử lý như khách gửi lẻ."}</p>
              <span className={`pill ${approvedVehicle ? "success" : "warning"}`}>{approvedVehicle ? "Hợp lệ" : "Cần kiểm tra"}</span>
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
                  ? `${availableCarSlots.length} ô còn trống để chọn.`
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
          {floors.map((floor) => (
            <div className="soft-panel" key={floor.id}>
              <strong>{floor.name}</strong>
              <p className="section-copy">{floor.floorType === "CAR" ? `${floor.slotsCount} ô đỗ ô tô` : `${floor.currentCount}/${floor.capacity} xe máy`}</p>
              <span className={`pill ${getStatusTone(floor.status)}`}>{getStatusLabel(floor.status)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CheckInQRPage;
