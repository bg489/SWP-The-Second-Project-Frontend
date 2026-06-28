import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Save, RefreshCcw, Layers } from "lucide-react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { formatCurrency, formatDateTime } from "../../services/mockParkingData";

const StaffViolationsPage = () => {
  const dispatch = useDispatch();

  // Đọc trạng thái từ Redux Core
  const { violationTypes, parkingSessions, violations } = useSelector((state) => state.parking);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [violationTypeId, setViolationTypeId] = useState("");
  const [customName, setCustomName] = useState("");
  const [penaltyFee, setPenaltyFee] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    dispatch({ type: "parking/fetchViolationTypesRequest" });
    dispatch({ type: "parking/fetchActiveParkingSessionsRequest" });
    dispatch({ type: "parking/fetchViolationsRequest" });
  }, [dispatch]);

  // Đổi cấu trúc mảng danh sách xe đang trong bãi để nạp vào Select dropdown
  const sessionOptions = useMemo(() => {
    const activeList = parkingSessions.active || [];
    return activeList.map(s => ({
      value: s.id,
      label: `${s.plateNumber} (${s.vehicleType === "CAR" ? "Ô tô" : "Xe máy"} - ${s.slotCode || "Khu máy"})`
    }));
  }, [parkingSessions.active]);

  // Đổi cấu trúc mảng danh mục lỗi vi phạm hệ thống
  const typeOptions = useMemo(() => {
    // ⚠️ Thêm dấu ?. sau biến violationTypes để phòng ngừa dữ liệu chưa kịp nạp
    const items = violationTypes?.items || [];
    return items.map(t => ({ value: t.id, label: t.name }));
  }, [violationTypes?.items]);

  // Luồng tự động điền giá tiền cước phạt mặc định khi Staff chọn lỗi có sẵn
  useEffect(() => {
    if (!isCustom && violationTypeId) {
      const selectedType = violationTypes.items.find(t => String(t.id) === String(violationTypeId));
      if (selectedType) {
        setPenaltyFee(selectedType.defaultPenaltyFee || selectedType.penaltyFee || "");
      }
    }
  }, [violationTypeId, isCustom, violationTypes.items]);

  // Xử lý chuyển đổi qua lại giữa chọn danh mục và tự nhập tay tùy chỉnh
  const handleModeChange = (e) => {
    const customChecked = e.target.checked;
    setIsCustom(customChecked);
    setViolationTypeId("");
    setCustomName("");
    setPenaltyFee("");
  };

  const handleRecordViolation = (e) => {
    e.preventDefault();
    if (!selectedSessionId || !penaltyFee) return;

    let finalTypeName = "";
    if (isCustom) {
      if (!customName.trim()) return;
      finalTypeName = customName.trim();
    } else {
      const selectedType = violationTypes.items.find(t => String(t.id) === String(violationTypeId));
      finalTypeName = selectedType ? selectedType.name : "Vi phạm quy định bãi";
    }

    dispatch({
      type: "parking/createViolationRequest",
      payload: {
        parkingSessionId: Number(selectedSessionId),
        violationTypeId: isCustom ? null : Number(violationTypeId),
        violationType: finalTypeName,
        penaltyFee: Number(penaltyFee),
        note: note.trim()
      }
    });

    // Đưa form về trạng thái trống sau khi lập xong biên bản
    setViolationTypeId("");
    setCustomName("");
    setPenaltyFee("");
    setNote("");
  };

  const columns = [
    { header: "Biển số xe", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    { header: "Nội dung lỗi vi phạm", key: "violationType", render: (row) => row.violationType || row.violationTypeName },
    { header: "Tiền phạt", key: "penaltyFee", render: (row) => <span className="text-danger">{formatCurrency(row.penaltyFee || row.fine || 0)}</span> },
    { header: "Thời gian lập", key: "detectedAt", render: (row) => formatDateTime(row.detectedAt || row.createdAt) },
    { header: "Trạng thái thu", key: "status", render: (row) => row.status === "COLLECTED" ? <span className="pill success">Đã thu</span> : <span className="pill danger">Chưa thu</span> }
  ];

  return (
    <div className="parking-page animate-fade-in">
      <div className="dashboard-grid">
        <section className="card section-card" style={{ gridColumn: "span 2" }}>
          <div className="section-header">
            <h2 className="section-title"><AlertTriangle size={19} color="var(--orange)" /> Ghi nhận vi phạm thời gian thực</h2>
          </div>
          <form onSubmit={handleRecordViolation} className="login-form">
            <FormField label="Chọn phương tiện vi phạm đang ở trong bãi" required>
              <Select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                options={sessionOptions}
                placeholder="-- Chọn xe vi phạm --"
              />
            </FormField>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 12px" }}>
              <input
                type="checkbox"
                id="customMode"
                checked={isCustom}
                onChange={handleModeChange}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="customMode" style={{ fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                ⚠️ Bật chế độ tự nhập lỗi ngoài danh mục (Tùy chỉnh)
              </label>
            </div>

            {isCustom ? (
              <FormField label="Nhập tên lỗi vi phạm tùy chỉnh" required>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ví dụ: Làm hỏng rào chắn ranh giới, đỗ xe chắn lối thoát hiểm công cộng..."
                />
              </FormField>
            ) : (
              <FormField label="Chọn lỗi vi phạm có sẵn hệ thống" required>
                <Select
                  value={violationTypeId}
                  onChange={(e) => setViolationTypeId(e.target.value)}
                  options={typeOptions}
                  placeholder="-- Lựa chọn lỗi từ database --"
                />
              </FormField>
            )}

            <FormField label="Mức tiền phạt (VND)" required>
              <Input
                type="number"
                value={penaltyFee}
                onChange={(e) => setPenaltyFee(e.target.value)}
                placeholder="Số tiền phạt tự động điền hoặc nhập tay..."
              />
            </FormField>

            <FormField label="Ghi chú chi tiết biên bản">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả hiện trạng vị trí, tình huống bãi lúc xảy ra..." />
            </FormField>

            <Button type="submit" variant="primary" icon={Save}>Ghi biên bản lỗi</Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <h2 className="section-title"><Layers size={19} /> Hướng dẫn nghiệp vụ</h2>
          </div>
          <div className="soft-panel">
            <p className="section-copy" style={{ lineHeight: "1.6" }}>
              • Lỗi có sẵn từ database sẽ tự động nạp mức tiền phạt cơ sở do Quản lý (Manager) cấu hình từ trước.<br /><br />
              • Khi phát sinh tình huống thực tế đặc thù, tích chọn ô <strong>Tùy chỉnh</strong> để tự viết mô tả lỗi và tự định biên mức thu phạt không có trong danh mục.<br /><br />
              • Tiền phạt ở trạng thái chưa thanh toán sẽ được hệ thống gom và tính cộng dồn tự động vào hóa đơn tổng khi xe ra bãi.
            </p>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Nhật ký biên bản vi phạm bãi xe</h2>
            <p className="section-copy">Danh sách tất cả các ca vi phạm được ghi nhận trong bãi giữ xe.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} onClick={() => dispatch({ type: "parking/fetchViolationsRequest" })} />
        </div>
        <Table columns={columns} data={violations.items} loading={violations.loading} />
      </section>
    </div>
  );
};

export default StaffViolationsPage;