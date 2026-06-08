import React, { useState } from "react";
import { createPortal } from "react-dom";
import { mockManagerFloors } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import { Plus, Pencil, Trash2, Check, X, Layers } from "lucide-react";

const FloorManagementPage = () => {
  const [floors, setFloors] = useState(mockManagerFloors);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFloorId, setCurrentFloorId] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("Xe máy");
  const [capacity, setCapacity] = useState("");
  const [slotsCount, setSlotsCount] = useState("");
  const [status, setStatus] = useState("Đang hoạt động");
  const [formError, setFormError] = useState({});

  const handleEditClick = (floor) => {
    setIsEditing(true);
    setCurrentFloorId(floor.id);
    setName(floor.name);
    setType(floor.type);
    setCapacity(floor.capacity.toString());
    setSlotsCount(floor.slotsCount.toString());
    setStatus(floor.status);
    setFormError({});
    setShowForm(true);
  };

  const handleDeleteClick = (floorId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tầng này?")) {
      setFloors(floors.filter(f => f.id !== floorId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim()) errors.name = "Tên tầng không được trống";
    
    if (type === "Xe máy") {
      if (!capacity || parseInt(capacity) <= 0) errors.capacity = "Sức chứa xe máy phải lớn hơn 0";
    } else {
      if (!slotsCount || parseInt(slotsCount) <= 0) errors.slotsCount = "Số slot ô tô phải lớn hơn 0";
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    if (isEditing) {
      setFloors(floors.map(f => f.id === currentFloorId ? {
        ...f,
        name,
        type,
        capacity: type === "Xe máy" ? parseInt(capacity) : 0,
        slotsCount: type === "Ô tô" ? parseInt(slotsCount) : 0,
        status
      } : f));
      setIsEditing(false);
      setCurrentFloorId(null);
    } else {
      const newFloor = {
        id: `FL-B${floors.length + 1}`,
        name,
        type,
        capacity: type === "Xe máy" ? parseInt(capacity) : 0,
        slotsCount: type === "Ô tô" ? parseInt(slotsCount) : 0,
        status
      };
      setFloors([...floors, newFloor]);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setName("");
    setType("Xe máy");
    setCapacity("");
    setSlotsCount("");
    setStatus("Đang hoạt động");
    setFormError({});
    setShowForm(false);
    setIsEditing(false);
  };

  const columns = [
    { header: "Mã Tầng", key: "id", width: "100px" },
    { header: "Tên Tầng", key: "name" },
    { header: "Loại Phương tiện", key: "type" },
    {
      header: "Sức chứa / Số ô đỗ",
      key: "capacity",
      render: (row) => {
        return row.type === "Xe máy"
          ? `${row.capacity} xe máy (Sức chứa)`
          : `${row.slotsCount} ô đỗ (Slot ô tô)`;
      }
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        let badgeColor = "var(--success)";
        if (row.status === "Bảo trì") badgeColor = "var(--warning)";
        if (row.status === "Tạm đóng") badgeColor = "var(--danger)";

        return (
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: `${badgeColor}15`,
            color: badgeColor,
            border: `1px solid ${badgeColor}30`
          }}>{row.status}</span>
        );
      }
    },
    {
      header: "Hành động",
      key: "actions",
      width: "140px",
      render: (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button variant="outline" size="sm" onClick={() => handleEditClick(row)} icon={Pencil} />
          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(row.id)} icon={Trash2} />
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Quản lý Danh sách Tầng Hầm</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Quản trị và thiết lập các tầng đỗ xe của tòa nhà. Hỗ trợ cấu hình sức chứa cho xe máy và quy hoạch ô đỗ cụ thể cho xe ô tô.
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
            Thêm tầng mới
          </Button>
        )}
      </div>

      {/* Editor Form Modal Popup */}
      {showForm && createPortal(
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={handleCancel}>
          <div className="card animate-fade-in" style={{
            maxWidth: "600px",
            width: "100%",
            padding: "28px",
            borderRadius: "8px", // Clean, rounded corners 8px radius
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)", // Soft drop shadow
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={20} style={{ color: "var(--primary)" }} /> {isEditing ? `Sửa tầng hầm ${name}` : "Thêm tầng hầm đỗ xe mới"}
              </h3>
              <button onClick={handleCancel} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                <FormField label="Tên tầng hầm (ví dụ: Tầng B4)" error={formError.name} required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên tầng..." />
                </FormField>

                <FormField label="Loại phương tiện">
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={[
                      { value: "Xe máy", label: "Xe máy (Phân luồng sức chứa)" },
                      { value: "Ô tô", label: "Ô tô (Phân luồng ô đỗ cụ thể)" }
                    ]}
                    placeholder={null}
                  />
                </FormField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                {/* Conditional Input Rendering based on Floor Type */}
                {type === "Xe máy" ? (
                  <FormField label="Sức chứa xe máy tối đa (Capacity)" error={formError.capacity} required>
                    <Input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Sức chứa xe máy..."
                    />
                  </FormField>
                ) : (
                  <FormField label="Số lượng ô đỗ ô tô (Slots Count)" error={formError.slotsCount} required>
                    <Input
                      type="number"
                      value={slotsCount}
                      onChange={(e) => setSlotsCount(e.target.value)}
                      placeholder="Số lượng slot ô tô..."
                    />
                  </FormField>
                )}

                <FormField label="Trạng thái hoạt động">
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "Đang hoạt động", label: "Đang hoạt động" },
                      { value: "Bảo trì", label: "Đang bảo trì" },
                      { value: "Tạm đóng", label: "Tạm đóng cửa" }
                    ]}
                    placeholder={null}
                  />
                </FormField>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid #d1d5db", // Light grey border
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  icon={X}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    e.currentTarget.style.borderColor = "#9ca3af";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    backgroundColor: "#2563eb", // Solid distinct blue
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
                  }}
                  icon={Check}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(37, 99, 235, 0.2)";
                  }}
                >
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Floors Table */}
      <div className="card" style={{ padding: "24px" }}>
        <Table columns={columns} data={floors} />
      </div>
    </div>
  );
};

export default FloorManagementPage;
