import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  formatCurrency,
  getStatusLabel,
  getStatusTone,
} from "../../services/mockParkingData";
import { fetchReportsRequest } from "../backend/parking/parkingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { AlertTriangle, BarChart3, Building2, Car, Download, Layers, TrendingUp } from "lucide-react";

const sumAmounts = (rows, predicate = () => true) =>
  rows.filter(predicate).reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);

const revenueSourceLabels = {
  MONTHLY_PASS: "Gói tháng xe máy",
  SLOT_REGISTRATION: "Gói tháng ô tô",
  PARKING_SESSION: "Xe gửi lẻ",
  OTHER: "Khoản khác",
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.byStatus)) return value.byStatus;
  return [];
};

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const { user: authUser } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  const { reports } = useSelector((state) => state.parking);
  const { floors, loading: floorsLoading } = useSelector((state) => state.floors);
  const [showMonthlyRevenueDetails, setShowMonthlyRevenueDetails] = useState(false);

  const buildingId = user?.buildingId;

  useEffect(() => {
    const params = buildingId ? { buildingId } : undefined;
    dispatch(fetchReportsRequest(params));
    dispatch(fetchFloorsRequest({ buildingId, status: "ACTIVE", limit: 100 }));
  }, [buildingId, dispatch]);

  const data = reports.data || {};
  const revenue = data.revenue || {};
  const revenuePayments = asArray(revenue.payments);
  const revenueSessions = asArray(revenue.sessions);
  const revenueSources = asArray(revenue.paymentSources);
  const qrPassReport = useMemo(
    () => data.qrPasses || { byStatus: [], expiringSoon: [] },
    [data.qrPasses]
  );
  const violationReport = data.violations || {};
  const violationRows = asArray(violationReport);
  const carSlotReport = data.carSlots || {};
  const carSlotRows = asArray(carSlotReport);
  const floorRows = Array.isArray(floors) ? floors : [];

  const motorbikeCapacity = floorRows
    .filter((floor) => floor.floorType === "MOTORBIKE")
    .reduce(
      (sum, floor) => ({
        current: sum.current + Number(floor.currentCount || 0),
        capacity: sum.capacity + Number(floor.capacity || 0),
      }),
      { current: 0, capacity: 0 }
    );

  const carSlots = carSlotRows.length > 0
    ? carSlotRows.reduce(
      (sum, row) => {
        const status = row.status || "UNKNOWN";
        return {
          total: sum.total + Number(row.total || row.count || 0),
          occupied: sum.occupied + (status === "OCCUPIED" ? Number(row.total || row.count || 0) : 0),
          available: sum.available + (status === "AVAILABLE" ? Number(row.total || row.count || 0) : 0),
        };
      },
      { total: 0, occupied: 0, available: 0 }
    )
    : {
      total: Number(carSlotReport.total || 0),
      occupied: Number(carSlotReport.occupied || 0),
      available: Number(carSlotReport.available || 0),
    };

  const qrSummary = useMemo(() => {
    const byStatus = asArray(qrPassReport.byStatus || qrPassReport);
    const expiringSoon = asArray(qrPassReport.expiringSoon);

    if (byStatus.length === 0 && !expiringSoon.length) {
      return {
        active: Number(qrPassReport.active || qrPassReport.activeCount || 0),
        expired: Number(qrPassReport.expired || qrPassReport.expiredCount || 0),
        expiring: Number(qrPassReport.expiring || qrPassReport.expiringSoon || 0),
      };
    }

    return {
      active: byStatus.filter((row) => row.status === "ACTIVE").reduce((sum, row) => sum + Number(row.total || 0), 0),
      expired: byStatus.filter((row) => row.status === "EXPIRED").reduce((sum, row) => sum + Number(row.total || 0), 0),
      expiring: expiringSoon.reduce((sum, row) => sum + Number(row.expiringSoon || 0), 0),
    };
  }, [qrPassReport]);

  const violationCount = violationRows.length > 0
    ? violationRows.reduce((sum, row) => sum + Number(row.total || row.count || 0), 0)
    : Number(violationReport.total || 0);
  const violationAmount = violationRows.length > 0
    ? violationRows.reduce((sum, row) => sum + Number(row.penaltyTotal || row.pendingAmount || 0), 0)
    : Number(violationReport.pendingAmount || violationReport.penaltyTotal || 0);
  const totalRevenue = Number(revenue.totalRevenue ?? sumAmounts(revenuePayments, (row) => row.status === "SUCCESS"));
  const monthlyPassRevenue = Number(revenue.monthlyPassRevenue ?? revenueSessions
    .filter((row) => row.pricingType === "MONTHLY_PASS")
    .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0));
  const revenueBreakdown = revenueSources.length > 0
    ? revenueSources
      .filter((item) => item.status === "SUCCESS")
      .map((item) => ({
        key: `${item.sourceType}-${item.status}`,
        label: revenueSourceLabels[item.sourceType] || item.sourceType,
        count: item.paymentCount,
        totalAmount: item.totalAmount,
      }))
    : revenueSessions.map((item) => ({
      key: `${item.vehicleType}-${item.pricingType}`,
      label: `${item.vehicleType} - ${item.pricingType}`,
      count: item.sessionCount,
      totalAmount: item.totalAmount,
    }));

  const monthlyRevenueRows = useMemo(() => {
    const rowsFromPayments = revenueSources
      .filter(
        (item) =>
          item.status === "SUCCESS" &&
          ["MONTHLY_PASS", "SLOT_REGISTRATION"].includes(item.sourceType)
      )
      .map((item) => ({
        id: item.sourceType,
        label: revenueSourceLabels[item.sourceType] || item.sourceType,
        count: item.paymentCount,
        totalAmount: item.totalAmount,
      }));

    if (rowsFromPayments.length > 0) return rowsFromPayments;

    return revenueSessions
      .filter((item) => item.pricingType === "MONTHLY_PASS")
      .map((item) => ({
        id: `${item.vehicleType}-${item.pricingType}`,
        label: item.vehicleType === "CAR" ? "Gói tháng ô tô" : "Gói tháng xe máy",
        count: item.sessionCount,
        totalAmount: item.totalAmount,
      }));
  }, [revenueSessions, revenueSources]);

  const monthlyRevenueColumns = [
    { header: "Nguồn thu", key: "label" },
    { header: "Số khoản", key: "count", render: (row) => row.count || 0 },
    { header: "Tổng tiền", key: "totalAmount", render: (row) => formatCurrency(row.totalAmount || 0) },
  ];

  const floorColumns = [
    { header: "Tầng", key: "name" },
    { header: "Loại", key: "floorType", render: (row) => (row.floorType === "CAR" ? "Ô tô theo ô đỗ" : "Xe máy theo sức chứa") },
    { header: "Sức chứa / Ô đỗ", key: "capacity", render: (row) => (row.floorType === "CAR" ? `${row.slotCount || row.slotsCount || 0} ô` : `${row.currentCount}/${row.capacity}`) },
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
          <div className="page-eyebrow"><Building2 size={16} /> Quản lý bãi xe</div>
          <h1 className="page-title">{user?.buildingName || "Tòa nhà"} đang vận hành</h1>
          <p className="page-subtitle">
            Trang này lấy báo cáo vận hành trực tiếp từ hệ thống: sức chứa, ô đỗ, doanh thu, mã QR và vi phạm.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Doanh thu ghi nhận</span>
          <span className="page-hero-number">{Math.round(totalRevenue / 1000000)}M</span>
          <span className="page-hero-label">đồng</span>
        </div>
      </section>

      <StatusBanner errors={reports.error} />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><TrendingUp size={22} /></div>
          <div className="metric-label">Doanh thu đã thanh toán</div>
          <div className="metric-value">{formatCurrency(totalRevenue)}</div>
          <div className="metric-note">Tổng các khoản thành công</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Layers size={22} /></div>
          <div className="metric-label">Xe máy đang gửi</div>
          <div className="metric-value">{motorbikeCapacity.current}/{motorbikeCapacity.capacity || 0}</div>
          <div className="metric-note">{motorbikeCapacity.capacity ? Math.round((motorbikeCapacity.current / motorbikeCapacity.capacity) * 100) : 0}% sức chứa</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Ô tô đang dùng ô đỗ</div>
          <div className="metric-value">{carSlots.occupied}/{carSlots.total}</div>
          <div className="metric-note">{carSlots.available} ô còn trống</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm ghi nhận</div>
          <div className="metric-value">{violationCount}</div>
          <div className="metric-note">{formatCurrency(violationAmount)}</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Cơ cấu doanh thu</h2>
              <p className="section-copy">Tổng hợp theo loại phiên đã hoàn tất.</p>
            </div>
            <Button variant="outline" icon={Download}>Xuất báo cáo</Button>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {revenueBreakdown.map((item) => (
              <div className="soft-panel" key={item.key}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{item.label}</strong>
                  <span>{formatCurrency(item.totalAmount || 0)}</span>
                </div>
                <p className="section-copy">{item.count || 0} khoản đã hoàn tất</p>
              </div>
            ))}
            {revenueBreakdown.length === 0 && <div className="soft-panel">Chưa có dữ liệu doanh thu.</div>}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrPassIcon /> Mã QR tháng</h2>
              <p className="section-copy">Theo dõi QR còn hạn, sắp hết hạn và đã hết hạn.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>QR còn hiệu lực</span><strong>{qrSummary.active}</strong></div>
            <div className="data-row"><span>Sắp hết hạn</span><strong>{qrSummary.expiring}</strong></div>
            <div className="data-row"><span>Đã hết hạn</span><strong>{qrSummary.expired}</strong></div>
            <button
              type="button"
              className="data-row data-row-button"
              onClick={() => setShowMonthlyRevenueDetails((current) => !current)}
            >
              <span>Doanh thu gói tháng</span>
              <strong>{formatCurrency(monthlyPassRevenue)}</strong>
            </button>
          </div>
          {showMonthlyRevenueDetails && (
            <div className="soft-panel">
              <strong>Chi tiết doanh thu gói tháng</strong>
              <p className="section-copy">
                Bao gồm gói tháng xe máy và đăng ký ô đỗ ô tô đã thanh toán thành công.
              </p>
              <Table
                columns={monthlyRevenueColumns}
                data={monthlyRevenueRows}
                emptyMessage="Chưa có doanh thu gói tháng đã thanh toán."
                pageSize={5}
              />
            </div>
          )}
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Tầng gửi xe</h2>
            <p className="section-copy">Cấu hình tầng và sức chứa đang lấy từ cơ sở dữ liệu.</p>
          </div>
        </div>
        <Table columns={floorColumns} data={floorRows} loading={floorsLoading} />
      </section>
    </div>
  );
};

const QrPassIcon = () => <BarChart3 size={19} />;

export default ManagerDashboard;
