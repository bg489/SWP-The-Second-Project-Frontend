import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, BarChart3, Car, Download, FileText, Layers, QrCode, RefreshCcw, TrendingUp } from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import { clearParkingNotice, fetchReportsRequest, fetchViolationsRequest } from "../backend/parking/parkingSlice";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusTone, revenueSeries } from "../../services/mockParkingData";

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { reports, violations } = useSelector((state) => state.parking);

  const [filters, setFilters] = useState({
    from: "2026-06-01",
    to: "2026-06-30",
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchReportsRequest(filters));
    dispatch(fetchViolationsRequest());
  }, [dispatch, filters]);

  const data = reports.data || {};
  const revenue = data.revenue || {};
  const traffic = data.traffic || {};
  const motorbikeCapacity = data.motorbikeCapacity || {};
  const carSlots = data.carSlots || {};
  const qrPasses = data.qrPasses || {};
  const violationSummary = data.violations || {};

  const currentMotorbike = Number(motorbikeCapacity.current || motorbikeCapacity.currentCount || 0);
  const totalMotorbike = Number(motorbikeCapacity.total || motorbikeCapacity.capacity || 1);
  const occupiedSlots = Number(carSlots.occupied || carSlots.occupiedSlots || 0);
  const totalSlots = Number(carSlots.total || carSlots.totalSlots || 1);

  const violationColumns = [
    { header: "Mã", key: "id" },
    { header: "Biển số", key: "plateNumber" },
    { header: "Nội dung", key: "type", render: (row) => row.type || row.violationType },
    { header: "Ghi nhận", key: "detectedAt", render: (row) => formatDateTime(row.detectedAt || row.createdAt) },
    { header: "Phí", key: "fine", render: (row) => formatCurrency(row.penaltyFee || row.fine || 0) },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
  ];

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchReportsRequest(filters));
    dispatch(fetchViolationsRequest());
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 900);
  };

  const trafficTotal = Number(traffic.trafficIn || traffic.inCount || 0) + Number(traffic.trafficOut || traffic.outCount || 0);
  const activeQr = Number(qrPasses.active || qrPasses.activeQrPasses || 0);
  const expiringQr = Number(qrPasses.expiring || qrPasses.expiringQrPasses || 0);

  const barMax = useMemo(() => {
    return Math.max(...revenueSeries.map((item) => item.value), 1);
  }, []);

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><FileText size={16} /> Báo cáo</div>
          <h1 className="page-title">Doanh thu, lượt xe, sức chứa, mã QR và vi phạm</h1>
          <p className="page-subtitle">
            Quản lý theo dõi tình hình vận hành tòa giữ xe trong một khoảng thời gian rõ ràng.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Doanh thu tháng</span>
          <span className="page-hero-number">{Math.round(Number(revenue.revenueMonth || revenue.totalRevenue || 0) / 1000000)}M</span>
          <span className="page-hero-label">đồng</span>
        </div>
      </section>

      {reports.error && (
        <section className="card soft-panel">
          <p style={{ color: "var(--danger)" }}>{reports.error}</p>
        </section>
      )}

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><BarChart3 size={19} /> Khoảng thời gian</h2>
            <p className="section-copy">Chọn ngày để làm mới các chỉ số vận hành.</p>
          </div>
          <div className="action-row">
            <Button variant="outline" icon={RefreshCcw} loading={reports.loading} onClick={refresh}>
              Làm mới
            </Button>
            <Button variant="primary" icon={Download} loading={exporting} onClick={handleExport}>
              {exporting ? "Đang chuẩn bị" : "Xuất báo cáo"}
            </Button>
          </div>
        </div>
        <div className="filter-grid">
          <FormField label="Từ ngày">
            <Input type="date" value={filters.from} onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))} />
          </FormField>
          <FormField label="Đến ngày">
            <Input type="date" value={filters.to} onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))} />
          </FormField>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><TrendingUp size={22} /></div>
          <div className="metric-label">Doanh thu hôm nay</div>
          <div className="metric-value">{formatCurrency(revenue.revenueToday || revenue.todayRevenue || 0)}</div>
          <div className="metric-note">Gồm gửi lẻ, gói tháng và phí vi phạm</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Lượt xe vào/ra</div>
          <div className="metric-value">{traffic.trafficIn || traffic.inCount || 0}/{traffic.trafficOut || traffic.outCount || 0}</div>
          <div className="metric-note">{trafficTotal} lượt trong kỳ</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">Mã QR còn hạn</div>
          <div className="metric-value">{activeQr}</div>
          <div className="metric-note">{expiringQr} mã sắp hết hạn</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm</div>
          <div className="metric-value">{violationSummary.total || violations.items.length}</div>
          <div className="metric-note">Nhân viên ghi nhận tại bãi</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Cơ cấu doanh thu</h2>
              <p className="section-copy">Gói tháng, gửi lẻ và phí vi phạm.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>Gói tháng</span><strong>{formatCurrency(revenue.monthlyPassRevenue || 0)}</strong></div>
            <div className="data-row"><span>Khách gửi lẻ</span><strong>{formatCurrency(revenue.walkInRevenue || 0)}</strong></div>
            <div className="data-row"><span>Phí vi phạm</span><strong>{formatCurrency(revenue.violationRevenue || violationSummary.pendingAmount || 0)}</strong></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${revenueSeries.length}, 1fr)`, gap: 12, alignItems: "end", marginTop: 20, minHeight: 180 }}>
            {revenueSeries.map((item) => (
              <div key={item.label} style={{ display: "grid", gap: 8, alignItems: "end" }}>
                <div style={{ height: `${Math.max(20, (item.value / barMax) * 150)}px`, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, var(--pink), var(--orange))" }} />
                <strong style={{ textAlign: "center", fontSize: 12 }}>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Layers size={19} /> Sức chứa bãi</h2>
              <p className="section-copy">Xe máy theo sức chứa, ô tô theo từng ô đỗ.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel">
              <strong>Xe máy</strong>
              <p className="section-copy">{currentMotorbike}/{totalMotorbike} xe đang gửi</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (currentMotorbike / totalMotorbike) * 100)}%` }} /></div>
            </div>
            <div className="soft-panel">
              <strong>Ô tô</strong>
              <p className="section-copy">{occupiedSlots}/{totalSlots} ô đang dùng</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (occupiedSlots / totalSlots) * 100)}%` }} /></div>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Danh sách vi phạm</h2>
            <p className="section-copy">Các khoản chưa thu sẽ cộng vào hóa đơn khi xe ra bãi.</p>
          </div>
        </div>
        <Table columns={violationColumns} data={violations.items} loading={violations.loading} />
      </section>
    </div>
  );
};

export default ReportsPage;
