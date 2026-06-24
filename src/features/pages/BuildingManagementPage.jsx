import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CheckCircle,
  Edit2,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import {
  clearBuildingNotice,
  createBuildingRequest,
  deleteBuildingRequest,
  fetchBuildingsRequest,
  updateBuildingRequest,
} from "../backend/buildings/buildingSlice";


const BuildingManagementPage = () => {
  const dispatch = useDispatch();

  const formSectionRef = useRef(null);
  const PAGE_SIZE = 5;

  const [buildingPage, setBuildingPage] = useState(1);

  const [buildingFilters, setBuildingFilters] = useState({
    searchText: "",
    searchColumn: "all",
  });

  const {
    buildings,
    loading,
    error,
    creating,
    updatingId,
    deletingId,
    mutationError,
    mutationSuccess,
  } = useSelector((state) => state.buildings);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const totalBuildings = buildings.length;

  const newestBuilding = useMemo(() => buildings[0] || null, [buildings]);

  const normalizeText = (value) => {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const getBuildingSearchValue = (building, column) => {
    const values = {
      id: building.id,
      name: building.name,
      address: building.address,
      createdAt: building.createdAt || building.created_at,
    };

    if (column === "all") {
      return Object.values(values).join(" ");
    }

    return values[column] ?? "";
  };

  const filteredBuildings = useMemo(() => {
    const search = normalizeText(buildingFilters.searchText);

    return buildings.filter((building) => {
      if (!search) return true;

      return normalizeText(
        getBuildingSearchValue(building, buildingFilters.searchColumn)
      ).includes(search);
    });
  }, [buildings, buildingFilters]);

  const totalBuildingPages = Math.max(
    1,
    Math.ceil(filteredBuildings.length / PAGE_SIZE)
  );
  const currentBuildingPage = Math.min(buildingPage, totalBuildingPages);

  const paginatedBuildings = useMemo(() => {
    const startIndex = (currentBuildingPage - 1) * PAGE_SIZE;
    return filteredBuildings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBuildings, currentBuildingPage]);

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

    dispatch(clearBuildingNotice());
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên tòa nhà.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ tòa nhà.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      address: "",
    });
    setFormErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
    };

    if (editingId) {
      dispatch(
        updateBuildingRequest({
          id: editingId,
          ...payload,
        })
      );
    } else {
      dispatch(createBuildingRequest(payload));
    }

    resetForm();
  };

  const startEdit = (building) => {
    dispatch(clearBuildingNotice());

    setEditingId(building.id);
    setForm({
      name: building.name || "",
      address: building.address || "",
    });

    scrollToForm();
  };

  const handleDelete = (building) => {
    const ok = window.confirm(
      `Bạn chắc muốn xóa tòa nhà "${building.name}" không?`
    );

    if (!ok) return;

    dispatch(deleteBuildingRequest({ id: building.id }));
  };

  const handleRefresh = () => {
    dispatch(clearBuildingNotice());
    dispatch(fetchBuildingsRequest());
  };

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <Building2 size={16} /> Tòa nhà
          </div>

          <h1 className="page-title">Quản lý tòa nhà</h1>

          <p className="page-subtitle">
            Quản lý có thể thêm, sửa, xóa tòa nhà. Tòa nhà sẽ được dùng cho đăng
            ký tài khoản và yêu cầu đổi tòa nhà.
          </p>
        </div>

        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng tòa nhà</span>
          <span className="page-hero-number">{totalBuildings}</span>
          <span className="page-hero-label">
            {newestBuilding ? newestBuilding.name : "Chưa có dữ liệu"}
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
              {editingId ? "Sửa tòa nhà" : "Tạo tòa nhà mới"}
            </h2>

            <p className="section-copy">
              Thông tin sau khi lưu sẽ dùng cho đăng ký tài khoản, tầng gửi xe
              và yêu cầu đổi tòa nhà.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <FormField label="Tên tòa nhà" required error={formErrors.name}>
            <Input
              placeholder="Ví dụ: Sunrise Residence Parking"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            />
          </FormField>

          <FormField label="Địa chỉ" required error={formErrors.address}>
            <Input
              placeholder="Ví dụ: Quận 7, TP.HCM"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
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
              {editingId ? "Lưu thay đổi" : "Tạo tòa nhà"}
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

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Tìm kiếm tòa nhà</h2>
            <p className="section-copy">
              Tìm theo tất cả thông tin hoặc chọn riêng mã, tên, địa chỉ, ngày tạo.
            </p>
          </div>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm kiếm">
            <Input
              placeholder="Nhập tên tòa nhà, địa chỉ, mã..."
              value={buildingFilters.searchText}
              onChange={(event) => {
                setBuildingFilters((prev) => ({
                  ...prev,
                  searchText: event.target.value,
                }));
                setBuildingPage(1);
              }}
            />
          </FormField>

          <FormField label="Tìm theo cột">
            <select
              className="form-input"
              value={buildingFilters.searchColumn}
              onChange={(event) => {
                setBuildingFilters((prev) => ({
                  ...prev,
                  searchColumn: event.target.value,
                }));
                setBuildingPage(1);
              }}
            >
              <option value="all">Tất cả cột</option>
              <option value="id">Mã</option>
              <option value="name">Tên tòa nhà</option>
              <option value="address">Địa chỉ</option>
              <option value="createdAt">Ngày tạo</option>
            </select>
          </FormField>

          <div style={{ alignSelf: "end" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBuildingFilters({
                  searchText: "",
                  searchColumn: "all",
                });
                setBuildingPage(1);
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
              <Building2 size={19} /> Danh sách tòa nhà
            </h2>

            <p className="section-copy">
              Có thể sửa hoặc xóa trực tiếp từng tòa nhà.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên tòa nhà</th>
                <th>Địa chỉ</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5">Đang tải danh sách tòa nhà...</td>
                </tr>
              )}

              {!loading && filteredBuildings.length === 0 && (
                <tr>
                  <td colSpan="5">Chưa có tòa nhà nào.</td>
                </tr>
              )}

              {!loading &&
                paginatedBuildings.map((building) => (
                  <tr key={building.id}>
                    <td>#{building.id}</td>

                    <td>
                      <strong>{building.name}</strong>
                    </td>

                    <td>{building.address || "-"}</td>

                    <td>
                      {building.createdAt || building.created_at
                        ? new Date(
                          building.createdAt || building.created_at
                        ).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>

                    <td>
                      <div className="action-row">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          icon={Edit2}
                          disabled={Boolean(updatingId) || Boolean(deletingId)}
                          onClick={() => startEdit(building)}
                        >
                          Sửa
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          loading={deletingId === building.id}
                          disabled={Boolean(deletingId)}
                          onClick={() => handleDelete(building)}
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
            Trang {currentBuildingPage}/{totalBuildingPages} • Hiển thị {filteredBuildings.length}/{buildings.length} tòa nhà
          </span>

          <div className="action-row mg-pagination">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentBuildingPage <= 1}
              onClick={() => setBuildingPage((prev) => Math.max(prev - 1, 1))}
            >
              Trước
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentBuildingPage >= totalBuildingPages}
              onClick={() =>
                setBuildingPage((prev) => Math.min(prev + 1, totalBuildingPages))
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

export default BuildingManagementPage;
