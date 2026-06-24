import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CheckCircle2, RefreshCcw, Save } from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import {
  clearParkingNotice,
  createViolationRequest,
  fetchActiveParkingSessionsRequest,
  fetchViolationsRequest,
  updateViolationStatusRequest,
} from "../backend/parking/parkingSlice";
import { formatCurrency, formatDateTime, getVehicleTypeLabel } from "../../services/mockParkingData";

const violationTypes = [
  { value: "WRONG_SLOT", label: "Đậu sai ô quy định", fee: 50000 },
  { value: "LOST_QR_CARD", label: "Mất thẻ QR tạm", fee: 100000 },
  { value: "WRONG_FLOOR", label: "Đi sai tầng", fee: 50000 },
  { value: "BLOCKING_EXIT", label: "Cản lối ra vào", fee: 200000 },
];

const statusLabels = {
  OPEN: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  COLLECTED: "Đã thu tiền",
  CANCELLED: "Đã hủy",
  UNPAID: "Chưa thu tiền",
  WARNING: "Nhắc nhở",
};

const statusTone = {
  OPEN: "warning",
  RESOLVED: "info",
  COLLECTED: "success",
  CANCELLED: "danger",
  UNPAID: "warning",
  WARNING: "warning",
};

const StaffViolationsPage = () => {
  const dispatch = useDispatch();
  const { parkingSessions, violations, notice } = useSelector((state) => state.parking);

  const firstSession = parkingSessions.active[0]?.id || "";
  const [form, setForm] = useState({
    parkingSessionId: firstSession,
    violationType: "WRONG_SLOT",
    penaltyFee: "50000",
    note: "",
  });

  useEffect(() => {
    dispatch(fetchActiveParkingSessionsRequest());
    dispatch(fetchViolationsRequest());
  }, [dispatch]);

  const effectiveParkingSessionId = form.parkingSessionId || firstSession;

  const selectedSession = useMemo(() => {
    return parkingSessions.active.find((session) => String(session.id) === String(effectiveParkingSessionId));
  }, [effectiveParkingSessionId, parkingSessions.active]);

  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "violationType") {
        const selectedType = violationTypes.find((item) => item.value === value);
        next.penaltyFee = String(selectedType?.fee ?? 0);
      }

      return next;
    });
  };

  const submitViolation = (event) => {
    event.preventDefault();

    dispatch(
      createViolationRequest({
        parkingSessionId: effectiveParkingSessionId,
        violationType: form.violationType,
        penaltyFee: Number(form.penaltyFee || 0),
        note: form.note.trim(),
        plateNumber: selectedSession?.plateNumber,
        vehicleType: selectedSession?.vehicleType,
      })
    );
  };

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchActiveParkingSessionsRequest());
    dispatch(fetchViolationsRequest());
  };

  const unpaidAmount = useMemo(() => {
    return violations.items
      .filter((item) => ["OPEN", "RESOLVED", "UNPAID"].includes(item.status))
      .reduce((sum, item) => sum + Number(item.penaltyFee || item.fine || 0), 0);
  }, [violations.items]);

  const columns = [
    { header: "Lượt gửi", key: "sessionId", render: (row) => row.parkingSessionId || row.sessionId },
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber || "-"}</strong> },
    { header: "Loại xe", key: "vehicleType", render: (row) => row.vehicleType ? getVehicleTypeLabel(row.vehicleType) : "-" },
    { header: "Nội dung", key: "type", render: (row) => row.type || row.violationType },
    { header: "Thời điểm", key: "detectedAt", render: (row) => formatDateTime(row.detectedAt || row.createdAt) },
    { header: "Phí", key: "fine", render: (row) => formatCurrency(row.penaltyFee || row.fine || 0) },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => (
        <span className={`pill ${statusTone[row.status] || "neutral"}`}>
          {statusLabels[row.status] || row.status || "Chờ xử lý"}
        </span>
      ),
    },
    {
      header: "Cập nhật",
      key: "actions",
      render: (row) => (
        <Select
          value={row.status || "OPEN"}
          onChange={(event) =>
            dispatch(
              updateViolationStatusRequest({
                ...row,
                id: row.id,
                status: event.target.value,
              })
            )
          }
          options={[
            { value: "OPEN", label: "Chờ xử lý" },
            { value: "RESOLVED", label: "Đã xử lý" },
            { value: "COLLECTED", label: "Đã thu tiền" },
            { value: "CANCELLED", label: "Đã hủy" },
          ]}
          placeholder={null}
          disabled={violations.updatingId === row.id}
        />
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><AlertTriangle size={16} /> Vi phạm</div>
          <h1 className="page-title">Ghi nhận lỗi đỗ xe và phí cần thu</h1>
          <p className="page-subtitle">
            Phí vi phạm được cộng vào hóa đơn khi xe ra bãi. Xe có gói tháng vẫn phải thanh toán phần vi phạm.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Chưa thu</span>
          <span className="page-hero-number">{Math.round(unpaidAmount / 1000)}K</span>
          <span className="page-hero-label">đồng</span>
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
              <h2 className="section-title"><Save size={19} /> Ghi vi phạm mới</h2>
              <p className="section-copy">Chọn lượt gửi đang trong bãi, nội dung vi phạm và phí cần thu.</p>
            </div>
          </div>

          <form onSubmit={submitViolation} style={{ display: "grid", gap: 14 }}>
            <FormField label="Lượt gửi" required>
              <Select
                value={effectiveParkingSessionId}
                onChange={(event) => updateForm("parkingSessionId", event.target.value)}
                options={parkingSessions.active.map((session) => ({
                  value: session.id,
                  label: `${session.plateNumber} - ${getVehicleTypeLabel(session.vehicleType)}`,
                }))}
                placeholder="Chọn xe đang gửi"
              />
            </FormField>

            <FormField label="Nội dung vi phạm">
              <Select
                value={form.violationType}
                onChange={(event) => updateForm("violationType", event.target.value)}
                options={violationTypes}
                placeholder={null}
              />
            </FormField>

            <FormField label="Số tiền cần thu">
              <Input type="number" min="0" value={form.penaltyFee} onChange={(event) => updateForm("penaltyFee", event.target.value)} />
            </FormField>

            <FormField label="Ghi chú">
              <textarea
                className="form-input"
                rows="3"
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                placeholder="Mô tả ngắn để ca sau dễ kiểm tra"
              />
            </FormField>

            <Button type="submit" icon={CheckCircle2} loading={violations.saving} disabled={!effectiveParkingSessionId}>
              Ghi nhận
            </Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><AlertTriangle size={19} /> Xe đang chọn</h2>
              <p className="section-copy">Thông tin giúp nhân viên đối chiếu trước khi ghi lỗi.</p>
            </div>
          </div>
          {selectedSession ? (
            <div className="data-list">
              <div className="data-row"><span>Biển số</span><strong>{selectedSession.plateNumber}</strong></div>
              <div className="data-row"><span>Loại xe</span><strong>{getVehicleTypeLabel(selectedSession.vehicleType)}</strong></div>
              <div className="data-row"><span>Vị trí</span><strong>{selectedSession.slotCode || "Khu xe máy"}</strong></div>
              <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(selectedSession.checkInAt)}</strong></div>
            </div>
          ) : (
            <p className="section-copy">Chưa chọn lượt gửi.</p>
          )}
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Danh sách vi phạm</h2>
            <p className="section-copy">Các khoản chưa thu sẽ được cộng vào hóa đơn khi xe ra bãi.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={violations.loading || parkingSessions.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>
        <Table columns={columns} data={violations.items} loading={violations.loading} />
      </section>
    </div>
  );
};

export default StaffViolationsPage;
