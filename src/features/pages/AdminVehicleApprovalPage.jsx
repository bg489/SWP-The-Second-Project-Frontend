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

const statusOptions = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả" },
];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-");

const AdminVehicleApprovalPage = () => {
  const dispatch = useDispatch();
  const { vehicles, notice } = useSelector((state) => state.parking);

  const [filters, setFilters] = useState({
    status: "PENDING",
    q: "",
  });
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  }, [dispatch, filters.status]);

  useEffect(() => {
    if (!selectedReviewImage) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedReviewImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedReviewImage]);

  const rows = useMemo(() => {
    const search = filters.q.trim().toLowerCase();
    const byStatus = filters.status
      ? vehicles.all.filter((vehicle) => vehicle.status === filters.status)
      : vehicles.all;

    if (!search) return byStatus;

    return byStatus.filter((vehicle) =>
      [vehicle.plateNumber, vehicle.owner, vehicle.ownerName, vehicle.brand, vehicle.color]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [filters.q, filters.status, vehicles.all]);

  const pendingCount = useMemo(() => {
    return vehicles.all.filter((vehicle) => vehicle.status === "PENDING").length;
  }, [vehicles.all]);

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  };

  const columns = [
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    {
      header: "Chủ xe",
      key: "ownerName",
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
      render: (row) => (
        <>
          <strong>{row.buildingName || "Chưa gán tòa"}</strong>
          <br />
          <span className="metric-note">Gửi ngày {formatDate(row.createdAt)}</span>
        </>
      ),
    },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Thông tin xe", key: "brand", render: (row) => `${row.brand || "-"}${row.color ? `, ${row.color}` : ""}` },
    {
      header: "Bộ ảnh xác minh",
      key: "vehicleImages",
      minWidth: "350px",
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
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Thao tác",
      key: "actions",
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
