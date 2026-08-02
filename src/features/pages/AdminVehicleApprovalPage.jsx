/**
 * @fileoverview Xây dựng màn hình AdminVehicleApprovalPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Car, CheckCircle2, RefreshCcw, Search, X, XCircle } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import {
  approveVehicleRequest,
  clearParkingNotice,
  fetchAllVehiclesRequest,
  rejectVehicleRequest,
} from "../backend/parking/parkingSlice";
import { getStatusLabel, getStatusTone, getVehicleTypeLabel } from "../../services/mockParkingData";

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/AdminVehicleApprovalPage.jsx.
 */
const statusOptions = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả" },
];

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDate` (format date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDate
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-");

/**
 * Thực hiện nghiệp vụ `AdminVehicleApprovalPage` (admin vehicle approval page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function AdminVehicleApprovalPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AdminVehicleApprovalPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { vehicles, notice } = useSelector((state) => state.parking);

  const [filters, setFilters] = useState({
    status: "PENDING",
    q: "",
  });
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  }, [dispatch, filters.status]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!selectedReviewImage) return undefined;

    const previousOverflow = document.body.style.overflow;
    /**
     * Xóa hoặc đặt lại nghiệp vụ `closeOnEscape` (close on escape). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function closeOnEscape
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedReviewImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedReviewImage]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const rows = useMemo(() => {
    const search = filters.q.trim().toLowerCase();
    const byStatus = filters.status
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ? vehicles.all.filter((vehicle) => vehicle.status === filters.status)
      : vehicles.all;

    if (!search) return byStatus;

    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return byStatus.filter((vehicle) =>
      [vehicle.plateNumber, vehicle.owner, vehicle.ownerName, vehicle.brand, vehicle.color]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [filters.q, filters.status, vehicles.all]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const pendingCount = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return vehicles.all.filter((vehicle) => vehicle.status === "PENDING").length;
  }, [vehicles.all]);

  /**
   * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function refresh
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  };

  const columns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    {
      header: "Chủ xe",
      key: "ownerName",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <>
          <strong>{row.ownerName || row.owner || "-"}</strong>
          <br />
          <span className="metric-note">{row.ownerEmail || "Chưa có email"}</span>
          <br />
          <span className="metric-note">{row.ownerPhone || "Chưa có SĐT"}</span>
        </>
      ),
    },
    {
      header: "Tòa nhà",
      key: "buildingName",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <>
          <strong>{row.buildingName || "Chưa gán tòa"}</strong>
          <br />
          <span className="metric-note">Gửi ngày {formatDate(row.createdAt)}</span>
        </>
      ),
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Thông tin xe", key: "brand", render: (row) => `${row.brand || "-"}${row.color ? `, ${row.color}` : ""}` },
    {
      header: "Bộ ảnh xác minh",
      key: "vehicleImages",
      minWidth: "350px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => {
        const reviewImages = [
          { label: "Biển số", src: row.plateImageUrl },
          { label: "Dọc thân xe", src: row.vehiclePortraitImageUrl },
          { label: "Ngang thân xe", src: row.vehicleLandscapeImageUrl },
        ];

        return (
          <div className="vehicle-review-gallery">
            {reviewImages.map((image) => image.src ? (
              <button
                key={image.label}
                type="button"
                className="vehicle-plate-review-button"
                onClick={() => setSelectedReviewImage({
                  ...image,
                  plateNumber: row.plateNumber,
                  ownerName: row.ownerName || row.owner || "Chưa rõ chủ xe",
                })}
                aria-label={`Xem ${image.label.toLowerCase()} của xe ${row.plateNumber}`}
              >
                <img src={image.src} alt={`${image.label} xe ${row.plateNumber}`} />
                <span><Camera size={13} /> {image.label}</span>
              </button>
            ) : (
              <div className="vehicle-review-missing" key={image.label}>
                <Camera size={18} />
                <strong>{image.label}</strong>
                <small>Chưa có ảnh</small>
              </div>
            ))}
          </div>
        );
      },
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
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
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
            size="sm"
            icon={CheckCircle2}
            disabled={row.status === "APPROVED" || vehicles.updatingId === row.id}
            loading={vehicles.updatingId === row.id}
            onClick={() => dispatch(approveVehicleRequest({ id: row.id, vehicle: row }))}
          >
            Duyệt
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={XCircle}
            disabled={row.status === "REJECTED" || vehicles.updatingId === row.id}
            onClick={() => dispatch(rejectVehicleRequest({ id: row.id, vehicle: row }))}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Car size={16} /> Duyệt xe</div>
          <h1 className="page-title">Kiểm tra hồ sơ xe trước khi cho dùng gói tháng</h1>
          <p className="page-subtitle">
            Đối chiếu ảnh biển số, ảnh chụp dọc thân xe và ảnh chụp ngang thân xe trước khi quyết định duyệt.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang chờ</span>
          <span className="page-hero-number">{pendingCount}</span>
          <span className="page-hero-label">hồ sơ xe</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={vehicles.error} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Search size={19} /> Tìm hồ sơ xe</h2>
            <p className="section-copy">Lọc theo trạng thái hoặc tìm nhanh bằng biển số, chủ xe, hãng xe.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={vehicles.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>

        <div className="filter-grid">
          <FormField label="Trạng thái">
            <Select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              options={statusOptions}
              placeholder={null}
            />
          </FormField>

          <FormField label="Tìm kiếm">
            <Input
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              placeholder="Nhập biển số hoặc tên chủ xe"
            />
          </FormField>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Danh sách hồ sơ xe</h2>
            <p className="section-copy">Chỉ xe đã duyệt mới được mua gói tháng và dùng QR hợp lệ.</p>
          </div>
        </div>

        <Table columns={columns} data={rows} loading={vehicles.loading} />
      </section>

      {selectedReviewImage && createPortal(
        <div
          className="image-review-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedReviewImage(null)}
        >
          <section
            className="image-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedReviewImage.label} xe ${selectedReviewImage.plateNumber}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="image-review-close"
              onClick={() => setSelectedReviewImage(null)}
              aria-label="Đóng ảnh"
            >
              <X size={22} />
            </button>
            <div className="image-review-heading">
              <Camera size={20} />
              <div>
                <strong>{selectedReviewImage.label}: {selectedReviewImage.plateNumber}</strong>
                <span>{selectedReviewImage.ownerName}</span>
              </div>
            </div>
            <img
              className="image-review-large"
              src={selectedReviewImage.src}
              alt={`${selectedReviewImage.label} xe ${selectedReviewImage.plateNumber}`}
            />
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminVehicleApprovalPage;
