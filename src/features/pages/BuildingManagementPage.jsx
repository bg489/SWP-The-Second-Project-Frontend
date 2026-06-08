import React, { useState } from "react";
import { mockBuildingInfo } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import { Building2, Save, X, Edit, CheckCircle } from "lucide-react";

const BuildingManagementPage = () => {
  const [building, setBuilding] = useState(mockBuildingInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(building.name);
  const [address, setAddress] = useState(building.address);
  const [hours, setHours] = useState(building.hours);
  const [desc, setDesc] = useState(building.desc);
  const [status, setStatus] = useState(building.status);
  const [formError, setFormError] = useState({});
  const [successToast, setSuccessToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim()) errors.name = "Tên tòa nhà không được trống";
    if (!address.trim()) errors.address = "Địa chỉ không được trống";
    if (!hours.trim()) errors.hours = "Giờ hoạt động không được trống";

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    setBuilding({
      name,
      address,
      hours,
      desc,
      status
    });

    setIsEditing(false);
    setFormError({});
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleCancel = () => {
    setName(building.name);
    setAddress(building.address);
    setHours(building.hours);
    setDesc(building.desc);
    setStatus(building.status);
    setIsEditing(false);
    setFormError({});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* Toast Alert */}
      {successToast && (
        <div style={{
          position: "fixed",
          top: "90px",
          right: "30px",
          zIndex: 100,
          backgroundColor: "var(--success)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "700"
        }} className="animate-slide-in">
          <CheckCircle size={20} /> Cập nhật thành công!
        </div>
      )}

      {/* Page Header */}
      <div className="card" style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Thông tin Tòa nhà & Cơ sở hạ tầng</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Xem và cập nhật các cấu hình thông tin cốt lõi của tòa nhà đang kết nối với hệ thống bãi đỗ xe thông minh.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Detail Panel */}
        <div className="card" style={{ padding: "28px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={22} style={{ color: "var(--primary)" }} /> {building.name}
            </h3>
            
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon={Edit}>
                Chỉnh sửa
              </Button>
            )}
          </div>

          {!isEditing ? (
            // Read-Only view
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Tên cơ sở:</span>
                <span style={{ fontWeight: "700" }}>{building.name}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Địa chỉ tòa nhà:</span>
                <span>{building.address}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Giờ mở cửa:</span>
                <span>{building.hours}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Trạng thái:</span>
                <span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: building.status === "Đang hoạt động" ? "var(--success-light)" : "var(--danger-light)",
                    color: building.status === "Đang hoạt động" ? "var(--success)" : "var(--danger)"
                  }}>{building.status}</span>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Mô tả hạ tầng:</span>
                <span style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{building.desc}</span>
              </div>
            </div>
          ) : (
            // Edit Form view
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <FormField label="Tên cơ sở hạ tầng" error={formError.name} required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FormField>
                
                <FormField label="Giờ hoạt động" error={formError.hours} required>
                  <Input value={hours} onChange={(e) => setHours(e.target.value)} />
                </FormField>
              </div>

              <FormField label="Địa chỉ đầy đủ" error={formError.address} required>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <FormField label="Trạng thái hoạt động">
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "Đang hoạt động", label: "Đang hoạt động" },
                      { value: "Tạm dừng hoạt động", label: "Tạm dừng hoạt động" }
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Ghi chú mô tả">
                <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
              </FormField>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <Button type="submit" variant="primary" icon={Save}>
                  Lưu thay đổi
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} icon={X}>
                  Hủy
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default BuildingManagementPage;
