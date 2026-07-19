import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  Car,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Layers3,
  QrCode,
  RefreshCcw,
  Users,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Table from "../../components/Table/Table";
import { formatCurrency } from "../../services/mockParkingData";
import { fetchReportsRequest } from "../backend/parking/parkingSlice";
import "./ManagerDashboard.css";

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ROWS = Object.freeze([]);
const asRows = (value) => (Array.isArray(value) ? value : EMPTY_ROWS);
const toNumber = (value) => Number(value || 0);
const formatNumber = (value) => toNumber(value).toLocaleString("vi-VN");
const formatPercentage = (value) => `${toNumber(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reports } = useSelector((state) => state.parking);

  useEffect(() => {
    dispatch(fetchReportsRequest());
  }, [dispatch]);

  const reportData = reports.data || EMPTY_OBJECT;
  const report = reportData.full || reportData;
  const revenue = report.revenue || EMPTY_OBJECT;
  const operations = report.operations || EMPTY_OBJECT;
  const totals = operations.totals || EMPTY_OBJECT;
  const customerMix = operations.customerMix || EMPTY_OBJECT;
  const monthlyPasses = report.monthlyPasses || EMPTY_OBJECT;
  const qrPasses = report.qrPasses || EMPTY_OBJECT;
  const violations = report.violations || EMPTY_OBJECT;
  const revenueRows = asRows(revenue.breakdown);
  const operationRows = asRows(operations.byBuilding);
  const capacityRows = asRows(report.capacity);
  const violationRows = asRows(violations.rows);
  const buildingCount = toNumber(report.scope?.buildingCount || capacityRows.length);
  const totalRevenue = toNumber(revenue.totalRevenue || revenue.paidRevenue);
  const maxRevenue = Math.max(...revenueRows.map((row) => toNumber(row.amount)), 1);
  const registeredMix = customerMix.registeredUser || {};
  const walkInMix = customerMix.walkInGuest || {};

  const capacitySummary = useMemo(
    () => capacityRows.reduce(
      (summary, row) => ({
        carMonthlySlots: summary.carMonthlySlots + toNumber(row.carMonthlySlots),
        carOccupiedSlots: summary.carOccupiedSlots + toNumber(row.carOccupiedSlots),
        carTotalSlots: summary.carTotalSlots + toNumber(row.carTotalSlots),
        motorbikeCapacity: summary.motorbikeCapacity + toNumber(row.motorbikeCapacity),
        motorbikeCurrent: summary.motorbikeCurrent + toNumber(row.motorbikeCurrent),
        motorbikeMonthlyPasses: summary.motorbikeMonthlyPasses + toNumber(row.motorbikeMonthlyPasses),
        motorbikeRemaining: summary.motorbikeRemaining + toNumber(row.effectiveMotorbikeRemaining),
      }),
      {
        carMonthlySlots: 0,
        carOccupiedSlots: 0,
        carTotalSlots: 0,
        motorbikeCapacity: 0,
        motorbikeCurrent: 0,
        motorbikeMonthlyPasses: 0,
        motorbikeRemaining: 0,
      }
    ),
    [capacityRows]
  );

  const qrSummary = useMemo(() => {
    const statusRows = asRows(qrPasses.byStatus);
    const expiringRows = asRows(qrPasses.expiringSoon);

    return {
      active: statusRows
        .filter((row) => row.status === "ACTIVE")
        .reduce((sum, row) => sum + toNumber(row.total), 0),
      expired: statusRows
        .filter((row) => row.status === "EXPIRED")
        .reduce((sum, row) => sum + toNumber(row.total), 0),
      expiringSoon: expiringRows.reduce((sum, row) => sum + toNumber(row.expiringSoon), 0),
    };
  }, [qrPasses]);

  const violationSummary = useMemo(
    () => ({
      count: violationRows.reduce((sum, row) => sum + toNumber(row.violationCount), 0),
      paidAmount: toNumber(
        violations.paidPenalty ||
        violationRows.reduce((sum, row) => sum + toNumber(row.paidPenalty), 0)
      ),
    }),
    [violationRows, violations.paidPenalty]
  );

  const buildingRows = useMemo(() => {
    const operationsByBuilding = new Map(
      operationRows.map((row) => [String(row.buildingId), row])
    );

    return capacityRows.map((capacity) => ({
      ...capacity,
      ...(operationsByBuilding.get(String(capacity.buildingId)) || {}),
      buildingId: capacity.buildingId,
      buildingName: capacity.buildingName,
    }));
  }, [capacityRows, operationRows]);

  const buildingColumns = [
    { header: "Tòa nhà", key: "buildingName", minWidth: 180 },
    {
      header: "Xe vào / ra",
      key: "traffic",
      minWidth: 115,
      render: (row) => `${formatNumber(row.entryCount)} / ${formatNumber(row.exitCount)}`,
    },
    { header: "Đang gửi", key: "activeSessions" },
    {
      header: "Xe máy đang gửi / sức chứa",
      key: "motorbikeCapacity",
      minWidth: 175,
      render: (row) => `${formatNumber(row.motorbikeCurrent)} / ${formatNumber(row.motorbikeCapacity)}`,
    },
    { header: "Xe máy còn nhận", key: "effectiveMotorbikeRemaining", minWidth: 130 },
    {
      header: "Ô tô đang đỗ / tổng ô",
      key: "carSlots",
      minWidth: 150,
      render: (row) => `${formatNumber(row.carOccupiedSlots)} / ${formatNumber(row.carTotalSlots)}`,
    },
    {
      header: "Gói tháng xe máy / ô tô",
      key: "monthlyCapacity",
      minWidth: 170,
      render: (row) => `${formatNumber(row.motorbikeMonthlyPasses)} / ${formatNumber(row.carMonthlySlots)}`,
    },
    {
      header: "Người dùng / khách",
      key: "customerMix",
      minWidth: 160,
      render: (row) => `${formatPercentage(row.registeredUserPercentage)} / ${formatPercentage(row.walkInGuestPercentage)}`,
    },
  ];

  const refresh = () => dispatch(fetchReportsRequest());
  const generatedAt = report.generatedAt
    ? new Date(report.generatedAt).toLocaleString("vi-VN")
    : "Chưa có";

  return (
    <div className="parking-page manager-dashboard-page">
      <section className="page-hero manager-dashboard-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Building2 size={16} /> Quản lý toàn hệ thống</div>
          <h1 className="page-title">{buildingCount} tòa nhà đang được quản lý</h1>
          <p className="page-subtitle">
            Tổng quan trực tiếp về doanh thu, lượt xe, sức chứa, gói tháng, QR và vi phạm của toàn bộ cơ sở.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Doanh thu đã thu</span>
          <span className="page-hero-number manager-dashboard-revenue">{formatCurrency(totalRevenue)}</span>
          <span className="page-hero-label">toàn hệ thống</span>
        </div>
      </section>

      <StatusBanner errors={reports.error} />

      <section className="manager-dashboard-toolbar" aria-label="Thao tác tổng quan">
        <div>
          <strong>Dữ liệu toàn thời gian</strong>
          <span>Cập nhật lúc {generatedAt}</span>
        </div>
        <div className="action-row">
          <Button variant="outline" icon={RefreshCcw} loading={reports.loading} onClick={refresh}>
            Làm mới
          </Button>
          <Button variant="primary" icon={FileText} onClick={() => navigate("/manager/reports")}>
            Xem và xuất báo cáo
          </Button>
        </div>
      </section>

      <div className="dashboard-grid manager-dashboard-metrics">
        <div className="card metric-card">
          <div className="metric-icon"><CircleDollarSign size={22} /></div>
          <div className="metric-label">Doanh thu đã thu</div>
          <div className="metric-value">{formatCurrency(totalRevenue)}</div>
          <div className="metric-note">Chỉ tính giao dịch thành công</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><ArrowDownToLine size={22} /></div>
          <div className="metric-label">Xe vào</div>
          <div className="metric-value">{formatNumber(totals.entryCount)}</div>
          <div className="metric-note">Xe máy {formatNumber(totals.motorbikeEntries)} • Ô tô {formatNumber(totals.carEntries)}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><ArrowUpFromLine size={22} /></div>
          <div className="metric-label">Xe ra</div>
          <div className="metric-value">{formatNumber(totals.exitCount)}</div>
          <div className="metric-note">Còn {formatNumber(totals.activeSessions)} xe đang gửi</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Layers3 size={22} /></div>
          <div className="metric-label">Xe máy còn nhận</div>
          <div className="metric-value">{formatNumber(capacitySummary.motorbikeRemaining)}</div>
          <div className="metric-note">Đang gửi {formatNumber(capacitySummary.motorbikeCurrent)} / {formatNumber(capacitySummary.motorbikeCapacity)}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Ô tô đang đỗ</div>
          <div className="metric-value">{formatNumber(capacitySummary.carOccupiedSlots)}/{formatNumber(capacitySummary.carTotalSlots)}</div>
          <div className="metric-note">{formatNumber(capacitySummary.carMonthlySlots)} ô đã đăng ký tháng</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><FileCheck2 size={22} /></div>
          <div className="metric-label">Gói tháng còn hiệu lực</div>
          <div className="metric-value">{formatNumber(monthlyPasses.activeCount)}</div>
          <div className="metric-note">{formatNumber(monthlyPasses.paidCount)} gói đã thanh toán</div>
        </div>
      </div>

      <div className="two-column-grid manager-dashboard-overview">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Cơ cấu doanh thu</h2>
              <p className="section-copy">Tách rõ gói tháng, vé lượt, vé giờ, phí vi phạm và các khoản khác.</p>
            </div>
          </div>
          <div className="manager-revenue-list">
            {revenueRows.map((row) => {
              const amount = toNumber(row.amount);
              const width = amount > 0 ? Math.max(2, (amount / maxRevenue) * 100) : 0;

              return (
                <div className="manager-revenue-item" key={row.key || row.label}>
                  <div className="manager-revenue-heading">
                    <span>{row.label}</span>
                    <strong>{formatCurrency(amount)}</strong>
                  </div>
                  <div className="manager-revenue-track" aria-hidden="true">
                    <div style={{ width: `${width}%` }} />
                  </div>
                  <small>{formatNumber(row.completedCount)} khoản đã thu</small>
                </div>
              );
            })}
            {!reports.loading && revenueRows.length === 0 && (
              <div className="manager-dashboard-empty">Chưa có doanh thu đã thanh toán.</div>
            )}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Users size={19} /> Nhóm người gửi xe</h2>
              <p className="section-copy">Tỷ lệ được tính theo tổng số lượt xe vào toàn hệ thống.</p>
            </div>
          </div>
          <div className="manager-customer-list">
            <div className="manager-customer-item registered">
              <div className="manager-customer-heading">
                <span>Người dùng hệ thống</span>
                <strong>{formatPercentage(registeredMix.percentage)}</strong>
              </div>
              <div className="manager-customer-track"><div style={{ width: `${Math.min(100, toNumber(registeredMix.percentage))}%` }} /></div>
              <small>{formatNumber(registeredMix.count)} lượt xe vào</small>
            </div>
            <div className="manager-customer-item walk-in">
              <div className="manager-customer-heading">
                <span>Khách vãng lai</span>
                <strong>{formatPercentage(walkInMix.percentage)}</strong>
              </div>
              <div className="manager-customer-track"><div style={{ width: `${Math.min(100, toNumber(walkInMix.percentage))}%` }} /></div>
              <small>{formatNumber(walkInMix.count)} lượt xe vào</small>
            </div>
          </div>
        </section>
      </div>

      <div className="two-column-grid manager-dashboard-live-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Gói tháng và mã QR</h2>
              <p className="section-copy">Theo dõi hiệu lực của thẻ dùng ra vào tại mọi tòa nhà.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>QR còn hiệu lực</span><strong>{formatNumber(qrSummary.active)}</strong></div>
            <div className="data-row"><span>QR sắp hết hạn trong 7 ngày</span><strong>{formatNumber(qrSummary.expiringSoon)}</strong></div>
            <div className="data-row"><span>QR đã hết hạn</span><strong>{formatNumber(qrSummary.expired)}</strong></div>
            <div className="data-row"><span>Gói đang chờ thanh toán</span><strong>{formatNumber(monthlyPasses.pendingCount)}</strong></div>
            <div className="data-row"><span>Doanh thu gói tháng</span><strong>{formatCurrency(monthlyPasses.totalPaid)}</strong></div>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><AlertTriangle size={19} /> Vi phạm đã ghi nhận</h2>
              <p className="section-copy">Các vi phạm đã thanh toán và được đưa vào doanh thu hệ thống.</p>
            </div>
          </div>
          <div className="manager-violation-summary">
            <div>
              <span>Số lượt vi phạm</span>
              <strong>{formatNumber(violationSummary.count)}</strong>
            </div>
            <div>
              <span>Phí đã thu</span>
              <strong>{formatCurrency(violationSummary.paidAmount)}</strong>
            </div>
          </div>
          <p className="manager-dashboard-note">
            Chi tiết tên lỗi, người liên quan và xe vi phạm được trình bày đầy đủ trong trang báo cáo.
          </p>
        </section>
      </div>

      <section className="card section-card manager-building-section">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Tình trạng từng tòa nhà</h2>
            <p className="section-copy">So sánh lượt xe, sức chứa thực tế, gói tháng và nhóm khách tại toàn bộ cơ sở.</p>
          </div>
        </div>
        <Table
          columns={buildingColumns}
          data={buildingRows}
          loading={reports.loading}
          emptyMessage="Chưa có tòa nhà để tổng hợp."
          pageSize={10}
        />
      </section>
    </div>
  );
};

export default ManagerDashboard;
