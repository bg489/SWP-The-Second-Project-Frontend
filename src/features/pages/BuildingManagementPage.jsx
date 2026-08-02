/**
 * @fileoverview Xây dựng màn hình BuildingManagementPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Edit2,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  clearBuildingNotice,
  createBuildingRequest,
  deleteBuildingRequest,
  fetchBuildingsRequest,
  updateBuildingRequest,
} from "../backend/buildings/buildingSlice";

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeText` (normalize text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeText
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Lấy nghiệp vụ `getBuildingSearchValue` (get building search value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getBuildingSearchValue
 * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
 * @param {*} column - Giá trị `column` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
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

/**
 * Tạo nghiệp vụ `BuildingManagementPage` (building management page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function BuildingManagementPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const BuildingManagementPage = () => {
  const dispatch = useDispatch();
  const formSectionRef = useRef(null);

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
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.buildings);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    motorbikeTurnPrice: "4000",
    carHourlyPrice: "20000",
    motorbikeMonthlyPrice: "120000",
    carMonthlyPrice: "1800000",
  });
  const [formErrors, setFormErrors] = useState({});

  const totalBuildings = buildings.length;
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const newestBuilding = useMemo(() => buildings[0] || null, [buildings]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const filteredBuildings = useMemo(() => {
    const search = normalizeText(buildingFilters.searchText);

    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return buildings.filter((building) => {
      if (!search) return true;

      return normalizeText(
        getBuildingSearchValue(building, buildingFilters.searchColumn)
      ).includes(search);
    });
  }, [buildings, buildingFilters]);

  /**
   * Thực hiện nghiệp vụ `scrollToForm` (scroll to form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function scrollToForm
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const scrollToForm = () => {
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /**
   * Cập nhật nghiệp vụ `updateField` (update field). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateField
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateField = (field, value) => {
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    dispatch(clearBuildingNotice());
  };

  /**
   * Cập nhật nghiệp vụ `updateFilter` (update filter). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateFilter
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateFilter = (field, value) => {
    /* Callback nội bộ của lời gọi `setBuildingFilters`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setBuildingFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Kiểm tra nghiệp vụ `validateForm` (validate form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function validateForm
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên tòa nhà.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ tòa nhà.";
    }

    if (!editingId) {
      [
        ["motorbikeTurnPrice", "Vui lòng nhập giá xe máy một lượt."],
        ["carHourlyPrice", "Vui lòng nhập giá ô tô một giờ."],
        ["motorbikeMonthlyPrice", "Vui lòng nhập giá gói tháng xe máy."],
        ["carMonthlyPrice", "Vui lòng nhập giá gói tháng ô tô."],
      /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ].forEach(([field, message]) => {
        if (!Number.isInteger(Number(form[field])) || Number(form[field]) <= 0) {
          nextErrors[field] = message;
        }
      });
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /**
   * Xóa hoặc đặt lại nghiệp vụ `resetForm` (reset form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function resetForm
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      address: "",
      motorbikeTurnPrice: "4000",
      carHourlyPrice: "20000",
      motorbikeMonthlyPrice: "120000",
      carMonthlyPrice: "1800000",
    });
    setFormErrors({});
  };

  const markFormSubmitted = useResetAfterSuccess({
    submitting: creating || Boolean(updatingId),
    success: mutationSuccess,
    error: mutationError,
    onSuccess: resetForm,
  });

  /**
   * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
    };

    markFormSubmitted();

    if (editingId) {
      dispatch(
        updateBuildingRequest({
          id: editingId,
          ...payload,
        })
      );
    } else {
      dispatch(createBuildingRequest({
        ...payload,
        motorbikeTurnPrice: Number(form.motorbikeTurnPrice),
        carHourlyPrice: Number(form.carHourlyPrice),
        motorbikeMonthlyPrice: Number(form.motorbikeMonthlyPrice),
        carMonthlyPrice: Number(form.carMonthlyPrice),
      }));
    }
  };

  /**
   * Thực hiện nghiệp vụ `startEdit` (start edit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function startEdit
   * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const startEdit = (building) => {
    dispatch(clearBuildingNotice());
    setEditingId(building.id);
    setForm({
      name: building.name || "",
      address: building.address || "",
      motorbikeTurnPrice: "4000",
      carHourlyPrice: "20000",
      motorbikeMonthlyPrice: "120000",
      carMonthlyPrice: "1800000",
    });
    scrollToForm();
  };

  /**
   * Xử lý nghiệp vụ `handleDelete` (handle delete). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleDelete
   * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleDelete = (building) => {
    const ok = window.confirm(
      `Bạn chắc muốn xóa tòa nhà "${building.name}" không?`
    );

    if (!ok) return;

    dispatch(deleteBuildingRequest({ id: building.id }));
  };

  /**
   * Xử lý nghiệp vụ `handleRefresh` (handle refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleRefresh
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleRefresh = () => {
    dispatch(clearBuildingNotice());
    dispatch(fetchBuildingsRequest());
  };

  const columns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Mã", key: "id", render: (building) => `#${building.id}` },
    {
      header: "Tên tòa nhà",
      key: "name",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (building) => <strong>{building.name}</strong>,
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Địa chỉ", key: "address", render: (building) => building.address || "-" },
    {
      header: "QR tạm",
      key: "tempQrCardCount",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (building) => `${Number(building.tempQrCardCount || 0)} thẻ`,
    },
    {
      header: "Ngày tạo",
      key: "createdAt",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (building) =>
        building.createdAt || building.created_at
          ? new Date(building.createdAt || building.created_at).toLocaleDateString("vi-VN")
          : "-",
    },
    {
      header: "Thao tác",
      key: "actions",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} building - Giá trị `building` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (building) => (
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
      ),
    },
  ];

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

      <StatusBanner success={mutationSuccess} errors={[mutationError, error]} />

      <section ref={formSectionRef} className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {editingId ? <Edit2 size={19} /> : <Plus size={19} />}
              {editingId ? "Sửa tòa nhà" : "Tạo tòa nhà mới"}
            </h2>

            <p className="section-copy">
              Thông tin sau khi lưu sẽ dùng cho đăng ký tài khoản, tầng gửi xe
              và yêu cầu đổi tòa nhà. Hệ thống tự tạo sẵn thẻ QR tạm theo tên
              viết tắt của tòa nhà.
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

          {!editingId && (
            <div className="filter-grid">
              <FormField label="Giá xe máy một lượt" required error={formErrors.motorbikeTurnPrice}>
                <Input
                  type="number"
                  min="1"
                  value={form.motorbikeTurnPrice}
                  onChange={(event) => updateField("motorbikeTurnPrice", event.target.value)}
                  disabled={creating}
                />
              </FormField>

              <FormField label="Giá ô tô một giờ" required error={formErrors.carHourlyPrice}>
                <Input
                  type="number"
                  min="1"
                  value={form.carHourlyPrice}
                  onChange={(event) => updateField("carHourlyPrice", event.target.value)}
                  disabled={creating}
                />
              </FormField>

              <FormField label="Gói tháng xe máy" required error={formErrors.motorbikeMonthlyPrice}>
                <Input
                  type="number"
                  min="1"
                  value={form.motorbikeMonthlyPrice}
                  onChange={(event) => updateField("motorbikeMonthlyPrice", event.target.value)}
                  disabled={creating}
                />
              </FormField>

              <FormField label="Gói tháng ô tô" required error={formErrors.carMonthlyPrice}>
                <Input
                  type="number"
                  min="1"
                  value={form.carMonthlyPrice}
                  onChange={(event) => updateField("carMonthlyPrice", event.target.value)}
                  disabled={creating}
                />
              </FormField>
            </div>
          )}

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
              onChange={(event) => updateFilter("searchText", event.target.value)}
            />
          </FormField>

          <FormField label="Tìm theo cột">
            <select
              className="form-input"
              value={buildingFilters.searchColumn}
              onChange={(event) => updateFilter("searchColumn", event.target.value)}
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
              onClick={() =>
                setBuildingFilters({
                  searchText: "",
                  searchColumn: "all",
                })
              }
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

        <Table
          columns={columns}
          data={filteredBuildings}
          loading={loading}
          emptyMessage="Chưa có tòa nhà nào."
        />
      </section>
    </div>
  );
};

export default BuildingManagementPage;
