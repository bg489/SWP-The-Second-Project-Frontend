import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  roleLabels,
} from "../../services/mockParkingData";
import { fetchAdminUsersRequest } from "../backend/adminUsers/adminUserSlice";
import {
  approveVehicleRequest,
  fetchAllVehiclesRequest,
  rejectVehicleRequest,
} from "../backend/parking/parkingSlice";
import { CheckCircle, ShieldCheck, UserCheck, UserCog, X } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.adminUsers);
  const { vehicles, notice } = useSelector((state) => state.parking);

  useEffect(() => {
    dispatch(fetchAdminUsersRequest({ limit: 100 }));
    dispatch(fetchAllVehiclesRequest());
  }, [dispatch]);

  const pendingVehicles = useMemo(
    () => vehicles.all.filter((vehicle) => vehicle.status === "PENDING"),
    [vehicles.all]
  );

  const userColumns = [
    { header: "Người dùng", key: "name" },
    { header: "Email", key: "email" },
    { header: "Quyền sử dụng", key: "role", render: (row) => roleLabels[row.role] || row.role },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    { header: "Ngày tạo", key: "createdAt", render: (row) => formatDate(row.createdAt) },
  ];

  const vehicleColumns = [
    { header: "Biển số", key: "plateNumber" },
    { header: "Chủ xe", key: "ownerName", render: (row) => row.ownerName || row.owner || "-" },
    { header: "Loại", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Xe", key: "brand", render: (row) => `${row.brand || "-"} - ${row.color || "-"}` },
    {
      header: "Duyệt",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Hành động",
      key: "actions",
      render: (row) =>
        row.status === "PENDING" ? (
          <div className="action-row">
            <Button
              size="sm"
              variant="primary"
              icon={CheckCircle}
              loading={vehicles.updatingId === row.id}
              disabled={vehicles.updatingId === row.id || row.status === "APPROVED"}
              onClick={() => dispatch(approveVehicleRequest({ id: row.id, vehicle: row }))}
            >
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={X}
              disabled={vehicles.updatingId === row.id || row.status === "REJECTED"}
              onClick={() => dispatch(rejectVehicleRequest({ id: row.id, vehicle: row }))}
            >
              Từ chối
            </Button>
          </div>
        ) : (
          "Đã xử lý"
        ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ShieldCheck size={16} /> Quản trị viên</div>
          <h1 className="page-title">Duyệt xe, kiểm soát tài khoản và phân quyền</h1>
          <p className="page-subtitle">
            Xin chào {user?.name || "quản trị viên"}. Các bảng bên dưới lấy trực tiếp từ hệ thống.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Xe chờ duyệt</span>
          <span className="page-hero-number">{pendingVehicles.length}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={[vehicles.error, usersError]} />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><UserCog size={22} /></div>
          <div className="metric-label">Tài khoản</div>
          <div className="metric-value">{users.length}</div>
          <div className="metric-note">Đang lấy từ danh sách tài khoản</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CarIcon /></div>
          <div className="metric-label">Phương tiện</div>
          <div className="metric-value">{vehicles.all.length}</div>
          <div className="metric-note">{vehicles.all.filter((v) => v.status === "APPROVED").length} xe đã duyệt</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><UserCheck size={22} /></div>
          <div className="metric-label">Chờ duyệt xe</div>
          <div className="metric-value">{pendingVehicles.length}</div>
          <div className="metric-note">Cần kiểm tra trước khi mua gói</div>
        </div>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><ShieldCheck size={19} /> Duyệt phương tiện</h2>
            <p className="section-copy">Sau khi duyệt, cư dân mới mua gói tháng hoặc dùng QR hợp lệ cho xe đó.</p>
          </div>
        </div>
        <Table columns={vehicleColumns} data={vehicles.all} loading={vehicles.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><UserCog size={19} /> Tài khoản và phân quyền</h2>
            <p className="section-copy">Theo dõi quyền sử dụng của từng nhóm người trong hệ thống.</p>
          </div>
        </div>
        <Table columns={userColumns} data={users} loading={usersLoading} />
      </section>
    </div>
  );
};

const CarIcon = () => <UserCheck size={22} />;

export default AdminDashboard;
