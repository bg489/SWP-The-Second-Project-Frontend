import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  Car,
  CircleDollarSign,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Layers3,
  Mail,
  Phone,
  RefreshCcw,
  TicketCheck,
  Users,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusTone } from "../../services/mockParkingData";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { clearParkingNotice, fetchReportsRequest } from "../backend/parking/parkingSlice";
import { exportSystemReportPdf } from "./reports/exportSystemReportPdf";
import "./reports/ReportsPage.css";

const vehicleLabels = {
  CAR: "Ô tô",
  MOTORBIKE: "Xe máy",
};

const pricingLabels = {
  HOURLY: "Vé giờ",
  MONTHLY_PASS: "Gói tháng",
  TURN: "Vé lượt",
};

const customerLabels = {
  REGISTERED_USER: "Người dùng hệ thống",
  WALK_IN_GUEST: "Khách vãng lai",
};

const violationLabels = {
  "Do sai slot": "Ô tô đậu sai ô",
  "Keo oto do sai khu": "Ô tô đậu sai khu",
  LOST_QR_CARD: "Mất thẻ QR",
  WRONG_FLOOR: "Đỗ sai tầng",
  WRONG_SLOT: "Đỗ sai ô",
  "Xe may vao khu oto": "Xe máy đậu sai khu",
};

