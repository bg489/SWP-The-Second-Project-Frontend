import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Car, CheckCircle2, RefreshCcw, Search, XCircle } from "lucide-react";

import Button from "../../components/Button/Button";
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

const AdminVehicleApprovalPage = () => {
  const dispatch = useDispatch();
  const { vehicles, notice } = useSelector((state) => state.parking);

  const [filters, setFilters] = useState({
    status: "PENDING",
    q: "",
  });

  useEffect(() => {
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  }, [dispatch, filters.status]);

  const rows = useMemo(() => {
    const search = filters.q.trim().toLowerCase();
    if (!search) return vehicles.all;

    return vehicles.all.filter((vehicle) =>
      [vehicle.plateNumber, vehicle.owner, vehicle.brand, vehicle.color]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [filters.q, vehicles.all]);

  const pendingCount = useMemo(() => {
    return vehicles.all.filter((vehicle) => vehicle.status === "PENDING").length;
  }, [vehicles.all]);

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchAllVehiclesRequest({ status: filters.status || undefined }));
  };

  const columns = [
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    { header: "Chủ xe", key: "owner" },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Thông tin xe", key: "brand", render: (row) => `${row.brand || "-"}${row.color ? `, ${row.color}` : ""}` },
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
            Xe cần được duyệt trước khi cư dân mua gói tháng hoặc dùng mã QR để ra vào bãi.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang chờ</span>
          <span className="page-hero-number">{pendingCount}</span>
          <span className="page-hero-label">hồ sơ xe</span>
        </div>
      </section>

      {(notice || vehicles.error) && (
        <section className="card soft-panel">
          {notice && <span className="pill success">{notice}</span>}
          {vehicles.error && <p style={{ color: "var(--danger)" }}>{vehicles.error}</p>}
        </section>
      )}

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
    </div>
  );
};

export default AdminVehicleApprovalPage;
