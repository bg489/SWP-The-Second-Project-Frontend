/**
 * @fileoverview Xây dựng màn hình ManagerViolationTypesPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  Bike,
  Car,
  Edit2,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  clearParkingNotice,
  deactivateViolationTypeRequest,
  fetchViolationTypesRequest,
  saveViolationTypeRequest,
} from "../backend/parking/parkingSlice";
import {
  formatCurrency,
  getStatusLabel,
  getStatusTone,
} from "../../services/mockParkingData";
import "./ManagerViolationTypesPage.css";

/**
 * Khai báo `specialViolationMeta` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/ManagerViolationTypesPage.jsx.
 */
const specialViolationMeta = {
  WRONG_SLOT: {
    label: "Ô tô đậu sai ô",
    description: "Áp dụng khi ô tô chiếm ô đã được giữ hoặc không đậu đúng ô được phân.",
    icon: Car,
  },
  MOTORBIKE_WRONG_FLOOR: {
    label: "Xe máy đậu sai khu",
    description: "Áp dụng khi xe máy đi vào khu vực dành cho ô tô.",
    icon: Bike,
  },
  CAR_WRONG_FLOOR_TOW: {
    label: "Ô tô đậu sai khu",
    description: "Áp dụng khi ô tô đi vào khu xe máy và cần đưa về ô chỉ định.",
    icon: AlertTriangle,
  },
};

/**
 * Khai báo `emptyForm` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/ManagerViolationTypesPage.jsx.
 */
