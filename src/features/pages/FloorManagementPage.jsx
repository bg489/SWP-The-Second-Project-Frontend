import { useState } from "react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { floors as mockFloors, getStatusLabel, getStatusTone } from "../../services/mockParkingData";
import { Edit, Layers, Plus, Save, Trash2, X } from "lucide-react";

const FloorManagementPage = () => {
  const [floors, setFloors] = useState(mockFloors);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    floorType: "MOTORBIKE",
    capacity: 100,
    slotsCount: 0,
    status: "ACTIVE",
    note: "",
  });

  const resetDraft = () => {
    setEditingId(null);
    setDraft({ name: "", floorType: "MOTORBIKE", capacity: 100, slotsCount: 0, status: "ACTIVE", note: "" });
  };

  const handleEdit = (floor) => {
    setEditingId(floor.id);
    setDraft(floor);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const normalized = {
      ...draft,
      capacity: draft.floorType === "MOTORBIKE" ? Number(draft.capacity) : 0,
      slotsCount: draft.floorType === "CAR" ? Number(draft.slotsCount) : 0,
      currentCount: draft.currentCount || 0,
    };

    if (editingId) {
      setFloors((rows) => rows.map((floor) => (floor.id === editingId ? normalized : floor)));
    } else {
      setFloors((rows) => [
        ...rows,
        {
          ...normalized,
          id: Date.now(),
          code: normalized.floorType === "CAR" ? "NEW-CAR" : "NEW-MB",
          buildingId: 1,
        },
      ]);
    }
    resetDraft();
  };

  const columns = [
    { header: "Mã tầng", key: "code" },
    { header: "Tên tầng", key: "name" },
    { header: "Loại", key: "floorType", render: (row) => (row.floorType === "CAR" ? "Ô tô theo slot" : "Xe máy theo capacity") },
    { header: "Sức chứa", key: "capacity", render: (row) => (row.floorType === "CAR" ? `${row.slotsCount} slot` : `${row.currentCount}/${row.capacity}`) },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Hành động",
      key: "actions",
      render: (row) => (
        <div className="action-row">
          <Button size="sm" variant="outline" icon={Edit} onClick={() => handleEdit(row)} />
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => setFloors((items) => items.filter((item) => item.id !== row.id))} />
        </div>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Layers size={16} /> Tầng & slot</div>
          <h1 className="page-title">Cấu hình tầng xe máy và tầng ô tô</h1>
          <p className="page-subtitle">Parking Manager khai báo loại tầng. Xe máy dùng capacity, ô tô dùng số slot cụ thể.</p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng tầng</span>
          <span className="page-hero-number">{floors.length}</span>
          <span className="page-hero-label">đang mock</span>
        </div>
      </section>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Plus size={19} /> {editingId ? "Sửa tầng" : "Thêm tầng mới"}</h2>
              <p className="section-copy">Mock form tương ứng POST/PATCH `/api/floors`.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <FormField label="Tên tầng" required>
              <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="VD: Tầng B4 - Ô tô" />
            </FormField>
            <FormField label="Loại tầng">
              <Select
                value={draft.floorType}
                onChange={(event) => setDraft({ ...draft, floorType: event.target.value })}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy - quản lý capacity" },
                  { value: "CAR", label: "Ô tô - quản lý slot" },
                ]}
                placeholder={null}
              />
            </FormField>
            {draft.floorType === "MOTORBIKE" ? (
              <FormField label="Sức chứa xe máy">
                <Input type="number" value={draft.capacity} onChange={(event) => setDraft({ ...draft, capacity: event.target.value })} />
              </FormField>
            ) : (
              <FormField label="Số slot ô tô">
                <Input type="number" value={draft.slotsCount} onChange={(event) => setDraft({ ...draft, slotsCount: event.target.value })} />
              </FormField>
            )}
            <FormField label="Trạng thái">
              <Select
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                options={[
                  { value: "ACTIVE", label: "Đang hoạt động" },
                  { value: "MAINTENANCE", label: "Bảo trì" },
                  { value: "LOCKED", label: "Tạm khóa" },
                  { value: "INACTIVE", label: "Ngưng nhận xe" },
                ]}
                placeholder={null}
              />
            </FormField>
            <div className="action-row">
              <Button type="submit" variant="primary" icon={Save}>{editingId ? "Lưu thay đổi" : "Thêm tầng"}</Button>
              {editingId && <Button type="button" variant="outline" icon={X} onClick={resetDraft}>Hủy sửa</Button>}
            </div>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Layers size={19} /> Nguyên tắc cấu hình</h2>
              <p className="section-copy">Bám file nghiệp vụ MVP.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel"><strong>Xe máy</strong><p className="section-copy">Nhập tổng capacity, không tạo hàng trăm slot chi tiết.</p></div>
            <div className="soft-panel"><strong>Ô tô</strong><p className="section-copy">Tạo danh sách slot như C-01 đến C-50, có trạng thái vận hành.</p></div>
            <div className="soft-panel"><strong>Bãi đầy</strong><p className="section-copy">Capacity/slot khả dụng bằng 0 thì không tạo phiên mới.</p></div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <Table columns={columns} data={floors} />
      </section>
    </div>
  );
};

export default FloorManagementPage;
