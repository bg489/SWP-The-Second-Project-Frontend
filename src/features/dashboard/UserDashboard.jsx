import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import QrCodeImage from "../../components/QrCode/QrCodeImage";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import {
  fetchMyMonthlyPassesRequest,
  fetchMyQrPassesRequest,
  fetchMySlotRegistrationsRequest,
  fetchMyVehiclesRequest,
  fetchPackagePlansRequest,
} from "../backend/parking/parkingSlice";
import { Calendar, Car, Clock, CreditCard, Plus, QrCode, ShieldCheck } from "lucide-react";

const getPassQrValue = (pass) => pass?.qrCode || pass?.code || "";
const getPassName = (pass) => pass?.packagePlanName || pass?.packageName || pass?.planName || "Gói tháng";
const getPassTime = (pass) =>
  new Date(pass?.updatedAt || pass?.createdAt || pass?.startDate || pass?.validFrom || 0).getTime();

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const { vehicles, monthlyPasses, packagePlans, qrPasses, slotRegistrations } = useSelector((state) => state.parking);

  useEffect(() => {
    dispatch(fetchMyVehiclesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
    dispatch(fetchPackagePlansRequest({ status: "ACTIVE" }));
  }, [dispatch]);

  const myVehicles = vehicles.mine;
  const myPasses = monthlyPasses.mine;
  const latestQrPass = useMemo(() => {
    const source = qrPasses.mine.length > 0 ? qrPasses.mine : myPasses;

    return [...source]
      .filter((pass) => getPassQrValue(pass))
      .sort((a, b) => getPassTime(b) - getPassTime(a))[0] || null;
  }, [myPasses, qrPasses.mine]);

  const pendingPayment = [...slotRegistrations.mine, ...myPasses].find(
    (item) => item.status === "PENDING_PAYMENT"
  );

  const columns = [
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Hãng / màu", key: "brand", render: (row) => `${row.brand || "-"} - ${row.color || "-"}` },
    {
      header: "Duyệt xe",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Gói tháng",
      key: "pass",
      render: (row) => {
        const activePass = myPasses.find(
          (pass) => Number(pass.vehicleId) === Number(row.id) && pass.status === "ACTIVE"
        );

        return activePass
          ? `${getPassName(activePass)} đến ${formatDate(activePass.endDate || activePass.validTo)}`
          : "Chưa có";
      },
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <ShieldCheck size={16} /> Cư dân
          </div>
          <h1 className="page-title">Xin chào, {user?.name || "cư dân"}. Mã QR của bạn đã sẵn sàng.</h1>
          <p className="page-subtitle">
            Quản lý xe đã duyệt, mua gói tháng theo từng phương tiện và xem nhanh mã QR mới nhất.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">QR gần nhất</span>
          <span className="page-hero-number">{latestQrPass ? "1" : "0"}</span>
          <span className="page-hero-label">
            {latestQrPass ? latestQrPass.plateNumber || latestQrPass.vehiclePlateNumber : "Chưa có QR hợp lệ"}
          </span>
        </div>
      </section>

      <StatusBanner
        errors={[
          vehicles.error,
          monthlyPasses.error,
          qrPasses.error,
          slotRegistrations.error,
          packagePlans.error,
        ]}
      />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Xe của tôi</div>
          <div className="metric-value">{myVehicles.length}</div>
          <div className="metric-note">
            {myVehicles.filter((vehicle) => ["APPROVED", "ACTIVE"].includes(vehicle.status)).length} xe đã duyệt
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">QR gói tháng</div>
          <div className="metric-value">{qrPasses.mine.filter((pass) => (pass.status || "ACTIVE") === "ACTIVE").length}</div>
          <div className="metric-note">Mỗi QR chỉ hợp lệ cho đúng xe</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CreditCard size={22} /></div>
          <div className="metric-label">Chờ thanh toán</div>
          <div className="metric-value">{pendingPayment ? formatCurrency(pendingPayment.amount || pendingPayment.price || 0) : "0đ"}</div>
          <div className="metric-note">
            {pendingPayment ? pendingPayment.plateNumber || pendingPayment.vehiclePlateNumber || "Yêu cầu mới" : "Không có đăng ký mới"}
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Clock size={19} /> Mã QR gần nhất</h2>
              <p className="section-copy">Dashboard chỉ hiển thị mã QR mới nhất đã đăng ký thành công.</p>
            </div>
            <Button variant="primary" icon={QrCode} onClick={() => navigate("/user/qr-pass")}>
              Xem QR
            </Button>
          </div>

          {latestQrPass ? (
            <div className="soft-panel">
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div className="qr-box" style={{ width: 128, height: 128 }}>
                  <QrCodeImage
                    value={getPassQrValue(latestQrPass)}
                    size={112}
                    title={`QR ${latestQrPass.plateNumber || latestQrPass.vehiclePlateNumber || ""}`}
                  />
                </div>
                <div className="data-list" style={{ flex: 1, minWidth: 220 }}>
                  <div className="data-row">
                    <span>Xe đăng ký</span>
                    <strong>{latestQrPass.plateNumber || latestQrPass.vehiclePlateNumber}</strong>
                  </div>
                  <div className="data-row">
                    <span>Loại xe</span>
                    <strong>{getVehicleTypeLabel(latestQrPass.vehicleType)}</strong>
                  </div>
                  <div className="data-row">
                    <span>Gói</span>
                    <strong>{getPassName(latestQrPass)}</strong>
                  </div>
                  <div className="data-row">
                    <span>Hiệu lực đến</span>
                    <strong>{formatDate(latestQrPass.endDate || latestQrPass.validTo)}</strong>
                  </div>
                  <div className="data-row">
                    <span>Trạng thái</span>
                    <strong>{getStatusLabel(latestQrPass.status || "ACTIVE")}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="soft-panel">
              Chưa có mã QR gói tháng. Bạn có thể mua gói ở trang QR & gói tháng.
            </div>
          )}
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Calendar size={19} /> Gói tháng có thể mua</h2>
              <p className="section-copy">Cư dân chọn xe đã duyệt rồi thanh toán qua VNPay.</p>
            </div>
          </div>
          <div className="data-list">
            {packagePlans.items.map((pkg) => (
              <div className="soft-panel" key={pkg.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <strong>{pkg.name}</strong>
                    <div className="metric-note">
                      {getVehicleTypeLabel(pkg.vehicleType)} - {pkg.durationDays || pkg.duration || 30} ngày
                    </div>
                  </div>
                  <strong>{formatCurrency(pkg.price)}</strong>
                </div>
              </div>
            ))}
            {packagePlans.items.length === 0 && <div className="soft-panel">Chưa có gói tháng đang mở bán.</div>}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Phương tiện của tôi</h2>
            <p className="section-copy">
              Tạo xe mới ở trang hồ sơ, quản trị viên duyệt trước khi QR/gói tháng hợp lệ.
            </p>
          </div>
          <Button variant="secondary" icon={Plus} onClick={() => navigate("/user/profile")}>
            Đăng ký xe
          </Button>
        </div>
        <Table columns={columns} data={myVehicles} loading={vehicles.loading} />
      </section>
    </div>
  );
};

export default UserDashboard;
