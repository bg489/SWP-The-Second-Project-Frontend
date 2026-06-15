import { useState } from "react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import { buildingInfo, floors, getStatusLabel, getStatusTone } from "../../services/mockParkingData";
import { Building2, CheckCircle, Edit, MapPin, Save, X } from "lucide-react";

const BuildingManagementPage = () => {
  const [building, setBuilding] = useState(buildingInfo);
  const [draft, setDraft] = useState(buildingInfo);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    setBuilding(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const totalFloors = floors.length;
  const motorbikeFloors = floors.filter((floor) => floor.floorType === "MOTORBIKE").length;
  const carFloors = floors.filter((floor) => floor.floorType === "CAR").length;

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Building2 size={16} /> Một tòa nhà MVP</div>
          <h1 className="page-title">{building.name}</h1>
          <p className="page-subtitle">{building.description}</p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tầng vận hành</span>
          <span className="page-hero-number">{totalFloors}</span>
          <span className="page-hero-label">{motorbikeFloors} xe máy, {carFloors} ô tô</span>
        </div>
      </section>

      {saved && (
        <div className="card soft-panel">
          <span className="pill success"><CheckCircle size={14} /> Đã lưu mock</span>
        </div>
      )}

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><MapPin size={19} /> Thông tin tòa nhà</h2>
              <p className="section-copy">Backend hiện có `/api/buildings`, UI đang mock cho một tòa.</p>
            </div>
            {!editing && <Button variant="outline" icon={Edit} onClick={() => setEditing(true)}>Chỉnh sửa</Button>}
          </div>

          {!editing ? (
            <div className="data-list">
              <div className="data-row"><span>Tên tòa</span><strong>{building.name}</strong></div>
              <div className="data-row"><span>Địa chỉ</span><strong>{building.address}</strong></div>
              <div className="data-row"><span>Giờ hoạt động</span><strong>{building.hours}</strong></div>
              <div className="data-row"><span>Hotline</span><strong>{building.hotline}</strong></div>
              <div className="data-row"><span>Quản lý</span><strong>{building.manager}</strong></div>
              <div className="data-row"><span>Trạng thái</span><strong>{getStatusLabel(building.status)}</strong></div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
              <FormField label="Tên tòa nhà" required>
                <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </FormField>
              <FormField label="Địa chỉ" required>
                <Input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
              </FormField>
              <FormField label="Giờ hoạt động">
                <Input value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} />
              </FormField>
              <FormField label="Hotline">
                <Input value={draft.hotline} onChange={(event) => setDraft({ ...draft, hotline: event.target.value })} />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                  options={[
                    { value: "ACTIVE", label: "Đang hoạt động" },
                    { value: "MAINTENANCE", label: "Bảo trì" },
                    { value: "LOCKED", label: "Tạm khóa" },
                  ]}
                  placeholder={null}
                />
              </FormField>
              <div className="action-row">
                <Button type="submit" variant="primary" icon={Save}>Lưu</Button>
                <Button type="button" variant="outline" icon={X} onClick={() => { setDraft(building); setEditing(false); }}>Hủy</Button>
              </div>
            </form>
          )}
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Building2 size={19} /> Quy tắc phạm vi</h2>
              <p className="section-copy">Các giới hạn đã chốt trong file nghiệp vụ.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel"><strong>Không quản lý nhiều chi nhánh</strong><p className="section-copy">MVP chỉ có một tòa nhà.</p></div>
            <div className="soft-panel"><strong>Xe máy không có slot</strong><p className="section-copy">Chỉ quản lý bằng sức chứa mỗi tầng.</p></div>
            <div className="soft-panel"><strong>Ô tô phải gán slot</strong><p className="section-copy">Slot có trạng thái trống, đặt trước, đang dùng, bảo trì, xung đột.</p></div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Tầng thuộc tòa nhà</h2>
            <p className="section-copy">Tổng quan nhanh trước khi chỉnh chi tiết ở màn Tầng & slot.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {floors.map((floor) => (
            <div className="soft-panel" key={floor.id}>
              <strong>{floor.name}</strong>
              <p className="section-copy">{floor.floorType === "CAR" ? `${floor.slotsCount} slot ô tô` : `${floor.currentCount}/${floor.capacity} xe máy`}</p>
              <span className={`pill ${getStatusTone(floor.status)}`}>{getStatusLabel(floor.status)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BuildingManagementPage;
