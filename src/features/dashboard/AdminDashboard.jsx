import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Camera,
  Car,
  ClipboardCheck,
  Image,
  UserCheck,
  Users,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatDate,
  getVehicleTypeLabel,
  roleLabels,
} from "../../services/mockParkingData";
import { fetchAdminUsersRequest } from "../backend/adminUsers/adminUserSlice";
import { fetchAdminBuildingChangeRequestsRequest } from "../backend/buildingChange/buildingChangeSlice";
import { fetchAllVehiclesRequest } from "../backend/parking/parkingSlice";
import { fetchAdminStaffRoleRequestsRequest } from "../backend/staffRoleRequests/staffRoleRequestSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state) => state.adminUsers);
  const { vehicles } = useSelector((state) => state.parking);
  const {
    adminRequests,
    adminLoading,
    error: buildingChangeError,
  } = useSelector((state) => state.buildingChange);
  const {
    adminRequests: staffRoleRequests,
    adminLoading: staffRoleLoading,
    error: staffRoleError,
  } = useSelector((state) => state.staffRoleRequests);

  useEffect(() => {
    dispatch(fetchAdminUsersRequest({ limit: 100 }));
    dispatch(fetchAllVehiclesRequest());
    dispatch(fetchAdminBuildingChangeRequestsRequest({ status: "PENDING" }));
    dispatch(fetchAdminStaffRoleRequestsRequest({ status: "PENDING" }));
  }, [dispatch]);

  const pendingUsers = useMemo(
    () => users.filter((item) => item.status === "PENDING"),
    [users]
  );
  const activeUsers = useMemo(
    () => users.filter((item) => item.status === "ACTIVE"),
    [users]
  );
  const pendingVehicles = useMemo(
    () => vehicles.all.filter((vehicle) => vehicle.status === "PENDING"),
    [vehicles.all]
  );
  const pendingBuildingChanges = useMemo(
    () => adminRequests.filter((request) => request.status === "PENDING"),
    [adminRequests]
  );
  const pendingStaffRoles = useMemo(
    () => staffRoleRequests.filter((request) => request.status === "PENDING"),
    [staffRoleRequests]
  );
  const totalPending = pendingUsers.length
    + pendingVehicles.length
    + pendingBuildingChanges.length
    + pendingStaffRoles.length;

  const userColumns = [
    {
      header: "Người đăng ký",
      key: "name",
      minWidth: "210px",
      render: (row) => (
        <>
          <strong>{row.name || "Chưa cập nhật họ tên"}</strong>
          <br />
          <span className="metric-note">{row.email}</span>
          <br />
          <span className="metric-note">{row.phone || "Chưa có số điện thoại"}</span>
        </>
      ),
    },
    {
      header: "Tòa nhà",
      key: "buildingName",
      render: (row) => row.buildingName || "Chưa gán tòa nhà",
    },
    {
      header: "Quyền đề xuất",
      key: "role",
      render: (row) => roleLabels[row.role] || row.role,
    },
    {
      header: "Hồ sơ xe",
      key: "vehicleCount",
      render: (row) => `${Number(row.vehicleCount || 0)} xe`,
    },
    {
      header: "Ngày đăng ký",
      key: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Xử lý",
      key: "actions",
      minWidth: "160px",
      render: () => (
        <Button
          size="sm"
          icon={UserCheck}
          onClick={() => navigate("/admin/users")}
        >
          Xem và duyệt
        </Button>
      ),
    },
  ];

  const vehicleColumns = [
    {
      header: "Phương tiện",
      key: "plateNumber",
      render: (row) => (
        <>
          <strong>{row.plateNumber}</strong>
          <br />
          <span className="metric-note">
            {getVehicleTypeLabel(row.vehicleType)} · {row.brand || "Chưa có hãng"} · {row.color || "Chưa có màu"}
          </span>
        </>
      ),
    },
    {
      header: "Chủ xe",
      key: "ownerName",
      minWidth: "190px",
      render: (row) => (
        <>
          <strong>{row.ownerName || row.owner || "-"}</strong>
          <br />
          <span className="metric-note">{row.ownerEmail || "Chưa có email"}</span>
        </>
      ),
    },
    {
      header: "Tòa nhà",
      key: "buildingName",
      render: (row) => row.buildingName || "Chưa gán tòa nhà",
    },
    {
      header: "Bộ ảnh",
      key: "vehicleImages",
      render: (row) => {
        const imageCount = [
          row.plateImageUrl,
          row.vehiclePortraitImageUrl,
          row.vehicleLandscapeImageUrl,
        ].filter(Boolean).length;

        return (
          <span className={`pill ${imageCount === 3 ? "success" : "warning"}`}>
            <Image size={14} /> {imageCount}/3 ảnh
          </span>
        );
      },
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Xử lý",
      key: "actions",
      minWidth: "160px",
      render: () => (
        <Button
          size="sm"
          icon={Car}
          onClick={() => navigate("/admin/vehicles")}
        >
          Kiểm tra ảnh
        </Button>
      ),
    },
  ];

  const buildingChangeColumns = [
    {
      header: "Người yêu cầu",
      key: "userName",
      minWidth: "190px",
      render: (row) => (
        <>
          <strong>{row.userName || "Chưa cập nhật họ tên"}</strong>
          <br />
          <span className="metric-note">{row.userEmail || "Chưa có email"}</span>
        </>
      ),
    },
    {
      header: "Nơi chuyển",
      key: "route",
      minWidth: "260px",
      render: (row) => (
        <div className="approval-building-route">
          <span>{row.currentBuildingName || "Chưa có tòa hiện tại"}</span>
          <ArrowRight size={15} />
          <strong>{row.requestedBuildingName || "Chưa chọn tòa mới"}</strong>
        </div>
      ),
    },
    {
      header: "Lý do",
      key: "reason",
      render: (row) => row.reason || "Không ghi lý do",
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Xử lý",
      key: "actions",
      minWidth: "160px",
      render: () => (
        <Button
          size="sm"
          icon={Building2}
          onClick={() => navigate("/admin/building-change-requests")}
        >
          Xem yêu cầu
        </Button>
      ),
    },
  ];

  const staffRoleColumns = [
    {
      header: "Ảnh chân dung",
      key: "portraitImageUrl",
      render: (row) => (
        <img
          className="evidence-thumb"
          src={row.portraitImageUrl}
          alt={`Chân dung ${row.userName}`}
        />
      ),
    },
    {
      header: "Người được đề nghị",
      key: "userName",
      minWidth: "210px",
      render: (row) => (
        <>
          <strong>{row.userName}</strong>
          <br />
          <span className="metric-note">{row.userEmail}</span>
        </>
      ),
    },
    {
      header: "Tòa nhà",
      key: "buildingName",
      minWidth: "190px",
      render: (row) => row.buildingName,
    },
    {
      header: "Người đề nghị",
      key: "managerName",
      minWidth: "190px",
      render: (row) => (
        <>
          <strong>{row.managerName}</strong>
          <br />
          <span className="metric-note">{row.managerEmail}</span>
        </>
      ),
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Xử lý",
      key: "actions",
      minWidth: "160px",
      render: () => (
        <Button
          size="sm"
          icon={UserCheck}
          onClick={() => navigate("/admin/staff-role-requests")}
        >
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ClipboardCheck size={16} /> Trung tâm duyệt</div>
          <h1 className="page-title">Các hồ sơ đang chờ quản trị viên xử lý</h1>
          <p className="page-subtitle">
            Xin chào {user?.name || "quản trị viên"}. Mỗi hồ sơ được chuyển đến đúng màn hình kiểm tra trước khi duyệt.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Cần xử lý</span>
          <span className="page-hero-number">{totalPending}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      <StatusBanner errors={[vehicles.error, usersError, buildingChangeError, staffRoleError]} />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><UserCheck size={22} /></div>
          <div className="metric-label">Tài khoản chờ duyệt</div>
          <div className="metric-value">{pendingUsers.length}</div>
          <div className="metric-note">Kiểm tra liên hệ, tòa nhà và quyền sử dụng</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Xe chờ duyệt</div>
          <div className="metric-value">{pendingVehicles.length}</div>
          <div className="metric-note">Đối chiếu đủ ba ảnh xác minh</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Building2 size={22} /></div>
          <div className="metric-label">Yêu cầu đổi tòa</div>
          <div className="metric-value">{pendingBuildingChanges.length}</div>
          <div className="metric-note">Kiểm tra người yêu cầu và nơi chuyển đến</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Camera size={22} /></div>
          <div className="metric-label">Đề nghị nhân viên</div>
          <div className="metric-value">{pendingStaffRoles.length}</div>
          <div className="metric-note">Đối chiếu chân dung, tài khoản và tòa nhà</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Users size={22} /></div>
          <div className="metric-label">Tài khoản hoạt động</div>
          <div className="metric-value">{activeUsers.length}</div>
          <div className="metric-note">Đã được cấp quyền sử dụng hệ thống</div>
        </div>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><UserCheck size={19} /> Tài khoản chờ duyệt</h2>
            <p className="section-copy">Chọn đúng quyền sử dụng sau khi kiểm tra thông tin cá nhân.</p>
          </div>
          <Button variant="outline" size="sm" icon={ArrowRight} onClick={() => navigate("/admin/users")}>
            Mở danh sách
          </Button>
        </div>
        <Table
          columns={userColumns}
          data={pendingUsers}
          loading={usersLoading}
          pageSize={5}
          className="approval-overview-table"
          emptyMessage="Không có tài khoản mới đang chờ duyệt."
        />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><UserCheck size={19} /> Đề nghị cấp quyền nhân viên</h2>
            <p className="section-copy">Kiểm tra ảnh chân dung và thông tin do quản lý tòa nhà gửi.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/admin/staff-role-requests")}
          >
            Mở danh sách
          </Button>
        </div>
        <Table
          columns={staffRoleColumns}
          data={pendingStaffRoles}
          loading={staffRoleLoading}
          pageSize={5}
          className="approval-overview-table"
          emptyMessage="Không có đề nghị cấp quyền nhân viên đang chờ duyệt."
        />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Xe chờ kiểm tra ảnh</h2>
            <p className="section-copy">Việc duyệt được thực hiện tại hồ sơ có ảnh biển số, dọc thân xe và ngang thân xe.</p>
          </div>
          <Button variant="outline" size="sm" icon={ArrowRight} onClick={() => navigate("/admin/vehicles")}>
            Mở danh sách
          </Button>
        </div>
        <Table
          columns={vehicleColumns}
          data={pendingVehicles}
          loading={vehicles.loading}
          pageSize={5}
          className="approval-overview-table"
          emptyMessage="Không có phương tiện đang chờ duyệt."
        />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Yêu cầu đổi tòa nhà</h2>
            <p className="section-copy">Theo dõi nơi ở hoặc nơi làm việc hiện tại trước khi chuyển tòa.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/admin/building-change-requests")}
          >
            Mở danh sách
          </Button>
        </div>
        <Table
          columns={buildingChangeColumns}
          data={pendingBuildingChanges}
          loading={adminLoading}
          pageSize={5}
          className="approval-overview-table"
          emptyMessage="Không có yêu cầu đổi tòa nhà đang chờ duyệt."
        />
      </section>
    </div>
  );
};

export default AdminDashboard;
