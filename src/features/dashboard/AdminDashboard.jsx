import { useState } from "react";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  roleLabels,
  users,
  vehicles,
} from "../../services/mockParkingData";
import { CheckCircle, ShieldCheck, UserCheck, UserCog, X } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useMockAuth();
  const [vehicleRows, setVehicleRows] = useState(vehicles);
  const [notice, setNotice] = useState("");

  const updateVehicle = (id, status) => {
    setVehicleRows((rows) => rows.map((vehicle) => (vehicle.id === id ? { ...vehicle, status } : vehicle)));
    setNotice(status === "APPROVED" ? "Đã duyệt xe thành công." : "Đã từ chối xe và ghi chú cho cư dân.");
    setTimeout(() => setNotice(""), 2400);
  };

  const pendingVehicles = vehicleRows.filter((vehicle) => vehicle.status === "PENDING");

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
    { header: "Chủ xe", key: "owner" },
    { header: "Loại", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Xe", key: "brand", render: (row) => `${row.brand} - ${row.color}` },
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
            <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => updateVehicle(row.id, "APPROVED")}>
              Duyệt
            </Button>
            <Button size="sm" variant="outline" icon={X} onClick={() => updateVehicle(row.id, "REJECTED")}>
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
            Xin chào {user.name}. Quản trị viên đảm bảo xe được duyệt trước khi cư dân mua gói tháng hoặc dùng QR hợp lệ.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Xe chờ duyệt</span>
          <span className="page-hero-number">{pendingVehicles.length}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      {notice && <div className="card soft-panel"><strong>{notice}</strong></div>}

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><UserCog size={22} /></div>
          <div className="metric-label">Tài khoản</div>
          <div className="metric-value">{users.length}</div>
          <div className="metric-note">Cư dân, nhân viên, quản lý và quản trị viên</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CarIcon /></div>
          <div className="metric-label">Phương tiện</div>
          <div className="metric-value">{vehicleRows.length}</div>
          <div className="metric-note">{vehicleRows.filter((v) => v.status === "APPROVED").length} xe đã duyệt</div>
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
        <Table columns={vehicleColumns} data={vehicleRows} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><UserCog size={19} /> Tài khoản và phân quyền</h2>
            <p className="section-copy">Theo dõi quyền sử dụng của từng nhóm người trong hệ thống.</p>
          </div>
        </div>
        <Table columns={userColumns} data={users} />
      </section>
    </div>
  );
};

const CarIcon = () => <UserCheck size={22} />;

export default AdminDashboard;
