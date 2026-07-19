import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Camera, Clock, Layers, RefreshCcw, Save, ShieldAlert } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  confirmFloorMismatchRequest,
  confirmWrongSlotRequest,
  createViolationRequest,
  fetchActiveParkingSessionsRequest,
  fetchFloorMismatchCasesRequest,
  fetchViolationsRequest,
  fetchViolationTypesRequest,
  fetchWrongSlotCasesRequest,
  reportFloorMismatchRequest,
  reportWrongSlotRequest,
} from "../backend/parking/parkingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { fetchSlotsByFloorRequest } from "../backend/slots/slotSlice";
import { formatCurrency, formatDateTime, getStatusLabel, getVehicleTypeLabel } from "../../services/mockParkingData";
import { compressImageFile } from "../../utils/imageFile";

const slotClassName = (status) => String(status || "AVAILABLE").toLowerCase();

const wrongSlotStatusLabel = {
  ALLOWED: "Được phép đậu",
  WAITING_USER: "Chờ dời xe",
  PENALIZED: "Đã tính phí",
  CANCELLED: "Đã hủy",
};

const floorMismatchStatusLabel = {
  LOCKED_AND_PENALIZED: "Đã khóa xe và tính phí",
  WAITING_USER: "Chờ dời xe",
  TOWED: "Đã đưa về ô chỉ định",
  CANCELLED: "Đã hủy",
};

const floorMismatchTypeLabel = {
  MOTORBIKE_IN_CAR_FLOOR: "Xe máy vào khu ô tô",
  CAR_IN_MOTORBIKE_FLOOR: "Ô tô vào khu xe máy",
};

