import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CheckCircle,
  Edit2,
  Layers,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import {
  clearFloorNotice,
  createFloorRequest,
  deleteFloorRequest,
  fetchFloorsRequest,
  updateFloorRequest,
} from "../backend/floors/floorSlice";
import CarSlotManagementPanel from "../backend/pages/CarSlotManagementPanel";

const floorTypeLabels = {
  MOTORBIKE: "Tầng xe máy",
  CAR: "Tầng ô tô",
};

const statusLabels = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  MAINTENANCE: "Bảo trì",
  INACTIVE: "Ngưng hoạt động",
};

const emptyForm = {
  buildingId: "",
  name: "",
  floorType: "MOTORBIKE",
  capacity: "",
  slotCount: "",
  slotsText: "",
  status: "ACTIVE",
  operationNote: "",
};

const FloorManagementPage = () => {
  const dispatch = useDispatch();

  const formSectionRef = useRef(null);
  const PAGE_SIZE = 5;

  const [floorPage, setFloorPage] = useState(1);

  const { buildings, loading: buildingsLoading } = useSelector(
    (state) => state.buildings
  );

  const {
    floors,
    loading,
    error,
    creating,
    updatingId,
    deletingId,
    mutationError,
    mutationSuccess,
  } = useSelector((state) => state.floors);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedCarFloorId, setSelectedCarFloorId] = useState(null);

  const isEditing = Boolean(editingId);

  const selectedCarFloor = useMemo(() => {
    return floors.find((floor) => Number(floor.id) === Number(selectedCarFloorId));
  }, [floors, selectedCarFloorId]);

  const [filters, setFilters] = useState({
    searchText: "",
    searchColumn: "all",
    buildingId: "",
    floorType: "",
    status: "",
  });

  const motorbikeCount = useMemo(
    () => floors.filter((floor) => floor.floorType === "MOTORBIKE").length,
    [floors]
  );

  const carCount = useMemo(
    () => floors.filter((floor) => floor.floorType === "CAR").length,
    [floors]
  );

  const normalizeText = (value) => {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const getFloorSearchValue = (floor, column) => {
    const floorType = floor.floorType || floor.floor_type;
    const capacityOrSlot =
      floorType === "MOTORBIKE"
        ? `${floor.capacity || 0} xe máy`
        : `${floor.slotCount || floor.slot_count || 0} ô đỗ ô tô`;

    const values = {
      id: floor.id,
      name: floor.name,
      buildingName: floor.buildingName || floor.building_name,
      floorType: floorTypeLabels[floorType] || floorType,
      capacityOrSlot,
      status: statusLabels[floor.status] || floor.status,
      note: floor.operationNote || floor.operation_note || floor.note,
    };

    if (column === "all") {
      return Object.values(values).join(" ");
    }

    return values[column] ?? "";
  };

  const filteredFloors = useMemo(() => {
    const search = normalizeText(filters.searchText);

    return floors.filter((floor) => {
      const floorType = floor.floorType || floor.floor_type;
      const buildingId = floor.buildingId || floor.building_id;

      const matchSearch =
        !search ||
        normalizeText(getFloorSearchValue(floor, filters.searchColumn)).includes(
          search
        );

      const matchBuilding =
        !filters.buildingId ||
        Number(buildingId) === Number(filters.buildingId);

      const matchType = !filters.floorType || floorType === filters.floorType;

      const matchStatus = !filters.status || floor.status === filters.status;

      return matchSearch && matchBuilding && matchType && matchStatus;
    });
  }, [floors, filters]);

  const totalFloorPages = Math.max(
    1,
    Math.ceil(filteredFloors.length / PAGE_SIZE)
  );
  const currentFloorPage = Math.min(floorPage, totalFloorPages);

  const paginatedFloors = useMemo(() => {
    const startIndex = (currentFloorPage - 1) * PAGE_SIZE;
    return filteredFloors.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentFloorPage, filteredFloors]);

  const scrollToForm = () => {
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  useEffect(() => {
    dispatch(fetchBuildingsRequest());
    dispatch(fetchFloorsRequest());
  }, [dispatch]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    dispatch(clearFloorNotice());
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFloorPage(1);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.buildingId) {
      nextErrors.buildingId = "Vui lòng chọn tòa nhà.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên tầng.";
    }

    if (form.floorType === "MOTORBIKE") {
      if (!form.capacity || Number(form.capacity) <= 0) {
        nextErrors.capacity = "Tầng xe máy cần sức chứa lớn hơn 0.";
      }
    }

    if (form.floorType === "CAR" && !isEditing) {
      if (!form.slotCount || Number(form.slotCount) <= 0) {
        nextErrors.slotCount = "Tầng ô tô cần số lượng ô lớn hơn 0.";
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      buildingId: Number(form.buildingId),
      name: form.name.trim(),
      status: form.status,
      operationNote: form.operationNote.trim() || undefined,
    };

    if (!isEditing) {
      payload.floorType = form.floorType;
    }

    if (form.floorType === "MOTORBIKE") {
      payload.floorType = "MOTORBIKE";
      payload.capacity = Number(form.capacity);
    }

    if (form.floorType === "CAR" && !isEditing) {
      payload.floorType = "CAR";
      payload.slotCount = Number(form.slotCount);

      const slots = form.slotsText
        .split("\n")
        .map((slot) => slot.trim())
        .filter(Boolean);

      if (slots.length > 0) {
        payload.slots = slots;
      }
    }

    return payload;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setSelectedCarFloorId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = buildPayload();

    if (editingId) {
      dispatch(
        updateFloorRequest({
          id: editingId,
          ...payload,
        })
      );
    } else {
      dispatch(createFloorRequest(payload));
    }

    resetForm();
  };

  const startEdit = (floor) => {
    dispatch(clearFloorNotice());

    setEditingId(floor.id);

    setForm({
      buildingId: String(floor.buildingId || floor.building_id || ""),
      name: floor.name || "",
      floorType: floor.floorType || floor.floor_type || "MOTORBIKE",
      capacity: floor.capacity ? String(floor.capacity) : "",
      slotCount: floor.slotCount ? String(floor.slotCount) : "",
      slotsText: "",
      status: floor.status || "ACTIVE",
      operationNote: floor.operationNote || floor.operation_note || "",
    });

    const floorType = floor.floorType || floor.floor_type;

    if (floorType === "CAR") {
      setSelectedCarFloorId(floor.id);
    } else {
      setSelectedCarFloorId(null);
    }

    scrollToForm();
  };

  const handleDelete = (floor) => {
    const ok = window.confirm(`Bạn chắc muốn xóa tầng "${floor.name}" không?`);

    if (!ok) return;

    dispatch(deleteFloorRequest({ id: floor.id }));
  };

  const handleRefresh = () => {
    dispatch(clearFloorNotice());
    dispatch(fetchFloorsRequest());
  };

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <Layers size={16} /> Tầng gửi xe
          </div>

          <h1 className="page-title">Quản lý tầng xe máy & ô tô</h1>

          <p className="page-subtitle">
            Quản lý có thể thêm, sửa, xóa tầng xe máy và tầng ô tô theo từng tòa
            nhà.
          </p>
        </div>

        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng tầng</span>
          <span className="page-hero-number">{floors.length}</span>
          <span className="page-hero-label">
            Xe máy: {motorbikeCount} • Ô tô: {carCount}
          </span>
        </div>
      </section>

      {(mutationSuccess || mutationError || error) && (
        <section className="card soft-panel">
          {mutationSuccess && (
            <span className="pill success">
              <CheckCircle size={14} /> {mutationSuccess}
            </span>
          )}

          {mutationError && (
            <p style={{ color: "var(--danger)" }}>{mutationError}</p>
          )}

          {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        </section>
      )}

      <section ref={formSectionRef} className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {editingId ? <Edit2 size={19} /> : <Plus size={19} />}
              {editingId ? "Sửa tầng" : "Tạo tầng mới"}
            </h2>

            <p className="section-copy">
              Tầng xe máy dùng sức chứa. Tầng ô tô dùng từng ô đỗ cụ thể.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <FormField label="Tòa nhà" required error={formErrors.buildingId}>
            <select
              className="form-input"
              value={form.buildingId}
              onChange={(event) => updateField("buildingId", event.target.value)}
              disabled={creating || Boolean(updatingId) || buildingsLoading}
            >
              <option value="">
                {buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
              </option>

              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tên tầng" required error={formErrors.name}>
            <Input
              placeholder="Ví dụ: B1 - Tầng xe máy"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            />
          </FormField>

          <FormField label="Loại tầng">
            <select
              className="form-input"
              value={form.floorType}
              onChange={(event) => updateField("floorType", event.target.value)}
              disabled={creating || Boolean(updatingId) || isEditing}
            >
              <option value="MOTORBIKE">Tầng xe máy</option>
              <option value="CAR">Tầng ô tô</option>
            </select>
          </FormField>

          {form.floorType === "MOTORBIKE" && (
            <FormField label="Sức chứa xe máy" required error={formErrors.capacity}>
              <Input
                type="number"
                min="1"
                placeholder="Ví dụ: 500"
                value={form.capacity}
                onChange={(event) => updateField("capacity", event.target.value)}
                disabled={creating || Boolean(updatingId)}
              />
            </FormField>
          )}

          {form.floorType === "CAR" && !isEditing && (
            <>
              <FormField label="Số lượng ô tô" required error={formErrors.slotCount}>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ví dụ: 20"
                  value={form.slotCount}
                  onChange={(event) =>
                    updateField("slotCount", event.target.value)
                  }
                  disabled={creating || Boolean(updatingId)}
                />
              </FormField>

              <FormField label="Mã ô đỗ ô tô">
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder={`Mỗi dòng là 1 mã ô đỗ, ví dụ:\nCAR-A01\nCAR-A02\nCAR-A03`}
                  value={form.slotsText}
                  onChange={(event) =>
                    updateField("slotsText", event.target.value)
                  }
                  disabled={creating || Boolean(updatingId)}
                />
              </FormField>
            </>
          )}

          <FormField label="Trạng thái">
            <select
              className="form-input"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </FormField>

          <FormField label="Ghi chú vận hành">
            <textarea
              className="form-input"
              rows="3"
              placeholder="Ví dụ: Tầng dành cho cư dân block A"
              value={form.operationNote}
              onChange={(event) =>
                updateField("operationNote", event.target.value)
              }
              disabled={creating || Boolean(updatingId)}
            />
          </FormField>

          <div className="action-row">
            <Button
              type="submit"
              icon={editingId ? Edit2 : Plus}
              loading={creating || Boolean(updatingId)}
              disabled={creating || Boolean(updatingId)}
            >
              {editingId ? "Lưu thay đổi" : "Tạo tầng"}
            </Button>

            {editingId && (
              <Button type="button" variant="outline" icon={X} onClick={resetForm}>
                Hủy sửa
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              icon={RefreshCcw}
              loading={loading}
              disabled={loading}
              onClick={handleRefresh}
            >
              Tải lại
            </Button>
          </div>
        </form>
      </section>

      {selectedCarFloor && <CarSlotManagementPanel floor={selectedCarFloor} />}

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Building2 size={19} /> Bộ lọc tầng
            </h2>

            <p className="section-copy">
              Lọc tầng theo tòa nhà, loại tầng hoặc trạng thái.
            </p>
          </div>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm kiếm">
            <Input
              placeholder="Nhập nội dung cần tìm..."
              value={filters.searchText}
              onChange={(event) => updateFilter("searchText", event.target.value)}
            />
          </FormField>

          <FormField label="Tìm theo cột" className="mg-pagination">
            <select
              className="form-input"
              value={filters.searchColumn}
              onChange={(event) => updateFilter("searchColumn", event.target.value)}
            >
              <option value="all">Tất cả cột</option>
              <option value="id">Mã</option>
              <option value="name">Tên tầng</option>
              <option value="buildingName">Tòa nhà</option>
              <option value="floorType">Loại tầng</option>
              <option value="capacityOrSlot">Sức chứa / Ô đỗ</option>
              <option value="status">Trạng thái</option>
              <option value="note">Ghi chú</option>
            </select>
          </FormField>

          <FormField label="Tòa nhà" className="mg-pagination">
            <select
              className="form-input"
              value={filters.buildingId}
              onChange={(event) => updateFilter("buildingId", event.target.value)}
            >
              <option value="">Tất cả tòa nhà</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Loại tầng" className="mg-pagination">
            <select
              className="form-input"
              value={filters.floorType}
              onChange={(event) => updateFilter("floorType", event.target.value)}
            >
              <option value="">Tất cả loại tầng</option>
              <option value="MOTORBIKE">Tầng xe máy</option>
              <option value="CAR">Tầng ô tô</option>
            </select>
          </FormField>

          <FormField label="Trạng thái" className="mg-pagination">
            <select
              className="form-input"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </FormField>

          <div style={{ alignSelf: "end" }}>
            <Button
              className="mg-pagination"
              type="button"
              variant="outline"
              onClick={() => {
                setFilters({
                  searchText: "",
                  searchColumn: "all",
                  buildingId: "",
                  floorType: "",
                  status: "",
                });
                setFloorPage(1);
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Layers size={19} /> Danh sách tầng
            </h2>

            <p className="section-copy">
              Danh sách tầng xe máy theo sức chứa và tầng ô tô theo từng ô đỗ.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên tầng</th>
                <th>Tòa nhà</th>
                <th>Loại</th>
                <th>Sức chứa / Ô đỗ</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8">Đang tải danh sách tầng...</td>
                </tr>
              )}

              {!loading && filteredFloors.length === 0 && (
                <tr>
                  <td colSpan="8">Chưa có tầng nào.</td>
                </tr>
              )}

              {!loading &&
                paginatedFloors.map((floor) => (
                  <tr key={floor.id}>
                    <td>#{floor.id}</td>

                    <td>
                      <strong>{floor.name}</strong>
                    </td>

                    <td>{floor.buildingName || floor.building_name || "-"}</td>

                    <td>
                      {floorTypeLabels[floor.floorType || floor.floor_type] ||
                        floor.floorType ||
                        floor.floor_type}
                    </td>

                    <td>
                      {(floor.floorType || floor.floor_type) === "MOTORBIKE"
                        ? `${floor.capacity || 0} xe máy`
                        : `${floor.slotCount || floor.slot_count || 0} ô tô`}
                    </td>

                    <td>
                      {statusLabels[floor.status] || floor.status || "-"}
                    </td>

                    <td>{floor.operationNote || floor.operation_note || "-"}</td>

                    <td>
                      <div className="action-row">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          icon={Edit2}
                          disabled={Boolean(updatingId) || Boolean(deletingId)}
                          onClick={() => startEdit(floor)}
                        >
                          Sửa
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          loading={deletingId === floor.id}
                          disabled={Boolean(deletingId)}
                          onClick={() => handleDelete(floor)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span className="mg-pagination">
            Trang {currentFloorPage}/{totalFloorPages} • Hiển thị {filteredFloors.length}/{floors.length} tầng
          </span>

          <div className="action-row mg-pagination">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentFloorPage <= 1}
              onClick={() => setFloorPage((prev) => Math.max(prev - 1, 1))}
            >
              Trước
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentFloorPage >= totalFloorPages}
              onClick={() =>
                setFloorPage((prev) => Math.min(prev + 1, totalFloorPages))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FloorManagementPage;
