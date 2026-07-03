import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, BarChart3, Car, Download, FileText, Layers, QrCode, RefreshCcw, TrendingUp } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import { clearParkingNotice, fetchReportsRequest, fetchViolationsRequest } from "../backend/parking/parkingSlice";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusTone, revenueSeries } from "../../services/mockParkingData";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.byStatus)) return value.byStatus;
  return [];
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderTableRows = (rows, columns) => {
  if (!rows.length) {
    return `<tr><td colspan="${columns.length}">Chưa có dữ liệu.</td></tr>`;
  }

  return rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => `<td>${escapeHtml(column.render ? column.render(row) : row[column.key])}</td>`)
            .join("")}
        </tr>
      `
    )
    .join("");
};

const renderReportTable = ({ columns, rows, title }) => `
  <section class="report-section">
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr>${columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")}</tr>
      </thead>
      <tbody>${renderTableRows(rows, columns)}</tbody>
    </table>
  </section>
`;

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
  const trafficRows = asArray(traffic);
  const motorbikeRows = asArray(motorbikeCapacity);
  const carSlotRows = asArray(carSlots);
  const qrStatusRows = asArray(qrPasses.byStatus || qrPasses);
  const qrExpiringRows = asArray(qrPasses.expiringSoon);
  const violationRows = asArray(violationSummary);

  const currentMotorbike = motorbikeRows.length > 0
    ? motorbikeRows.reduce((sum, row) => sum + Number(row.currentCount || 0), 0)
    : Number(motorbikeCapacity.current || motorbikeCapacity.currentCount || 0);
  const totalMotorbike = motorbikeRows.length > 0
    ? motorbikeRows.reduce((sum, row) => sum + Number(row.capacity || 0), 0)
    : Number(motorbikeCapacity.total || motorbikeCapacity.capacity || 1);
  const occupiedSlots = carSlotRows.length > 0
    ? carSlotRows
      .filter((row) => row.status === "OCCUPIED")
      .reduce((sum, row) => sum + Number(row.total || 0), 0)
    : Number(carSlots.occupied || carSlots.occupiedSlots || 0);
  const totalSlots = carSlotRows.length > 0
    ? carSlotRows.reduce((sum, row) => sum + Number(row.total || 0), 0)
    : Number(carSlots.total || carSlots.totalSlots || 1);

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
    const reportWindow = window.open("", "_blank", "width=1100,height=800");

    if (!reportWindow) {
      setExporting(false);
      return;
    }

    const sourceRows = asArray(revenue.paymentSources);
    const paymentRows = asArray(revenue.payments);
    const sessionRows = asArray(revenue.sessions);
    const html = `
      <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>Báo cáo Sunrise Parking</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; color: #241122; background: #fff7fb; }
            .report-shell { max-width: 1080px; margin: 0 auto; padding: 24px; }
            .report-hero { border-radius: 18px; padding: 26px; background: linear-gradient(135deg,#FFB8F5,#ED9951); color: #241122; }
            .eyebrow { display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(255,255,255,.42); font-weight: 800; }
            h1 { margin: 16px 0 8px; font-size: 30px; line-height: 1.15; }
            h2 { margin: 0 0 12px; font-size: 18px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
            .summary-card, .report-section { border: 1px solid #f2d5e7; border-radius: 14px; background: #fff; box-shadow: 0 12px 26px rgba(237,153,81,.12); }
            .summary-card { padding: 16px; }
            .summary-card span { display: block; color: #77566f; font-size: 12px; font-weight: 800; text-transform: uppercase; }
            .summary-card strong { display: block; margin-top: 8px; font-size: 22px; }
            .report-section { margin-top: 16px; padding: 16px; break-inside: avoid; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 9px; border-bottom: 1px solid #f1ddea; text-align: left; font-size: 12px; vertical-align: top; }
            th { background: #fff1fb; color: #6f526b; text-transform: uppercase; letter-spacing: .04em; }
            tr:last-child td { border-bottom: 0; }
            .print-actions { display: flex; justify-content: flex-end; margin: 18px 0; }
            button { border: 0; border-radius: 12px; padding: 12px 18px; background: linear-gradient(135deg,#ED9951,#FF6FD8); color: #fff; font-weight: 800; cursor: pointer; }
            @media print { body { background: #fff; } .print-actions { display: none; } .report-shell { padding: 0; } }
          </style>
        </head>
        <body>
          <main class="report-shell">
            <section class="report-hero">
              <span class="eyebrow">Sunrise Parking</span>
              <h1>Báo cáo vận hành bãi xe</h1>
              <p>Từ ${escapeHtml(filters.from)} đến ${escapeHtml(filters.to)}</p>
            </section>
            <div class="print-actions"><button onclick="window.print()">Lưu thành PDF</button></div>
            <section class="summary-grid">
              <div class="summary-card"><span>Doanh thu đã thanh toán</span><strong>${escapeHtml(formatCurrency(revenue.totalRevenue || revenue.paidRevenue || 0))}</strong></div>
              <div class="summary-card"><span>Gói tháng</span><strong>${escapeHtml(formatCurrency(revenue.monthlyPassRevenue || 0))}</strong></div>
              <div class="summary-card"><span>Khách gửi lẻ</span><strong>${escapeHtml(formatCurrency(revenue.walkInRevenue || 0))}</strong></div>
              <div class="summary-card"><span>Phí vi phạm</span><strong>${escapeHtml(formatCurrency(revenue.violationRevenue || violationSummary.pendingAmount || 0))}</strong></div>
            </section>
            ${renderReportTable({
              title: "Doanh thu theo nguồn",
              rows: sourceRows,
              columns: [
                { header: "Nguồn", key: "sourceType" },
                { header: "Trạng thái", key: "status" },
                { header: "Số lần", key: "paymentCount" },
                { header: "Tổng tiền", render: (row) => formatCurrency(row.totalAmount || 0) },
              ],
            })}
            ${renderReportTable({
              title: "Thanh toán theo phương thức",
              rows: paymentRows,
              columns: [
                { header: "Phương thức", key: "provider" },
                { header: "Trạng thái", key: "status" },
                { header: "Số lần", key: "paymentCount" },
                { header: "Tổng tiền", render: (row) => formatCurrency(row.totalAmount || 0) },
              ],
            })}
            ${renderReportTable({
              title: "Khách gửi lẻ đã hoàn tất",
              rows: sessionRows,
              columns: [
                { header: "Loại xe", key: "vehicleType" },
                { header: "Cách tính", key: "pricingType" },
                { header: "Số lượt", key: "sessionCount" },
                { header: "Tiền gửi", render: (row) => formatCurrency(row.baseFeeTotal || 0) },
                { header: "Phí vi phạm", render: (row) => formatCurrency(row.violationFeeTotal || 0) },
                { header: "Tổng", render: (row) => formatCurrency(row.totalAmount || 0) },
              ],
            })}
            ${renderReportTable({
              title: "Sức chứa xe máy",
              rows: motorbikeRows,
              columns: [
                { header: "Tòa", key: "buildingName" },
                { header: "Tầng", key: "floorName" },
                { header: "Sức chứa", key: "capacity" },
                { header: "Đang gửi", key: "currentCount" },
                { header: "Còn trống", key: "remainingCapacity" },
              ],
            })}
            ${renderReportTable({
              title: "Ô đỗ ô tô",
              rows: carSlotRows,
              columns: [
                { header: "Tòa", key: "buildingName" },
                { header: "Tầng", key: "floorName" },
                { header: "Trạng thái", key: "status" },
                { header: "Số ô", key: "total" },
              ],
            })}
            ${renderReportTable({
              title: "Mã QR gói tháng",
              rows: qrStatusRows,
              columns: [
                { header: "Loại", key: "passType" },
                { header: "Trạng thái", key: "status" },
                { header: "Số lượng", key: "total" },
              ],
            })}
            ${renderReportTable({
              title: "Vi phạm",
              rows: violations.items,
              columns: [
                { header: "Biển số", key: "plateNumber" },
                { header: "Nội dung", render: (row) => row.type || row.violationType },
                { header: "Trạng thái", key: "status" },
                { header: "Phí", render: (row) => formatCurrency(row.penaltyFee || row.fine || 0) },
              ],
            })}
          </main>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    setTimeout(() => {
      reportWindow.print();
      setExporting(false);
    }, 500);
  };

  const trafficIn = trafficRows.length > 0
    ? trafficRows.reduce((sum, row) => sum + Number(row.entryCount || 0), 0)
    : Number(traffic.trafficIn || traffic.inCount || 0);
  const trafficOut = trafficRows.length > 0
    ? trafficRows.reduce((sum, row) => sum + Number(row.exitCount || 0), 0)
    : Number(traffic.trafficOut || traffic.outCount || 0);
  const trafficTotal = trafficIn + trafficOut;
  const activeQr = qrStatusRows.length > 0
    ? qrStatusRows
      .filter((row) => row.status === "ACTIVE")
      .reduce((sum, row) => sum + Number(row.total || 0), 0)
    : Number(qrPasses.active || qrPasses.activeQrPasses || 0);
  const expiringQr = qrExpiringRows.length > 0
    ? qrExpiringRows.reduce((sum, row) => sum + Number(row.expiringSoon || 0), 0)
    : Number(qrPasses.expiring || qrPasses.expiringQrPasses || 0);
  const violationTotal = violationRows.length > 0
    ? violationRows.reduce((sum, row) => sum + Number(row.total || 0), 0)
    : Number(violationSummary.total || violations.items.length);
  const motorbikeCapacityTotal = Math.max(totalMotorbike, 1);
  const carSlotTotal = Math.max(totalSlots, 1);

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

      <StatusBanner errors={reports.error} />

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
          <div className="metric-label">Doanh thu đã thanh toán</div>
          <div className="metric-value">{formatCurrency(revenue.totalRevenue || revenue.paidRevenue || 0)}</div>
          <div className="metric-note">Gồm gửi lẻ, gói tháng và phí vi phạm</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Lượt xe vào/ra</div>
          <div className="metric-value">{trafficIn}/{trafficOut}</div>
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
          <div className="metric-value">{violationTotal}</div>
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
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (currentMotorbike / motorbikeCapacityTotal) * 100)}%` }} /></div>
            </div>
            <div className="soft-panel">
              <strong>Ô tô</strong>
              <p className="section-copy">{occupiedSlots}/{totalSlots} ô đang dùng</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (occupiedSlots / carSlotTotal) * 100)}%` }} /></div>
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