const StaffViolationsPage = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const buildingId = user?.buildingId;

  const { violationTypes, parkingSessions, violations, wrongSlotCases, floorMismatchCases, notice } = useSelector((state) => state.parking);
  const { floors, loading: floorsLoading, error: floorsError } = useSelector((state) => state.floors);
  const { slotsByFloor, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [violationTypeId, setViolationTypeId] = useState("");
  const [customName, setCustomName] = useState("");
  const [penaltyFee, setPenaltyFee] = useState("");
  const [note, setNote] = useState("");

  const [selectedCarFloorId, setSelectedCarFloorId] = useState("");
  const [wrongSlotSessionId, setWrongSlotSessionId] = useState("");
  const [observedSlotId, setObservedSlotId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [wrongSlotNote, setWrongSlotNote] = useState("");
  const [floorMismatchSessionId, setFloorMismatchSessionId] = useState("");
  const [observedFloorId, setObservedFloorId] = useState("");
  const [targetCarFloorId, setTargetCarFloorId] = useState("");
  const [targetSlotId, setTargetSlotId] = useState("");
  const [floorEvidenceUrl, setFloorEvidenceUrl] = useState("");
  const [floorMismatchNote, setFloorMismatchNote] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchViolationTypesRequest());
    dispatch(fetchViolationsRequest());
    dispatch(fetchActiveParkingSessionsRequest(buildingId ? { buildingId } : undefined));
    dispatch(fetchWrongSlotCasesRequest(buildingId ? { buildingId } : undefined));
    dispatch(fetchFloorMismatchCasesRequest(buildingId ? { buildingId } : undefined));
    if (buildingId) {
      dispatch(fetchFloorsRequest({ buildingId, status: "ACTIVE", limit: 100 }));
    }
  }, [buildingId, dispatch]);

  const carFloors = useMemo(() => {
    return floors.filter((floor) => floor.floorType === "CAR" && (!buildingId || Number(floor.buildingId) === Number(buildingId)));
  }, [buildingId, floors]);
  const effectiveCarFloorId = selectedCarFloorId || (carFloors[0]?.id ? String(carFloors[0].id) : "");
  const currentCarSlots = effectiveCarFloorId ? slotsByFloor[effectiveCarFloorId] || [] : [];
  const effectiveTargetCarFloorId = targetCarFloorId || (carFloors[0]?.id ? String(carFloors[0].id) : "");
  const targetCarSlots = effectiveTargetCarFloorId ? slotsByFloor[effectiveTargetCarFloorId] || [] : [];
  const activeFloors = useMemo(() => {
    return floors.filter((floor) => !buildingId || Number(floor.buildingId) === Number(buildingId));
  }, [buildingId, floors]);

  useEffect(() => {
    if (!effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveCarFloorId }));
  }, [dispatch, effectiveCarFloorId]);

  useEffect(() => {
    if (!effectiveTargetCarFloorId || effectiveTargetCarFloorId === effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveTargetCarFloorId }));
  }, [dispatch, effectiveCarFloorId, effectiveTargetCarFloorId]);

  const activeSessions = useMemo(() => parkingSessions.active || [], [parkingSessions.active]);
  const carSessions = useMemo(() => activeSessions.filter((session) => session.vehicleType === "CAR"), [activeSessions]);
  const selectedFloorMismatchSession = useMemo(() => {
    return activeSessions.find((session) => String(session.id) === String(floorMismatchSessionId));
  }, [activeSessions, floorMismatchSessionId]);

  const sessionOptions = useMemo(() => {
    return activeSessions.map((session) => ({
      value: session.id,
      label: `${session.plateNumber} (${getVehicleTypeLabel(session.vehicleType)} - ${session.slotCode || "Khu xe máy"})`,
    }));
  }, [activeSessions]);

  const carSessionOptions = useMemo(() => {
    return carSessions.map((session) => ({
      value: session.id,
      label: `${session.plateNumber} - đang ghi nhận ở ${session.slotCode || "chưa có ô"}`,
    }));
  }, [carSessions]);

  const typeOptions = useMemo(() => {
    return (violationTypes.items || []).map((type) => ({ value: type.id, label: type.name }));
  }, [violationTypes.items]);

  const handleViolationTypeChange = (value) => {
    setViolationTypeId(value);
    const selectedType = violationTypes.items.find((type) => String(type.id) === String(value));
    setPenaltyFee(selectedType?.defaultPenaltyFee || selectedType?.penaltyFee || "");
  };

  const handleModeChange = (event) => {
    const customChecked = event.target.checked;
    setIsCustom(customChecked);
    setViolationTypeId("");
    setCustomName("");
    setPenaltyFee("");
  };

  const handleFloorMismatchSessionChange = (event) => {
    const sessionId = event.target.value;
    const session = activeSessions.find((item) => String(item.id) === String(sessionId));

    setFloorMismatchSessionId(sessionId);
    setObservedFloorId("");
    setTargetCarFloorId(
      session?.vehicleType === "CAR" && session.floorId ? String(session.floorId) : ""
    );
    setTargetSlotId(
      session?.vehicleType === "CAR" && session.slotId ? String(session.slotId) : ""
    );
  };

  const handleRecordViolation = (event) => {
    event.preventDefault();
    if (!selectedSessionId || !penaltyFee) return;
    if (isCustom && !customName.trim()) return;

    const selectedType = violationTypes.items.find((type) => String(type.id) === String(violationTypeId));

    dispatch(
      createViolationRequest({
        parkingSessionId: Number(selectedSessionId),
        violationTypeId: isCustom ? null : Number(violationTypeId),
        violationType: isCustom ? customName.trim() : selectedType?.name || "Vi phạm quy định bãi xe",
        penaltyFee: Number(penaltyFee),
        note: note.trim(),
      })
    );

    setViolationTypeId("");
    setCustomName("");
    setPenaltyFee("");
    setNote("");
  };

  const handleEvidenceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEvidenceUrl("");

    try {
      setEvidenceUrl(await compressImageFile(file));
      setFormError("");
    } catch (error) {
      setFormError(error.message || "Không xử lý được ảnh bằng chứng đã chọn.");
      event.target.value = "";
    }
  };

  const handleFloorEvidenceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFloorEvidenceUrl("");

    try {
      setFloorEvidenceUrl(await compressImageFile(file));
      setFormError("");
    } catch (error) {
      setFormError(error.message || "Không xử lý được ảnh bằng chứng đã chọn.");
      event.target.value = "";
    }
  };

  const handleReportWrongSlot = (event) => {
    event.preventDefault();

    if (!wrongSlotSessionId || !observedSlotId) {
      setFormError("Vui lòng chọn xe ô tô và ô đang đậu thực tế.");
      return;
    }

    if (!evidenceUrl) {
      setFormError("Vui lòng thêm hình ảnh bằng chứng trước khi gửi thông báo.");
      return;
    }

    setFormError("");
    dispatch(
      reportWrongSlotRequest({
        buildingId,
        parkingSessionId: Number(wrongSlotSessionId),
        observedSlotId: Number(observedSlotId),
        evidenceUrl,
        note: wrongSlotNote.trim() || undefined,
      })
    );
  };

  const handleReportFloorMismatch = (event) => {
    event.preventDefault();

    if (!floorMismatchSessionId || !observedFloorId) {
      setFormError("Vui lòng chọn xe và tầng đang đậu thực tế.");
      return;
    }

    if (!floorEvidenceUrl) {
      setFormError("Vui lòng thêm hình ảnh bằng chứng trước khi gửi thông báo.");
      return;
    }

    setFormError("");
    dispatch(
      reportFloorMismatchRequest({
        buildingId,
        parkingSessionId: Number(floorMismatchSessionId),
        observedFloorId: Number(observedFloorId),
        targetSlotId: targetSlotId ? Number(targetSlotId) : undefined,
        evidenceUrl: floorEvidenceUrl,
        note: floorMismatchNote.trim() || undefined,
      })
    );
  };

  const violationColumns = [
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    { header: "Nội dung", key: "violationType", render: (row) => row.violationType || row.violationTypeName },
    { header: "Tiền phạt", key: "penaltyFee", render: (row) => <span className="text-danger">{formatCurrency(row.penaltyFee || row.fine || 0)}</span> },
    { header: "Thời gian", key: "detectedAt", render: (row) => formatDateTime(row.detectedAt || row.createdAt) },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => row.status === "COLLECTED" ? <span className="pill success">Đã thu</span> : <span className="pill danger">Chưa thu</span>,
    },
  ];

  const wrongSlotColumns = [
    { header: "Xe đậu sai", key: "plateNumber", render: (row) => <strong>{row.plateNumber || `#${row.parkingSessionId}`}</strong> },
    { header: "Ô cũ", key: "originalSlotCode", render: (row) => row.originalSlotCode || "-" },
    { header: "Ô đang đậu", key: "observedSlotCode", render: (row) => row.observedSlotCode || "-" },
    { header: "Xe đã đặt ô", key: "reservedPlateNumber", render: (row) => row.reservedPlateNumber || "Chưa có" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${row.status === "ALLOWED" ? "success" : row.status === "PENALIZED" ? "danger" : "warning"}`}>{wrongSlotStatusLabel[row.status] || row.status}</span>,
    },
    { header: "Hạn dời xe", key: "notifyUntil", render: (row) => row.notifyUntil ? formatDateTime(row.notifyUntil) : "-" },
    {
      header: "Bằng chứng",
      key: "evidenceUrl",
      render: (row) => row.evidenceUrl ? <img className="evidence-thumb" src={row.evidenceUrl} alt="Bằng chứng" /> : "-",
    },
    {
      header: "Xử lý",
      key: "actions",
      render: (row) => (
        row.status === "WAITING_USER" ? (
          <Button
            size="sm"
            variant="danger"
            icon={ShieldAlert}
            loading={wrongSlotCases.confirmingId === row.id}
            disabled={wrongSlotCases.confirmingId === row.id}
            onClick={() => dispatch(confirmWrongSlotRequest({ id: row.id, buildingId, force: true }))}
          >
            Xác nhận chưa dời
          </Button>
        ) : (
          row.reassignedSlotCode || "-"
        )
      ),
    },
  ];

  const floorMismatchColumns = [
    { header: "Xe", key: "plateNumber", render: (row) => <strong>{row.plateNumber || `#${row.parkingSessionId}`}</strong> },
    { header: "Tình huống", key: "mismatchType", render: (row) => floorMismatchTypeLabel[row.mismatchType] || row.mismatchType },
    { header: "Tầng đúng", key: "originalFloorName", render: (row) => row.originalFloorName || "-" },
    { header: "Tầng đang đậu", key: "observedFloorName", render: (row) => row.observedFloorName || "-" },
    { header: "Ô chỉ định", key: "targetSlotCode", render: (row) => row.targetSlotCode || "-" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => (
        <span className={`pill ${row.status === "WAITING_USER" ? "warning" : row.status === "TOWED" || row.status === "LOCKED_AND_PENALIZED" ? "danger" : "success"}`}>
          {floorMismatchStatusLabel[row.status] || row.status}
        </span>
      ),
    },
    { header: "Hạn dời xe", key: "notifyUntil", render: (row) => row.notifyUntil ? formatDateTime(row.notifyUntil) : "-" },
    {
      header: "Bằng chứng",
      key: "evidenceUrl",
      render: (row) => row.evidenceUrl ? <img className="evidence-thumb" src={row.evidenceUrl} alt="Bằng chứng" /> : "-",
    },
    {
      header: "Xử lý",
      key: "actions",
      render: (row) => (
        row.status === "WAITING_USER" ? (
          <Button
            size="sm"
            variant="danger"
            icon={ShieldAlert}
            loading={floorMismatchCases.confirmingId === row.id}
            disabled={floorMismatchCases.confirmingId === row.id}
            onClick={() => dispatch(confirmFloorMismatchRequest({ id: row.id, buildingId, force: true }))}
          >
            Xác nhận quá hạn
          </Button>
        ) : (
          row.violationId ? `#${row.violationId}` : "-"
        )
      ),
    },
  ];

  return (
    <div className="parking-page animate-fade-in">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><AlertTriangle size={16} /> Vi phạm</div>
          <h1 className="page-title">Ghi nhận vi phạm và xử lý ô tô đậu sai ô</h1>
          <p className="page-subtitle">
            Nhân viên có thể lập biên bản thường hoặc gửi thông báo dời xe khi ô tô đậu vào ô đã được đặt trước.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Ca sai ô đang chờ</span>
          <span className="page-hero-number">
            {wrongSlotCases.items.filter((item) => item.status === "WAITING_USER").length +
              floorMismatchCases.items.filter((item) => item.status === "WAITING_USER").length}
          </span>
          <span className="page-hero-label">cần theo dõi</span>
        </div>
      </section>

      <StatusBanner
        success={notice}
        errors={[
          formError,
          violationTypes.error,
          parkingSessions.error,
          violations.error,
          wrongSlotCases.error,
          floorMismatchCases.error,
          floorsError,
          slotsError,
        ]}
      />

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Save size={19} /> Ghi nhận vi phạm thường</h2>
              <p className="section-copy">Dùng cho các lỗi có phí phạt cần cộng vào lượt gửi xe.</p>
            </div>
          </div>
          <form onSubmit={handleRecordViolation} style={{ display: "grid", gap: 14 }}>
            <FormField label="Xe đang trong bãi" required>
              <Select value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)} options={sessionOptions} placeholder="Chọn xe vi phạm" />
            </FormField>

            <label className="check-row">
              <input type="checkbox" checked={isCustom} onChange={handleModeChange} />
              <span>Tự nhập lỗi khác danh mục</span>
            </label>

            {isCustom ? (
              <FormField label="Tên lỗi" required>
                <Input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Ví dụ: đậu chắn lối đi" />
              </FormField>
            ) : (
              <FormField label="Lỗi có sẵn" required>
                <Select value={violationTypeId} onChange={(event) => handleViolationTypeChange(event.target.value)} options={typeOptions} placeholder="Chọn lỗi" />
              </FormField>
            )}

            <FormField label="Tiền phạt" required>
              <Input type="number" min="0" value={penaltyFee} onChange={(event) => setPenaltyFee(event.target.value)} />
            </FormField>

            <FormField label="Ghi chú">
              <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Mô tả ngắn tình huống" />
            </FormField>

            <Button type="submit" variant="primary" icon={Save}>Ghi biên bản</Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldAlert size={19} /> Ô tô đậu sai ô</h2>
              <p className="section-copy">Nếu ô chưa được đặt trước, xe được phép đậu và không tính phí. Nếu ô đã được đặt, hệ thống gửi thông báo kèm ảnh.</p>
            </div>
          </div>
          <form onSubmit={handleReportWrongSlot} style={{ display: "grid", gap: 14 }}>
            <FormField label="Xe ô tô đang đậu sai" required>
              <Select value={wrongSlotSessionId} onChange={(event) => setWrongSlotSessionId(event.target.value)} options={carSessionOptions} placeholder="Chọn xe ô tô" />
            </FormField>

            <FormField label="Tầng ô tô">
              <Select
                value={effectiveCarFloorId}
                onChange={(event) => {
                  setSelectedCarFloorId(event.target.value);
                  setObservedSlotId("");
                }}
                options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                placeholder={floorsLoading ? "Đang tải tầng..." : "Chọn tầng"}
              />
            </FormField>

            <div className="car-slot-grid">
              {currentCarSlots.map((slot) => {
                const isSelected = String(observedSlotId) === String(slot.id);
                const disabled = ["MAINTENANCE", "LOCKED"].includes(slot.status);

                return (
                  <button
                    type="button"
                    key={slot.id}
                    className={`car-slot-card ${slotClassName(slot.status)} ${isSelected ? "selected wrong-slot-selected" : ""}`}
                    disabled={disabled}
                    onClick={() => setObservedSlotId(String(slot.id))}
                  >
                    <span className="car-slot-code">{slot.slotCode}</span>
                    <span className="car-slot-status">{getStatusLabel(slot.status)}</span>
                  </button>
                );
              })}
            </div>
            {slotsLoading && <p className="section-copy">Đang tải ô đỗ...</p>}

            <FormField label="Ảnh bằng chứng" required>
              <label className="file-upload-panel">
                <Camera size={18} />
                <span>{evidenceUrl ? "Đã chọn ảnh bằng chứng" : "Chọn ảnh từ thiết bị"}</span>
                <input type="file" accept="image/*" onChange={handleEvidenceFile} />
              </label>
            </FormField>
            {evidenceUrl && <img className="evidence-preview" src={evidenceUrl} alt="Ảnh bằng chứng" />}

            <FormField label="Ghi chú">
              <Input value={wrongSlotNote} onChange={(event) => setWrongSlotNote(event.target.value)} placeholder="Ví dụ: xe đang đậu tại C-06, đã chụp ảnh lúc 08:15" />
            </FormField>

            <Button type="submit" variant="primary" icon={ShieldAlert} loading={wrongSlotCases.reporting}>
              Gửi xử lý sai ô
            </Button>
          </form>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Xe đậu sai khu</h2>
            <p className="section-copy">
              Xe máy vào khu ô tô sẽ được đưa vào góc an toàn, khóa xe và tính phí. Ô tô vào khu xe máy sẽ được nhắc dời trong 15 phút trước khi đưa về ô chỉ định.
            </p>
          </div>
        </div>

        <form onSubmit={handleReportFloorMismatch} style={{ display: "grid", gap: 14 }}>
          <div className="two-column-grid">
            <FormField label="Xe đang trong bãi" required>
              <Select
                value={floorMismatchSessionId}
                onChange={handleFloorMismatchSessionChange}
                options={sessionOptions}
                placeholder="Chọn xe đậu sai khu"
              />
            </FormField>

            <FormField label="Tầng đang đậu thực tế" required>
              <Select
                value={observedFloorId}
                onChange={(event) => setObservedFloorId(event.target.value)}
                options={activeFloors.map((floor) => ({
                  value: floor.id,
                  label: `${floor.name} - ${getVehicleTypeLabel(floor.floorType)}`,
                }))}
                placeholder={floorsLoading ? "Đang tải tầng..." : "Chọn tầng đang thấy xe"}
              />
            </FormField>
          </div>

          {selectedFloorMismatchSession?.vehicleType === "CAR" && (
            <div style={{ display: "grid", gap: 14 }}>
              <FormField label="Ô chỉ định nếu cần đưa xe về">
                <Select
                  value={effectiveTargetCarFloorId}
                  onChange={(event) => {
                    setTargetCarFloorId(event.target.value);
                    setTargetSlotId("");
                  }}
                  options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                  placeholder={floorsLoading ? "Đang tải tầng ô tô..." : "Chọn tầng ô tô"}
                />
              </FormField>

              <div className="car-slot-grid">
                {targetCarSlots.map((slot) => {
                  const isSelected = String(targetSlotId) === String(slot.id);
                  const isAssignedSlot =
                    String(selectedFloorMismatchSession?.slotId || "") === String(slot.id);
                  const disabled = slot.status !== "AVAILABLE" && !isAssignedSlot;

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      className={`car-slot-card ${slotClassName(slot.status)} ${isAssignedSlot ? "assigned-to-session" : ""} ${isSelected ? "selected wrong-slot-selected" : ""}`}
                      disabled={disabled}
                      onClick={() => setTargetSlotId(String(slot.id))}
                      title={isAssignedSlot ? "Ô đã được gán cho xe này" : undefined}
                    >
                      <span className="car-slot-code">{slot.slotCode}</span>
                      <span className="car-slot-status">
                        {isAssignedSlot ? "Ô đã gán" : getStatusLabel(slot.status)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="section-copy">
                Ô đã gán cho xe được ưu tiên tự động. Nhân viên vẫn có thể chọn một ô trống khác khi cần.
              </p>
            </div>
          )}

          <FormField label="Ảnh bằng chứng" required>
            <label className="file-upload-panel">
              <Camera size={18} />
              <span>{floorEvidenceUrl ? "Đã chọn ảnh bằng chứng" : "Chọn ảnh từ thiết bị"}</span>
              <input type="file" accept="image/*" onChange={handleFloorEvidenceFile} />
            </label>
          </FormField>
          {floorEvidenceUrl && <img className="evidence-preview" src={floorEvidenceUrl} alt="Ảnh bằng chứng" />}

          <FormField label="Ghi chú">
            <Input
              value={floorMismatchNote}
              onChange={(event) => setFloorMismatchNote(event.target.value)}
              placeholder="Ví dụ: xe đang ở khu sai loại, đã chụp ảnh và báo chủ xe"
            />
          </FormField>

          <Button type="submit" variant="primary" icon={ShieldAlert} loading={floorMismatchCases.reporting}>
            Gửi xử lý sai khu
          </Button>
        </form>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Clock size={19} /> Danh sách ô tô đậu sai ô</h2>
            <p className="section-copy">Theo dõi thông báo dời xe, ảnh bằng chứng và việc gán ô mới cho xe đã đặt trước.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={() => dispatch(fetchWrongSlotCasesRequest(buildingId ? { buildingId } : undefined))}>
            Tải lại
          </Button>
        </div>
        <Table columns={wrongSlotColumns} data={wrongSlotCases.items} loading={wrongSlotCases.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Clock size={19} /> Danh sách xe đậu sai khu</h2>
            <p className="section-copy">Theo dõi xe máy vào khu ô tô, ô tô vào khu xe máy, ảnh bằng chứng và ô chỉ định khi cần đưa xe về.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={() => dispatch(fetchFloorMismatchCasesRequest(buildingId ? { buildingId } : undefined))}>
            Tải lại
          </Button>
        </div>
        <Table columns={floorMismatchColumns} data={floorMismatchCases.items} loading={floorMismatchCases.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Biên bản vi phạm</h2>
            <p className="section-copy">Các khoản phạt này sẽ được cộng khi xe ra bãi nếu chưa thu.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={() => dispatch(fetchViolationsRequest())}>
            Tải lại
          </Button>
        </div>
        <Table columns={violationColumns} data={violations.items} loading={violations.loading} />
      </section>
    </div>
  );
};

export default StaffViolationsPage;