const emptyForm = {
  name: "",
  defaultPenaltyFee: "",
  description: "",
  status: "ACTIVE",
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeDisplayName` (normalize display name). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeDisplayName
 * @param {*} item - Giá trị `item` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeDisplayName = (item) => {
  if (item?.code && specialViolationMeta[item.code]) {
    const legacyNames = ["WRONG_SLOT", "Xe may vao khu oto", "Keo oto do sai khu"];
    return legacyNames.includes(item.name)
      ? specialViolationMeta[item.code].label
      : item.name;
  }

  return item?.name || "Chưa đặt tên";
};

/**
 * Thực hiện nghiệp vụ `ManagerViolationTypesPage` (manager violation types page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ManagerViolationTypesPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ManagerViolationTypesPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { violationTypes } = useSelector((state) => state.parking);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchViolationTypesRequest({ includeInactive: true }));
  }, [dispatch]);

  const specialTypes = useMemo(
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => Object.keys(specialViolationMeta).map((code) => ({
      code,
      meta: specialViolationMeta[code],
      /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      item: violationTypes.items.find((type) => type.code === code) || null,
    })),
    [violationTypes.items]
  );

  const sortedTypes = useMemo(
    /* Callback nội bộ của lời gọi `sort`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => [...violationTypes.items].sort((left, right) => {
      const leftSpecial = left.code && specialViolationMeta[left.code] ? 0 : 1;
      const rightSpecial = right.code && specialViolationMeta[right.code] ? 0 : 1;
      return leftSpecial - rightSpecial ||
        String(normalizeDisplayName(left)).localeCompare(normalizeDisplayName(right), "vi");
    }),
    [violationTypes.items]
  );

  /**
   * Xóa hoặc đặt lại nghiệp vụ `resetForm` (reset form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function resetForm
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const resetForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
  };

  const markFormSubmitted = useResetAfterSuccess({
    submitting: violationTypes.saving,
    success: violationTypes.mutationSuccess,
    error: violationTypes.error,
    onSuccess: resetForm,
  });

  /**
   * Xử lý nghiệp vụ `handleEdit` (handle edit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleEdit
   * @param {*} item - Giá trị `item` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleEdit = (item) => {
    dispatch(clearParkingNotice());
    setEditingItem(item);
    setForm({
      name: normalizeDisplayName(item),
      defaultPenaltyFee: String(item.defaultPenaltyFee ?? item.penaltyFee ?? ""),
      description: item.description || "",
      status: item.status || "ACTIVE",
    });
  };

  /**
   * Cập nhật nghiệp vụ `updateForm` (update form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((current) => ({ ...current, [field]: value }));
  };

  /**
   * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || form.defaultPenaltyFee === "") return;

    markFormSubmitted();
    dispatch(saveViolationTypeRequest({
      id: editingItem?.id || undefined,
      name: form.name.trim(),
      defaultPenaltyFee: Number(form.defaultPenaltyFee),
      description: form.description.trim() || undefined,
      status: form.status,
      includeInactive: true,
    }));
  };

  /**
   * Xử lý nghiệp vụ `handleDeactivate` (handle deactivate). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleDeactivate
   * @param {*} item - Giá trị `item` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleDeactivate = (item) => {
    const confirmed = window.confirm(
      `Ngừng áp dụng mức phí "${normalizeDisplayName(item)}"?`
    );

    if (!confirmed) return;

    dispatch(deactivateViolationTypeRequest({
      id: item.id,
      includeInactive: true,
    }));
  };

  const columns = [
    {
      header: "Nội dung vi phạm",
      key: "name",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <div style={{ display: "grid", gap: 4 }}>
          <strong>{normalizeDisplayName(row)}</strong>
          <span className="section-copy">
            {row.code && specialViolationMeta[row.code]
              ? "Mức thu dùng trong xử lý tự động"
              : "Mức thu do quản lý tạo"}
          </span>
        </div>
      ),
    },
    {
      header: "Số tiền",
      key: "defaultPenaltyFee",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <strong className="text-danger">
          {formatCurrency(row.defaultPenaltyFee ?? row.penaltyFee ?? 0)}
        </strong>
      ),
    },
    {
      header: "Mô tả",
      key: "description",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => row.description || "-",
    },
    {
      header: "Trạng thái",
      key: "status",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <span className={`pill ${getStatusTone(row.status || "ACTIVE")}`}>
          {getStatusLabel(row.status || "ACTIVE")}
        </span>
      ),
    },
    {
      header: "Thao tác",
      key: "actions",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <div className="action-row">
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => handleEdit(row)}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            disabled={row.status === "INACTIVE" || violationTypes.saving}
            onClick={() => handleDeactivate(row)}
          >
            Ngừng
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="parking-page animate-fade-in">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <AlertTriangle size={16} /> Mức phí vi phạm
          </div>
          <h1 className="page-title">Quản lý nội dung và số tiền vi phạm</h1>
          <p className="page-subtitle">
            Nhân viên chỉ được dùng đúng số tiền đã cấu hình khi chọn một nội dung có sẵn.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang áp dụng</span>
          <span className="page-hero-number">
            {violationTypes.items.filter((item) => item.status === "ACTIVE").length}
          </span>
          <span className="page-hero-label">mức thu</span>
        </div>
      </section>

      <StatusBanner
        success={violationTypes.mutationSuccess}
        errors={violationTypes.error}
      />

      <section className="violation-special-grid" aria-label="Mức phí xử lý tự động">
        {specialTypes.map(({ code, meta, item }) => {
          const Icon = meta.icon;
          return (
            <article className="card violation-special-card" key={code}>
              <div className="violation-special-icon"><Icon size={22} /></div>
              <div className="violation-special-heading">
                <h2>{meta.label}</h2>
                <span className={`pill ${getStatusTone(item?.status || "ACTIVE")}`}>
                  {item ? getStatusLabel(item.status || "ACTIVE") : "Chưa khởi tạo"}
                </span>
              </div>
              <strong className="violation-special-price">
                {item ? formatCurrency(item.defaultPenaltyFee) : "Chưa có"}
              </strong>
              <p>{meta.description}</p>
              {item && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => handleEdit(item)}
                >
                  Chỉnh mức thu
                </Button>
              )}
            </article>
          );
        })}
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {editingItem ? <Edit2 size={19} /> : <Plus size={19} />}
              {editingItem ? "Cập nhật mức phí" : "Thêm nội dung vi phạm"}
            </h2>
            <p className="section-copy">
              {editingItem?.code
                ? "Đây là mức thu được dùng trực tiếp trong quy trình xử lý xe."
                : "Nội dung tự tạo sẽ xuất hiện trong danh sách để nhân viên lựa chọn."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="filter-grid">
          <FormField label="Nội dung vi phạm" required>
            <Input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Ví dụ: Làm hỏng thanh chắn"
            />
          </FormField>
          <FormField label="Số tiền (đồng)" required>
            <Input
              type="number"
              min="0"
              step="1000"
              value={form.defaultPenaltyFee}
              onChange={(event) => updateForm("defaultPenaltyFee", event.target.value)}
              placeholder="Nhập số tiền"
            />
          </FormField>
          <FormField label="Trạng thái">
            <Select
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              options={[
                { value: "ACTIVE", label: "Đang áp dụng" },
                { value: "INACTIVE", label: "Ngừng áp dụng" },
              ]}
              placeholder={null}
            />
          </FormField>
          <FormField label="Mô tả">
            <Input
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Ghi chú để nhân viên dễ nhận biết"
            />
          </FormField>
          <div className="action-row" style={{ alignSelf: "end" }}>
            <Button type="submit" icon={Save} loading={violationTypes.saving}>
              Lưu mức phí
            </Button>
            {editingItem && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Hủy
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Danh sách mức phí</h2>
            <p className="section-copy">
              Bao gồm mức thu tự động và những nội dung do quản lý tạo thêm.
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            onClick={() => dispatch(fetchViolationTypesRequest({ includeInactive: true }))}
          >
            Làm mới
          </Button>
        </div>
        <Table
          columns={columns}
          data={sortedTypes}
          loading={violationTypes.loading}
          emptyMessage="Chưa có mức phí vi phạm."
        />
      </section>
    </div>
  );
};

export default ManagerViolationTypesPage;
