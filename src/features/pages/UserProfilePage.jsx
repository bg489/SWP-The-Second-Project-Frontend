import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Car, Plus, Save, User } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import { updateProfileRequest } from "../backend/auth/authSlice";
import {
  clearParkingNotice,
  createVehicleRequest,
  fetchMyVehiclesRequest,
} from "../backend/parking/parkingSlice";
import { formatDate, getStatusLabel, getStatusTone, getVehicleTypeLabel } from "../../services/mockParkingData";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const { error: authError, frontendRole, loading: authLoading, user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const { vehicles, notice } = useSelector((state) => state.parking);
  const isResident = (frontendRole || user?.role || "USER") === "USER";
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || user?.avatar || "",
  });
  const displayAvatar = profileForm.avatarUrl || user?.avatarUrl || user?.avatar || "";

  const [form, setForm] = useState({
    plateNumber: "",
    vehicleType: "MOTORBIKE",
    brand: "",
    color: "",
  });

  useEffect(() => {
    if (isResident) {
      dispatch(fetchMyVehiclesRequest());
    }
  }, [dispatch, isResident]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileForm({
        name: user?.name || "",
        phone: user?.phone || "",
        avatarUrl: user?.avatarUrl || user?.avatar || "",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user?.avatar, user?.avatarUrl, user?.name, user?.phone]);

  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.plateNumber.trim() || !form.brand.trim()) return;

    dispatch(
      createVehicleRequest({
        plateNumber: form.plateNumber.trim().toUpperCase(),
        vehicleType: form.vehicleType,
        brand: form.brand.trim(),
        color: form.color.trim() || "Chưa cập nhật",
        buildingId: user?.buildingId || undefined,
      })
    );

    setForm({
      plateNumber: "",
      vehicleType: "MOTORBIKE",
      brand: "",
      color: "",
    });
  };

  const updateProfileForm = (field, value) => {
    const nextValue = field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setProfileForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    dispatch(
      updateProfileRequest({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || undefined,
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
      })
    );
  };

  const columns = [
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Hãng xe", key: "brand" },
    { header: "Màu xe", key: "color", render: (row) => row.color || "-" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><User size={16} /> Hồ sơ cá nhân</div>
          <h1 className="page-title">Thông tin tài khoản và ảnh đại diện</h1>
          <p className="page-subtitle">
            Cập nhật tên, số điện thoại và link ảnh đại diện. Email và vai trò được giữ nguyên theo tài khoản đã duyệt.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tài khoản</span>
          <span className="page-hero-number">#{user.id}</span>
          <span className="page-hero-label">{user.email}</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={[vehicles.error, authError]} />

      <div className={isResident ? "two-column-grid" : "dashboard-grid"}>
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><User size={19} /> Hồ sơ cá nhân</h2>
              <p className="section-copy">Ảnh được lưu bằng đường dẫn ngắn để hệ thống tải nhanh và không làm đầy cơ sở dữ liệu.</p>
            </div>
          </div>
          <form className="data-list" onSubmit={handleProfileSubmit}>
            <div className="profile-avatar-panel">
              {displayAvatar ? (
                <img src={displayAvatar} alt={user.name} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-large profile-avatar-placeholder">
                  {String(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <strong>Ảnh đại diện</strong>
                <p className="section-copy">Dán link ảnh từ nơi lưu ảnh của bạn. Ảnh sẽ được cắt vừa khung tròn khi hiển thị.</p>
              </div>
            </div>

            <FormField label="Họ tên" required>
              <Input
                value={profileForm.name}
                onChange={(event) => updateProfileForm("name", event.target.value)}
                placeholder="Nhập họ tên"
              />
            </FormField>
            <FormField label="Số điện thoại">
              <Input
                value={profileForm.phone}
                onChange={(event) => updateProfileForm("phone", event.target.value)}
                placeholder="Ví dụ: 0901234567"
              />
            </FormField>
            <FormField label="Link ảnh đại diện">
              <Input
                value={profileForm.avatarUrl}
                onChange={(event) => updateProfileForm("avatarUrl", event.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <div className="data-row"><span>Email</span><strong>{user.email}</strong></div>
            <div className="data-row"><span>Tòa nhà</span><strong>{user.buildingName || "Chưa có tòa nhà"}</strong></div>
            <div className="data-row"><span>Ngày tham gia</span><strong>{formatDate(user.createdAt || "2026-06-01")}</strong></div>
            <Button type="submit" variant="primary" icon={Save} loading={authLoading}>
              Lưu hồ sơ
            </Button>
          </form>
        </section>

        {isResident && (
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Plus size={19} /> Đăng ký xe mới</h2>
              <p className="section-copy">Hồ sơ xe sẽ chuyển sang trạng thái chờ duyệt.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <Input value={form.plateNumber} onChange={(event) => updateForm("plateNumber", event.target.value)} placeholder="VD: 59S1-123.45" />
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={form.vehicleType}
                onChange={(event) => updateForm("vehicleType", event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Hãng xe" required>
              <Input value={form.brand} onChange={(event) => updateForm("brand", event.target.value)} placeholder="Honda, Mazda..." />
            </FormField>
            <FormField label="Màu xe">
              <Input value={form.color} onChange={(event) => updateForm("color", event.target.value)} placeholder="Trắng, đen, bạc..." />
            </FormField>
            <Button type="submit" variant="primary" icon={Save} loading={vehicles.saving}>
              Gửi hồ sơ chờ duyệt
            </Button>
          </form>
        </section>
        )}
      </div>

      {isResident && (
      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Danh sách phương tiện</h2>
            <p className="section-copy">Xe đã duyệt mới được mua gói tháng và dùng mã QR hợp lệ.</p>
          </div>
        </div>
        <Table columns={columns} data={vehicles.mine} loading={vehicles.loading} />
      </section>
      )}
    </div>
  );
};

export default UserProfilePage;
