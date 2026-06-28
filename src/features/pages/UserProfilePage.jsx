import { useState } from "react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import { formatDate, getStatusLabel, getStatusTone, getVehicleTypeLabel, vehicles } from "../../services/mockParkingData";
import { Car, Plus, Save, User } from "lucide-react";

const UserProfilePage = () => {
  const { user } = useMockAuth();
  const [vehicleRows, setVehicleRows] = useState(vehicles.filter((vehicle) => vehicle.userId === user.id));
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("MOTORBIKE");
  const [brand, setBrand] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!plateNumber.trim() || !brand.trim()) {
      setNotice("Vui lòng nhập biển số và hãng xe.");
      return;
    }

    setVehicleRows((rows) => [
      {
        id: Date.now(),
        userId: user.id,
        owner: user.name,
        plateNumber: plateNumber.toUpperCase(),
        vehicleType,
        brand,
        color: "Chưa cập nhật",
        status: "PENDING",
        buildingId: user.buildingId || user.building_id || 1,
      },
      ...rows,
    ]);
    setPlateNumber("");
    setBrand("");
    setNotice("Đã tạo hồ sơ xe ở trạng thái chờ admin duyệt.");
  };

  const columns = [
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Hãng xe", key: "brand" },
    {
      header: "Trạng thái duyệt",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><User size={16} /> Hồ sơ user</div>
          <h1 className="page-title">Thông tin cá nhân và phương tiện</h1>
          <p className="page-subtitle">User tạo xe mới, chờ admin duyệt rồi mới mua gói tháng hoặc dùng QR hợp lệ.</p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tài khoản</span>
          <span className="page-hero-number">#{user.id}</span>
          <span className="page-hero-label">{user.email}</span>
        </div>
      </section>

      {notice && <div className="card soft-panel"><strong>{notice}</strong></div>}

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><User size={19} /> Hồ sơ cá nhân</h2>
              <p className="section-copy">Mock dữ liệu user tương ứng `/api/users/me`.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>Họ tên</span><strong>{user.name}</strong></div>
            <div className="data-row"><span>Email</span><strong>{user.email}</strong></div>
            <div className="data-row"><span>Ngày tham gia</span><strong>{formatDate("2026-06-01")}</strong></div>
            <div className="data-row"><span>Trạng thái</span><strong>Đang hoạt động</strong></div>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Plus size={19} /> Đăng ký xe mới</h2>
              <p className="section-copy">Form này sẽ gọi POST `/api/vehicles` ở bước Redux Saga.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <Input value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} placeholder="VD: 59S1-123.45" />
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Hãng xe" required>
              <Input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Honda, Mazda..." />
            </FormField>
            <Button type="submit" variant="primary" icon={Save}>Gửi hồ sơ chờ duyệt</Button>
          </form>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Danh sách phương tiện</h2>
            <p className="section-copy">Admin sẽ duyệt hoặc từ chối ở màn quản trị.</p>
          </div>
        </div>
        <Table columns={columns} data={vehicleRows} />
      </section>
    </div>
  );
};

export default UserProfilePage;