const asRows = (value) => (Array.isArray(value) ? value : []);
const toNumber = (value) => Number(value || 0);
const labelOf = (labels, value) => labels[value] || value || "Chưa có";
const percentageLabel = (value) => `${toNumber(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
const splitValues = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getRelatedVehicles = (row) => {
  if (Array.isArray(row?.relatedVehicles)) return row.relatedVehicles;

  return splitValues(row?.plateNumbers).map((plateNumber) => ({
    buildingName: row?.buildingNames,
    ownerName: row?.userNames,
    paidPenalty: 0,
    plateNumber,
    violationCount: 1,
    violations: [],
  }));
};

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.parking);
  const {
    buildings,
    error: buildingsError,
    loading: buildingsLoading,
  } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({
    buildingId: "",
    from: "2026-06-01",
    to: "2026-06-30",
  });
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);
  const dateRangeError = filters.from && filters.to && filters.from > filters.to
    ? "Ngày bắt đầu phải trước hoặc trùng ngày kết thúc."
    : null;
  const reportParams = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      ...(filters.buildingId ? { buildingId: Number(filters.buildingId) } : {}),
    }),
    [filters.buildingId, filters.from, filters.to]
  );

  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!dateRangeError) {
      dispatch(fetchReportsRequest(reportParams));
    }
  }, [dateRangeError, dispatch, reportParams]);

  const reportData = reports.data || {};
  const fullReport = reportData.full || reportData;
  const revenue = fullReport.revenue || {};
  const operations = fullReport.operations || {};
  const totals = operations.totals || {};
  const customerMix = operations.customerMix || {};
  const revenueRows = asRows(revenue.breakdown);
  const operationRows = asRows(operations.byBuilding);
  const ticketRows = asRows(fullReport.tickets?.rows);
  const monthlyRows = asRows(fullReport.monthlyPasses?.rows);
  const violationRows = asRows(fullReport.violations?.rows);
  const capacityRows = asRows(fullReport.capacity);
  const buildingCount = toNumber(fullReport.scope?.buildingCount || capacityRows.length);
  const totalRevenue = toNumber(revenue.totalRevenue || revenue.paidRevenue);
  const maxRevenue = Math.max(...revenueRows.map((row) => toNumber(row.amount)), 1);
  const registeredMix = customerMix.registeredUser || {};
  const walkInMix = customerMix.walkInGuest || {};
  const violationRevenueRow = revenueRows.find((row) => row.key === "VIOLATION_FEE") || {};
  const selectedBuilding = buildings.find(
    (building) => String(building.id) === String(filters.buildingId)
  );
  const scopeName =
    fullReport.scope?.buildingName ||
    selectedBuilding?.name ||
    (filters.buildingId ? "Tòa nhà đã chọn" : "Tất cả tòa nhà");

  const revenueColumns = [
    { header: "Nội dung thu", key: "label", minWidth: 190 },
    { header: "Số khoản đã thu", key: "completedCount" },
    {
      header: "Tỷ trọng",
      key: "percentage",
      render: (row) => percentageLabel(totalRevenue > 0 ? (toNumber(row.amount) / totalRevenue) * 100 : 0),
    },
    { header: "Số tiền", key: "amount", render: (row) => formatCurrency(row.amount) },
  ];

  const operationColumns = [
    { header: "Tòa nhà", key: "buildingName", minWidth: 180 },
    { header: "Xe vào", key: "entryCount" },
    { header: "Xe ra", key: "exitCount" },
    { header: "Đang gửi", key: "activeSessions" },
    {
      header: "Xe máy vào / ra",
      key: "motorbike",
      minWidth: 130,
      render: (row) => `${toNumber(row.motorbikeEntries)} / ${toNumber(row.motorbikeExits)}`,
    },
    {
      header: "Ô tô vào / ra",
      key: "car",
      minWidth: 120,
      render: (row) => `${toNumber(row.carEntries)} / ${toNumber(row.carExits)}`,
    },
    {
      header: "Vé lượt / giờ",
      key: "tickets",
      minWidth: 120,
      render: (row) => toNumber(row.turnTicketsCompleted) + toNumber(row.hourlyTicketsCompleted),
    },
    { header: "Lượt dùng gói tháng", key: "monthlyPassSessionsCompleted", minWidth: 150 },
    {
      header: "Người dùng / khách",
      key: "customerMix",
      minWidth: 160,
      render: (row) => `${percentageLabel(row.registeredUserPercentage)} / ${percentageLabel(row.walkInGuestPercentage)}`,
    },
  ];

  const ticketColumns = [
    { header: "Loại xe", key: "vehicleType", render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    { header: "Loại vé", key: "pricingType", render: (row) => labelOf(pricingLabels, row.pricingType) },
    { header: "Nhóm khách", key: "customerType", minWidth: 170, render: (row) => labelOf(customerLabels, row.customerType) },
    { header: "Đã hoàn tất", key: "completedCount" },
    { header: "Đã thanh toán", key: "paidCount" },
    { header: "Tiền gửi xe", key: "parkingFeeTotal", render: (row) => formatCurrency(row.parkingFeeTotal) },
    { header: "Phí vi phạm", key: "violationFeeTotal", render: (row) => formatCurrency(row.violationFeeTotal) },
    { header: "Tổng đã thu", key: "totalAmount", render: (row) => formatCurrency(row.totalAmount) },
  ];

  const monthlyColumns = [
    { header: "Người đăng ký", key: "ownerName", minWidth: 150 },
    { header: "Biển số", key: "plateNumber", minWidth: 120 },
    { header: "Tòa nhà", key: "buildingName", minWidth: 180 },
    { header: "Loại xe", key: "vehicleType", render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    { header: "Tên gói", key: "packageName", minWidth: 190 },
    {
      header: "Trạng thái gói",
      key: "status",
      minWidth: 140,
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      header: "Thanh toán",
      key: "paymentStatus",
      minWidth: 135,
      render: (row) => <span className={`pill ${getStatusTone(row.paymentStatus)}`}>{getStatusLabel(row.paymentStatus || "PENDING")}</span>,
    },
    { header: "Bắt đầu", key: "startDate", minWidth: 145, render: (row) => formatDateTime(row.startDate) },
    { header: "Hết hạn", key: "endDate", minWidth: 145, render: (row) => formatDateTime(row.endDate) },
    { header: "Số tiền", key: "amount", render: (row) => formatCurrency(row.amount) },
  ];

  const violationColumns = [
    { header: "Lỗi vi phạm", key: "violationName", minWidth: 190, render: (row) => labelOf(violationLabels, row.violationName) },
    { header: "Tòa nhà", key: "buildingNames", minWidth: 180 },
    { header: "Số lần", key: "violationCount" },
    { header: "Người liên quan", key: "userNames", minWidth: 190 },
    {
      header: "Xe liên quan",
      key: "relatedVehicles",
      minWidth: 150,
      render: (row) => {
        const relatedVehicles = getRelatedVehicles(row);

        return (
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            disabled={relatedVehicles.length === 0}
            onClick={() => setSelectedViolation({
              ...row,
              relatedVehicles,
            })}
          >
            Xem {relatedVehicles.length} xe
          </Button>
        );
      },
    },
    { header: "Đã thu", key: "paidPenalty", render: (row) => formatCurrency(row.paidPenalty) },
  ];

  const capacityColumns = [
    { header: "Tòa nhà", key: "buildingName", minWidth: 180 },
    { header: "Xe máy đang gửi", key: "motorbikeCurrent" },
    { header: "Sức chứa xe máy", key: "motorbikeCapacity" },
    { header: "Gói tháng xe máy", key: "motorbikeMonthlyPasses" },
    { header: "Xe máy còn nhận", key: "effectiveMotorbikeRemaining" },
    { header: "Ô tô đang đỗ", key: "carOccupiedSlots" },
    { header: "Ô đã đăng ký tháng", key: "carMonthlySlots" },
    { header: "Tổng ô ô tô", key: "carTotalSlots" },
  ];

  const refresh = () => {
    if (dateRangeError) return;
    setExportError(null);
    setExportNotice(null);
    dispatch(clearParkingNotice());
    dispatch(fetchReportsRequest(reportParams));
  };

  const handleExportPdf = async () => {
    if (dateRangeError || !fullReport.scope) return;
    setExporting(true);
    setExportError(null);
    setExportNotice(null);

    try {
      await exportSystemReportPdf({ filters, report: fullReport });
      setExportNotice("Đã tạo tệp báo cáo PDF đầy đủ cho toàn hệ thống.");
    } catch (error) {
      console.error("[report:pdf]", error);
      setExportError("Không thể tạo tệp PDF. Vui lòng tải lại dữ liệu và thử lần nữa.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="parking-page reports-page">
      <section className="page-hero reports-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><FileText size={16} /> Báo cáo vận hành</div>
          <h1 className="page-title">
            {filters.buildingId ? `Tổng hợp vận hành ${scopeName}` : "Tổng hợp vận hành của tất cả tòa nhà"}
          </h1>
          <p className="page-subtitle">
            Doanh thu, xe vào ra, vé đã hoàn tất, nhóm khách, vi phạm và sức chứa được lấy trực tiếp từ dữ liệu vận hành.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Phạm vi báo cáo</span>
          <span className="page-hero-number">{filters.buildingId ? 1 : buildingCount}</span>
          <span className="page-hero-label">{filters.buildingId ? scopeName : "tòa nhà"}</span>
        </div>
      </section>

      <StatusBanner
        errors={[reports.error, buildingsError, dateRangeError, exportError].filter(Boolean)}
        success={exportNotice}
      />

      <section className="card section-card reports-filter-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><BarChart3 size={19} /> Khoảng thời gian báo cáo</h2>
            <p className="section-copy">Chọn một tòa nhà để xem riêng, hoặc chọn tất cả để đối chiếu toàn hệ thống.</p>
          </div>
          <div className="action-row">
            <Button variant="outline" icon={RefreshCcw} loading={reports.loading} onClick={refresh} disabled={Boolean(dateRangeError)}>
              Làm mới
            </Button>
            <Button variant="primary" icon={Download} loading={exporting} onClick={handleExportPdf} disabled={Boolean(dateRangeError) || reports.loading || !fullReport.scope}>
              {exporting ? "Đang tạo PDF" : "Xuất báo cáo PDF"}
            </Button>
          </div>
        </div>
        <div className="filter-grid reports-date-grid">
          <FormField label="Tòa nhà">
            <Select
              value={filters.buildingId}
              onChange={(event) => {
                setSelectedViolation(null);
                setFilters((previous) => ({
                  ...previous,
                  buildingId: event.target.value,
                }));
              }}
              options={[
                { value: "", label: "Tất cả tòa nhà" },
                ...buildings.map((building) => ({
                  value: building.id,
                  label: building.name,
                })),
              ]}
              placeholder={null}
              disabled={buildingsLoading}
            />
          </FormField>
          <FormField label="Từ ngày">
            <Input type="date" value={filters.from} onChange={(event) => setFilters((previous) => ({ ...previous, from: event.target.value }))} />
          </FormField>
          <FormField label="Đến ngày">
            <Input type="date" value={filters.to} onChange={(event) => setFilters((previous) => ({ ...previous, to: event.target.value }))} />
          </FormField>
        </div>
      </section>

      <div className="dashboard-grid reports-metrics">
        <div className="card metric-card">
          <div className="metric-icon"><CircleDollarSign size={22} /></div>
          <div className="metric-label">Doanh thu đã thu</div>
          <div className="metric-value">{formatCurrency(totalRevenue)}</div>
          <div className="metric-note">Chỉ tính giao dịch thành công trong kỳ</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><ArrowDownToLine size={22} /></div>
          <div className="metric-label">Xe vào</div>
          <div className="metric-value">{toNumber(totals.entryCount).toLocaleString("vi-VN")}</div>
          <div className="metric-note">Xe máy {toNumber(totals.motorbikeEntries)} • Ô tô {toNumber(totals.carEntries)}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><ArrowUpFromLine size={22} /></div>
          <div className="metric-label">Xe ra</div>
          <div className="metric-value">{toNumber(totals.exitCount).toLocaleString("vi-VN")}</div>
          <div className="metric-note">Còn {toNumber(totals.activeSessions)} xe đang gửi</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><TicketCheck size={22} /></div>
          <div className="metric-label">Vé lượt/giờ hoàn tất</div>
          <div className="metric-value">{toNumber(totals.ticketSessionsCompleted).toLocaleString("vi-VN")}</div>
          <div className="metric-note">{toNumber(fullReport.tickets?.paidCount)} lượt đã thanh toán</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><FileCheck2 size={22} /></div>
          <div className="metric-label">Gói tháng đã thanh toán</div>
          <div className="metric-value">{toNumber(revenue.completedMonthlyPayments).toLocaleString("vi-VN")}</div>
          <div className="metric-note">{toNumber(totals.monthlyPassSessionsCompleted)} lượt ra bằng gói tháng</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Phí vi phạm đã thu</div>
          <div className="metric-value">{formatCurrency(revenue.violationRevenue)}</div>
          <div className="metric-note">{toNumber(violationRevenueRow.completedCount)} khoản đã thanh toán</div>
        </div>
      </div>

      <div className="two-column-grid reports-overview-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Cơ cấu doanh thu</h2>
              <p className="section-copy">Mỗi nhóm thể hiện số tiền đã thu và tỷ lệ trong tổng doanh thu.</p>
            </div>
          </div>
          <div className="reports-revenue-chart">
            {revenueRows.map((row) => {
              const amount = toNumber(row.amount);
              const width = amount > 0 ? Math.max(2, (amount / maxRevenue) * 100) : 0;
              return (
                <div className="reports-revenue-row" key={row.key}>
                  <div className="reports-revenue-label">
                    <span>{row.label}</span>
                    <strong>{formatCurrency(amount)}</strong>
                  </div>
                  <div className="reports-revenue-track" aria-hidden="true">
                    <div className="reports-revenue-fill" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Users size={19} /> Nhóm người gửi xe</h2>
              <p className="section-copy">Tỷ lệ được tính theo tổng số xe vào trong khoảng đã chọn.</p>
            </div>
          </div>
          <div className="reports-customer-list">
            <div className="reports-customer-item registered">
              <div className="reports-customer-heading">
                <span>Người dùng hệ thống</span>
                <strong>{percentageLabel(registeredMix.percentage)}</strong>
              </div>
              <div className="reports-customer-track"><div style={{ width: `${Math.min(100, toNumber(registeredMix.percentage))}%` }} /></div>
              <small>{toNumber(registeredMix.count).toLocaleString("vi-VN")} lượt xe vào</small>
            </div>
            <div className="reports-customer-item walk-in">
              <div className="reports-customer-heading">
                <span>Khách vãng lai</span>
                <strong>{percentageLabel(walkInMix.percentage)}</strong>
              </div>
              <div className="reports-customer-track"><div style={{ width: `${Math.min(100, toNumber(walkInMix.percentage))}%` }} /></div>
              <small>{toNumber(walkInMix.count).toLocaleString("vi-VN")} lượt xe vào</small>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><CircleDollarSign size={19} /> Doanh thu theo nội dung</h2>
            <p className="section-copy">Tổng của các dòng bên dưới luôn bằng doanh thu đã thu ở phần tổng quan.</p>
          </div>
        </div>
        <Table columns={revenueColumns} data={revenueRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Lượt xe của từng tòa nhà</h2>
            <p className="section-copy">So sánh xe vào, xe ra, số xe đang gửi và loại vé đã hoàn tất tại toàn bộ cơ sở.</p>
          </div>
        </div>
        <Table columns={operationColumns} data={operationRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><TicketCheck size={19} /> Vé lượt và vé giờ đã hoàn tất</h2>
            <p className="section-copy">Tách rõ theo loại xe và nhóm khách, gồm tiền gửi xe và phí vi phạm đã thanh toán.</p>
          </div>
        </div>
        <Table columns={ticketColumns} data={ticketRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><FileCheck2 size={19} /> Gói tháng xe máy và ô tô</h2>
            <p className="section-copy">
              {toNumber(fullReport.monthlyPasses?.paidCount)} gói đã thanh toán, tổng {formatCurrency(fullReport.monthlyPasses?.totalPaid)}.
            </p>
          </div>
        </div>
        <Table columns={monthlyColumns} data={monthlyRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Phí vi phạm đã thu</h2>
            <p className="section-copy">Các lỗi trùng tên được gộp lại nhưng vẫn giữ người, xe và tòa nhà liên quan.</p>
          </div>
        </div>
        <Table columns={violationColumns} data={violationRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers3 size={19} /> Sức chứa từng tòa nhà</h2>
            <p className="section-copy">Xe máy được tính theo sức chứa; ô tô được tính theo các ô đỗ có thật.</p>
          </div>
        </div>
        <Table columns={capacityColumns} data={capacityRows} loading={reports.loading} pageSize={10} />
      </section>

      <section className="reports-footnote" aria-label="Phạm vi báo cáo">
        <Car size={17} />
        <span>Dữ liệu trên màn hình và trong PDF cùng lấy từ phạm vi: {scopeName}.</span>
      </section>

      {selectedViolation && (
        <div
          className="modal-backdrop reports-related-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="related-vehicles-title"
          onClick={() => setSelectedViolation(null)}
        >
          <section
            className="card reports-related-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-header reports-related-header">
              <div>
                <h2 className="section-title" id="related-vehicles-title">
                  <Car size={19} /> Xe liên quan đến {labelOf(violationLabels, selectedViolation.violationName)}
                </h2>
                <p className="section-copy">
                  {selectedViolation.violationCount} lần vi phạm, đã thu {formatCurrency(selectedViolation.paidPenalty)}.
                </p>
              </div>
              <button
                type="button"
                className="theme-toggle-btn"
                aria-label="Đóng danh sách xe"
                onClick={() => setSelectedViolation(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="reports-related-list">
              {selectedViolation.relatedVehicles.map((vehicle, index) => (
                <article
                  className="reports-related-vehicle"
                  key={vehicle.sessionId || vehicle.vehicleId || `${vehicle.plateNumber}-${index}`}
                >
                  <div className="reports-related-vehicle-heading">
                    <div>
                      <strong>{vehicle.plateNumber || "Chưa có biển số"}</strong>
                      <span>{labelOf(vehicleLabels, vehicle.vehicleType)}</span>
                    </div>
                    <span className="pill danger">
                      {vehicle.violationCount || 1} lỗi • {formatCurrency(vehicle.paidPenalty)}
                    </span>
                  </div>
                  <div className="reports-related-details">
                    <div><span>Chủ xe</span><strong>{vehicle.ownerName || "Khách vãng lai"}</strong></div>
                    <div><span>Tòa nhà</span><strong>{vehicle.buildingName || "Chưa có"}</strong></div>
                    <div><span>Vị trí</span><strong>{[vehicle.floorName, vehicle.slotCode].filter(Boolean).join(" - ") || "Khu xe máy"}</strong></div>
                    <div><span>Thông tin xe</span><strong>{[vehicle.brand, vehicle.color].filter(Boolean).join(" - ") || "Chưa cập nhật"}</strong></div>
                    <div><span>Giờ vào</span><strong>{formatDateTime(vehicle.checkInAt)}</strong></div>
                    <div><span>Giờ ra</span><strong>{formatDateTime(vehicle.checkOutAt)}</strong></div>
                  </div>
                  {(vehicle.ownerEmail || vehicle.ownerPhone) && (
                    <div className="reports-related-contact">
                      {vehicle.ownerEmail && <span><Mail size={14} /> {vehicle.ownerEmail}</span>}
                      {vehicle.ownerPhone && <span><Phone size={14} /> {vehicle.ownerPhone}</span>}
                    </div>
                  )}
                  {asRows(vehicle.violations).some((violation) => violation.evidenceUrl) && (
                    <div className="reports-related-evidence">
                      {vehicle.violations
                        .filter((violation) => violation.evidenceUrl)
                        .map((violation) => (
                          <a
                            key={violation.id}
                            href={violation.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Mở ảnh bằng chứng"
                          >
                            <img src={violation.evidenceUrl} alt={`Bằng chứng xe ${vehicle.plateNumber || ""}`} />
                          </a>
                        ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
