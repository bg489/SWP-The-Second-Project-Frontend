import { useState } from "react";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import {
  carSlots,
  floors,
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  reportSummary,
  revenueSeries,
  violations,
} from "../../services/mockParkingData";
import { AlertTriangle, BarChart3, Car, Download, FileText, Layers, QrCode, TrendingUp } from "lucide-react";

const ReportsPage = () => {
  const [exporting, setExporting] = useState(false);
  const totalMotorbike = floors.filter((floor) => floor.floorType === "MOTORBIKE").reduce((sum, floor) => sum + floor.capacity, 0);
  const currentMotorbike = floors.filter((floor) => floor.floorType === "MOTORBIKE").reduce((sum, floor) => sum + floor.currentCount, 0);
  const occupiedSlots = carSlots.filter((slot) => slot.status === "OCCUPIED").length;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1300);
  };

  const violationColumns = [
    { header: "Mã", key: "id" },
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại vi phạm", key: "type" },
    { header: "Ghi nhận", key: "detectedAt", render: (row) => formatDateTime(row.detectedAt) },
    { header: "Phí", key: "fine", render: (row) => formatCurrency(row.fine) },
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
          <div className="page-eyebrow"><FileText size={16} /> Báo cáo MVP</div>
          <h1 className="page-title">Doanh thu, lượt xe, capacity, QR pass và vi phạm</h1>
          <p className="page-subtitle">
            Báo cáo gom các chỉ số nhóm cần thuyết trình và các API backend có thể trả về sau này.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Doanh thu tháng</span>
          <span className="page-hero-number">{Math.round(reportSummary.revenueMonth / 1000000)}M</span>
          <span className="page-hero-label">VND</span>
        </div>
      </section>

      <div className="section-header">
        <div />
        <Button variant="primary" icon={Download} loading={exporting} onClick={handleExport}>
          {exporting ? "Đang xuất báo cáo" : "Xuất báo cáo PDF"}
        </Button>
      </div>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><TrendingUp size={22} /></div>
          <div className="metric-label">Doanh thu hôm nay</div>
          <div className="metric-value">{formatCurrency(reportSummary.revenueToday)}</div>
          <div className="metric-note">Gồm phí lượt, giờ, tháng và phạt</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Lượt xe vào/ra</div>
          <div className="metric-value">{reportSummary.trafficIn}/{reportSummary.trafficOut}</div>
          <div className="metric-note">Trong ngày mock 11/06/2026</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">QR pass còn hạn</div>
          <div className="metric-value">{reportSummary.activeQrPasses}</div>
          <div className="metric-note">{reportSummary.expiringQrPasses} pass sắp hết hạn</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm</div>
          <div className="metric-value">{violations.length}</div>
          <div className="metric-note">Do staff ghi nhận thủ công</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Cơ cấu doanh thu</h2>
              <p className="section-copy">Gói tháng, gửi lượt/giờ và phí vi phạm.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>Gói tháng</span><strong>{formatCurrency(reportSummary.monthlyPassRevenue)}</strong></div>
            <div className="data-row"><span>Khách vãng lai</span><strong>{formatCurrency(reportSummary.walkInRevenue)}</strong></div>
            <div className="data-row"><span>Phí vi phạm</span><strong>{formatCurrency(reportSummary.violationRevenue)}</strong></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${revenueSeries.length}, 1fr)`, gap: 12, alignItems: "end", marginTop: 20, minHeight: 180 }}>
            {revenueSeries.map((item) => (
              <div key={item.label} style={{ display: "grid", gap: 8, alignItems: "end" }}>
                <div style={{ height: `${item.value * 0.7}px`, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, var(--pink), var(--orange))" }} />
                <strong style={{ textAlign: "center", fontSize: 12 }}>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Layers size={19} /> Công suất bãi</h2>
              <p className="section-copy">Xe máy theo capacity, ô tô theo slot.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel">
              <strong>Xe máy</strong>
              <p className="section-copy">{currentMotorbike}/{totalMotorbike} xe đang gửi</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(currentMotorbike / totalMotorbike) * 100}%` }} /></div>
            </div>
            <div className="soft-panel">
              <strong>Ô tô</strong>
              <p className="section-copy">{occupiedSlots}/{carSlots.length} slot đang dùng</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(occupiedSlots / carSlots.length) * 100}%` }} /></div>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Danh sách vi phạm</h2>
            <p className="section-copy">Phí vi phạm có thể cộng vào phiên và thu khi xe ra.</p>
          </div>
        </div>
        <Table columns={violationColumns} data={violations} />
      </section>
    </div>
  );
};

export default ReportsPage;
