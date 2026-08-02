/**
 * @fileoverview Xây dựng màn hình UserDashboard, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
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
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import {
  fetchMyMonthlyPassesRequest,
  fetchMyNotificationsRequest,
  fetchMyQrPassesRequest,
  fetchMySlotRegistrationsRequest,
  fetchMyVehiclesRequest,
  fetchPackagePlansRequest,
} from "../backend/parking/parkingSlice";
import { Bell, Building2, Calendar, Car, Clock, CreditCard, Plus, QrCode, ShieldCheck } from "lucide-react";

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizePlateQrValue` (normalize plate qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizePlateQrValue
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizePlateQrValue = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s.-]/g, "");

/**
 * Lấy nghiệp vụ `getPassQrValue` (get pass qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassQrValue
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassQrValue = (pass) =>
  normalizePlateQrValue(pass?.plateNumber || pass?.vehiclePlateNumber) || pass?.qrCode || pass?.code || "";
/**
 * Lấy nghiệp vụ `getPassName` (get pass name). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassName
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassName = (pass) => pass?.packagePlanName || pass?.packageName || pass?.planName || "Gói tháng";
/**
 * Lấy nghiệp vụ `getPassTime` (get pass time). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassTime
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassTime = (pass) =>
  new Date(pass?.updatedAt || pass?.createdAt || pass?.startDate || pass?.validFrom || 0).getTime();

/**
 * Thực hiện nghiệp vụ `UserDashboard` (user dashboard). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function UserDashboard
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: mockUser } = useMockAuth();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { vehicles, monthlyPasses, notifications, packagePlans, qrPasses, slotRegistrations } = useSelector((state) => state.parking);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchMyVehiclesRequest());
    dispatch(fetchMyMonthlyPassesRequest());
    dispatch(fetchMyQrPassesRequest());
    dispatch(fetchMySlotRegistrationsRequest());
    dispatch(fetchMyNotificationsRequest());
    dispatch(fetchPackagePlansRequest({ status: "ACTIVE", buildingId: user?.buildingId }));
  }, [dispatch, user?.buildingId]);

  const myVehicles = vehicles.mine;
  const myPasses = monthlyPasses.mine;
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const latestQrPass = useMemo(() => {
    const source = qrPasses.mine.length > 0 ? qrPasses.mine : myPasses;

    return [...source]
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      .filter((pass) => getPassQrValue(pass))
      /* Callback nội bộ của lời gọi `sort`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      .sort((a, b) => getPassTime(b) - getPassTime(a))[0] || null;
  }, [myPasses, qrPasses.mine]);

  const pendingPayment = [...slotRegistrations.mine, ...myPasses].find(
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (item) => item.status === "PENDING_PAYMENT"
  );

  const columns = [
    { header: "Biển số", key: "plateNumber" },
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
    { header: "Hãng / màu", key: "brand", render: (row) => `${row.brand || "-"} - ${row.color || "-"}` },
    {
      header: "Duyệt xe",
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
      header: "Gói tháng",
      key: "pass",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => {
        const activePass = myPasses.find(
          /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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
          notifications.error,
        ]}
      />

      <section className="card soft-panel">
        <div className="data-row">
          <span><Building2 size={16} /> Tòa nhà hiện tại</span>
          <strong>{user?.buildingName || "Chưa có tòa nhà"}</strong>
        </div>
        <div className="data-row">
          <span>Địa chỉ</span>
          <strong>{user?.buildingAddress || "Chưa có địa chỉ"}</strong>
        </div>
      </section>

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
            <h2 className="section-title"><Bell size={19} /> Thông báo của tôi</h2>
            <p className="section-copy">Các nhắc nhở cần xử lý, bao gồm yêu cầu dời xe khi đậu sai ô.</p>
          </div>
        </div>
        <div className="data-list">
          {notifications.mine.slice(0, 5).map((item) => (
            <div className="soft-panel" key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="section-copy">{item.message}</p>
                  <span className="metric-note">{formatDateTime(item.createdAt)}</span>
                </div>
                {item.evidenceUrl && <img className="evidence-thumb" src={item.evidenceUrl} alt="Bằng chứng" />}
              </div>
            </div>
          ))}
          {!notifications.loading && notifications.mine.length === 0 && (
            <div className="soft-panel">Bạn chưa có thông báo mới.</div>
          )}
        </div>
      </section>

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
