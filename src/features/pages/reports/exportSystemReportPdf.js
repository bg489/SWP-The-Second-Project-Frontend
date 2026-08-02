/**
 * @fileoverview Xây dựng màn hình exportSystemReportPdf, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { formatCurrency } from "../../../services/mockParkingData.js";

/**
 * Khai báo `COLORS` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const COLORS = {
  accent: "#ED9951",
  border: "#EFD4E4",
  heading: "#281421",
  muted: "#765B6E",
  page: "#FFF8FC",
  pink: "#FFB8F5",
  pinkStrong: "#E779CC",
  tableHead: "#FFF0FA",
  white: "#FFFFFF",
};

/**
 * Khai báo `vehicleLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const vehicleLabels = {
  CAR: "Ô tô",
  MOTORBIKE: "Xe máy",
};

/**
 * Khai báo `pricingLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const pricingLabels = {
  HOURLY: "Vé giờ",
  MONTHLY_PASS: "Gói tháng",
  TURN: "Vé lượt",
};

/**
 * Khai báo `customerLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const customerLabels = {
  REGISTERED_USER: "Người dùng hệ thống",
  WALK_IN_GUEST: "Khách vãng lai",
};

/**
 * Khai báo `violationLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const violationLabels = {
  "Do sai slot": "Ô tô đậu sai ô",
  "Keo oto do sai khu": "Ô tô đậu sai khu",
  LOST_QR_CARD: "Mất thẻ QR",
  WRONG_FLOOR: "Đỗ sai tầng",
  WRONG_SLOT: "Đỗ sai ô",
  "Xe may vao khu oto": "Xe máy đậu sai khu",
};
/**
 * Khai báo `specialViolationCodes` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const specialViolationCodes = new Set([
  "WRONG_SLOT",
  "MOTORBIKE_WRONG_FLOOR",
  "CAR_WRONG_FLOOR_TOW",
]);
/**
 * Khai báo `specialViolationNames` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const specialViolationNames = new Set([
  "Ô tô đậu sai ô",
  "Ô tô đậu sai khu",
  "Xe máy đậu sai khu",
  "Do sai slot",
  "Keo oto do sai khu",
  "Xe may vao khu oto",
]);

/**
 * Khai báo `statusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const statusLabels = {
  ACTIVE: "Còn hạn",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  FAILED: "Thất bại",
  PAID: "Đã thanh toán",
  PENDING: "Đang chờ",
  PENDING_PAYMENT: "Chờ thanh toán",
  REJECTED: "Đã từ chối",
  SUCCESS: "Thành công",
};

/**
 * Thực hiện nghiệp vụ `asRows` (as rows). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function asRows
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const asRows = (value) => (Array.isArray(value) ? value : []);
/**
 * Thực hiện nghiệp vụ `toNumber` (to number). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function toNumber
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const toNumber = (value) => Number(value || 0);
/**
 * Hiển thị nghiệp vụ `displayText` (display text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function displayText
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @param {*} fallback - Giá trị `fallback` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const displayText = (value, fallback = "Chưa có") => String(value ?? "").trim() || fallback;
/**
 * Thực hiện nghiệp vụ `labelOf` (label of). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function labelOf
 * @param {*} labels - Giá trị `labels` được hàm sử dụng trong quá trình xử lý.
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const labelOf = (labels, value) => labels[value] || value || "Chưa có";
/**
 * Kiểm tra nghiệp vụ `isSpecialViolation` (is special violation). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function isSpecialViolation
 * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const isSpecialViolation = (row) =>
  /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  asRows(row?.violationCodes).some((code) => specialViolationCodes.has(code)) ||
  specialViolationNames.has(row?.violationName);
/**
 * Hiển thị nghiệp vụ `displayDate` (display date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function displayDate
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const displayDate = (value) => {
  if (!value) return "Chưa có";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa có" : date.toLocaleDateString("vi-VN");
};
/**
 * Thực hiện nghiệp vụ `percentage` (percentage). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function percentage
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const percentage = (value) => `${toNumber(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
/**
 * Thực hiện nghiệp vụ `uniqueFilePart` (unique file part). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function uniqueFilePart
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const uniqueFilePart = (value) => String(value || "all").replace(/[^0-9a-z-]/gi, "-");

/**
 * Khai báo `tableLayout` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/reports/exportSystemReportPdf.js.
 */
const tableLayout = {
  /**
   * Thực hiện nghiệp vụ `fillColor` (fill color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function fillColor
   * @param {*} rowIndex - Giá trị `rowIndex` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  fillColor: (rowIndex) => (rowIndex === 0 ? COLORS.tableHead : null),
  /**
   * Thực hiện nghiệp vụ `hLineColor` (h line color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function hLineColor
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  hLineColor: () => COLORS.border,
  /**
   * Thực hiện nghiệp vụ `hLineWidth` (h line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function hLineWidth
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  hLineWidth: () => 0.7,
  /**
   * Thực hiện nghiệp vụ `paddingBottom` (padding bottom). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function paddingBottom
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  paddingBottom: () => 5,
  /**
   * Thực hiện nghiệp vụ `paddingLeft` (padding left). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function paddingLeft
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  paddingLeft: () => 5,
  /**
   * Thực hiện nghiệp vụ `paddingRight` (padding right). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function paddingRight
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  paddingRight: () => 5,
  /**
   * Thực hiện nghiệp vụ `paddingTop` (padding top). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function paddingTop
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  paddingTop: () => 5,
  /**
   * Thực hiện nghiệp vụ `vLineColor` (v line color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function vLineColor
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  vLineColor: () => COLORS.border,
  /**
   * Thực hiện nghiệp vụ `vLineWidth` (v line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function vLineWidth
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  vLineWidth: () => 0.35,
};

/**
 * Thực hiện nghiệp vụ `headerCell` (header cell). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function headerCell
 * @param {*} text - Giá trị `text` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const headerCell = (text) => ({
  color: COLORS.muted,
  fontSize: 7.5,
  bold: true,
  text,
});

/**
 * Thực hiện nghiệp vụ `bodyCell` (body cell). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function bodyCell
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const bodyCell = (value, options = {}) => ({
  color: options.color || COLORS.heading,
  fontSize: options.fontSize || 7.5,
  bold: Boolean(options.bold),
  text: displayText(value),
});

/**
 * Thực hiện nghiệp vụ `makeTable` (make table). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function makeTable
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const makeTable = ({ columns, rows, fontSize = 7.5 }) => {
  /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const body = [columns.map((column) => headerCell(column.header))];

  if (rows.length === 0) {
    body.push([
      {
        colSpan: columns.length,
        color: COLORS.muted,
        fontSize: 8,
        alignment: "center",
        margin: [0, 10, 0, 10],
        text: "Chưa có dữ liệu trong khoảng thời gian này.",
      },
      /* Callback nội bộ của lời gọi `from`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ...Array.from({ length: Math.max(0, columns.length - 1) }, () => ({})),
    ]);
  } else {
    /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    rows.forEach((row) => {
      body.push(
        /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        columns.map((column) =>
          bodyCell(column.render ? column.render(row) : row[column.key], {
            bold: column.bold,
            color: column.color,
            fontSize,
          })
        )
      );
    });
  }

  return {
    table: {
      body,
      dontBreakRows: true,
      headerRows: 1,
      keepWithHeaderRows: 1,
      /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      widths: columns.map((column) => column.width || "*"),
    },
    layout: tableLayout,
  };
};

/**
 * Thực hiện nghiệp vụ `section` (section). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function section
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const section = ({ title, description, table, pageBreak }) => ({
  pageBreak,
  margin: [0, 0, 0, 14],
  stack: [
    { text: title, style: "sectionTitle" },
    ...(description ? [{ text: description, style: "sectionDescription" }] : []),
    table,
  ],
});

/**
 * Tính toán nghiệp vụ `summaryCard` (summary card). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function summaryCard
 * @param {*} label - Giá trị `label` được hàm sử dụng trong quá trình xử lý.
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @param {*} note - Giá trị `note` được hàm sử dụng trong quá trình xử lý.
 * @param {*} highlight - Giá trị `highlight` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const summaryCard = (label, value, note, highlight = false) => ({
  border: [true, true, true, true],
  borderColor: [highlight ? COLORS.accent : COLORS.border],
  fillColor: COLORS.white,
  margin: [8, 7, 8, 7],
  stack: [
    { text: label.toUpperCase(), color: COLORS.muted, fontSize: 7, bold: true },
    { text: displayText(value, "0"), color: COLORS.heading, fontSize: 17, bold: true, margin: [0, 6, 0, 3] },
    { text: note, color: COLORS.muted, fontSize: 7 },
  ],
});

/**
 * Thực hiện nghiệp vụ `customerMixCard` (customer mix card). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function customerMixCard
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const customerMixCard = ({ color, count, label, percent }) => {
  const safePercent = Math.max(0, Math.min(100, toNumber(percent)));
  const trackWidth = 315;

  return {
    fillColor: COLORS.white,
    margin: [10, 9, 10, 9],
    stack: [
      {
        columns: [
          { text: label, color: COLORS.heading, fontSize: 9, bold: true },
          { text: percentage(safePercent), color: COLORS.heading, fontSize: 10, bold: true, alignment: "right" },
        ],
      },
      {
        canvas: [
          { type: "rect", x: 0, y: 0, w: trackWidth, h: 7, color: "#F4E6EF", r: 3.5 },
          { type: "rect", x: 0, y: 0, w: (trackWidth * safePercent) / 100, h: 7, color, r: 3.5 },
        ],
        margin: [0, 8, 0, 5],
      },
      { text: `${toNumber(count).toLocaleString("vi-VN")} lượt xe vào`, color: COLORS.muted, fontSize: 7 },
    ],
  };
};

/**
 * Tạo nghiệp vụ `buildSystemReportPdfDefinition` (build system report pdf definition). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function buildSystemReportPdfDefinition
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
 */
export const buildSystemReportPdfDefinition = ({ filters, report }) => {
  const revenue = report.revenue || {};
  const operations = report.operations || {};
  const totals = operations.totals || {};
  const customerMix = operations.customerMix || {};
  const revenueRows = asRows(revenue.breakdown);
  const operationRows = asRows(operations.byBuilding);
  const ticketRows = asRows(report.tickets?.rows);
  const monthlyRows = asRows(report.monthlyPasses?.rows);
  const allViolationRows = asRows(report.violations?.rows);
  const specialViolationRows = Array.isArray(report.violations?.specialRows)
    ? report.violations.specialRows
    : allViolationRows.filter(isSpecialViolation);
  const regularViolationRows = Array.isArray(report.violations?.regularRows)
    ? report.violations.regularRows
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    : allViolationRows.filter((row) => !isSpecialViolation(row));
  const capacityRows = asRows(report.capacity);
  const totalRevenue = toNumber(revenue.totalRevenue || revenue.paidRevenue);
  const buildingCount = toNumber(report.scope?.buildingCount || capacityRows.length);
  const isBuildingScope = report.scope?.type === "BUILDING";
  const scopeName =
    report.scope?.buildingName ||
    capacityRows[0]?.buildingName ||
    (isBuildingScope ? "Tòa nhà đã chọn" : "Toàn hệ thống");
  const scopeSummary = isBuildingScope ? scopeName : `${buildingCount} tòa nhà`;
  const registered = customerMix.registeredUser || {};
  const walkIn = customerMix.walkInGuest || {};
  const generatedAt = new Date().toLocaleString("vi-VN");
  const rangeLabel = `Từ ${filters.from} đến ${filters.to}`;

  const revenueColumns = [
    { header: "Nội dung thu", key: "label", width: "*", bold: true },
    { header: "Số khoản đã thu", key: "completedCount", width: 90 },
    {
      header: "Tỷ trọng",
      width: 72,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => percentage(totalRevenue > 0 ? (toNumber(row.amount) / totalRevenue) * 100 : 0),
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Số tiền", width: 105, render: (row) => formatCurrency(toNumber(row.amount)) },
  ];

  const ticketColumns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", width: 62, render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại vé", width: 55, render: (row) => labelOf(pricingLabels, row.pricingType) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Nhóm khách", width: 90, render: (row) => labelOf(customerLabels, row.customerType) },
    { header: "Hoàn tất", key: "completedCount", width: 48 },
    { header: "Đã trả", key: "paidCount", width: 46 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tiền gửi xe", width: 82, render: (row) => formatCurrency(toNumber(row.parkingFeeTotal)) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Phí vi phạm", width: 82, render: (row) => formatCurrency(toNumber(row.violationFeeTotal)) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tổng đã thu", width: 88, render: (row) => formatCurrency(toNumber(row.totalAmount)) },
  ];

  const operationColumns = [
    { header: "Tòa nhà", key: "buildingName", width: 108, bold: true },
    { header: "Xe vào", key: "entryCount", width: 38 },
    { header: "Xe ra", key: "exitCount", width: 38 },
    { header: "Đang gửi", key: "activeSessions", width: 44 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Xe máy vào / ra", width: 67, render: (row) => `${toNumber(row.motorbikeEntries)} / ${toNumber(row.motorbikeExits)}` },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Ô tô vào / ra", width: 62, render: (row) => `${toNumber(row.carEntries)} / ${toNumber(row.carExits)}` },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Vé lượt / giờ", width: 58, render: (row) => toNumber(row.turnTicketsCompleted) + toNumber(row.hourlyTicketsCompleted) },
    { header: "Lượt gói tháng", key: "monthlyPassSessionsCompleted", width: 65 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Người dùng / khách", width: 88, render: (row) => `${percentage(row.registeredUserPercentage)} / ${percentage(row.walkInGuestPercentage)}` },
  ];

  const monthlyColumns = [
    { header: "Người đăng ký", key: "ownerName", width: 83, bold: true },
    { header: "Biển số", key: "plateNumber", width: 61 },
    { header: "Tòa nhà", key: "buildingName", width: 86 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", width: 50, render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    { header: "Tên gói", key: "packageName", width: 93 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Trạng thái", width: 68, render: (row) => labelOf(statusLabels, row.status) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Thanh toán", width: 68, render: (row) => labelOf(statusLabels, row.paymentStatus) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Bắt đầu / hết hạn", width: 93, render: (row) => `${displayDate(row.startDate)}\n${displayDate(row.endDate)}` },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Số tiền", width: 72, render: (row) => formatCurrency(toNumber(row.amount)) },
  ];

  const violationColumns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Lỗi vi phạm", width: 145, bold: true, render: (row) => labelOf(violationLabels, row.violationName) },
    { header: "Tòa nhà", key: "buildingNames", width: 110 },
    { header: "Số lần", key: "violationCount", width: 45 },
    { header: "Người liên quan", key: "userNames", width: 140 },
    { header: "Xe liên quan", key: "plateNumbers", width: 115 },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Đã thu", width: 90, render: (row) => formatCurrency(toNumber(row.paidPenalty)) },
  ];

  const capacityColumns = [
    { header: "Tòa nhà", key: "buildingName", width: 115, bold: true },
    { header: "Xe máy đang gửi", key: "motorbikeCurrent", width: 70 },
    { header: "Sức chứa xe máy", key: "motorbikeCapacity", width: 78 },
    { header: "Gói tháng xe máy", key: "motorbikeMonthlyPasses", width: 80 },
    { header: "Xe máy còn nhận", key: "effectiveMotorbikeRemaining", width: 75 },
    { header: "Ô tô đang đỗ", key: "carOccupiedSlots", width: 70 },
    { header: "Ô gói tháng", key: "carMonthlySlots", width: 72 },
    { header: "Tổng ô ô tô", key: "carTotalSlots", width: 76 },
  ];

  return {
    /**
     * Thực hiện nghiệp vụ `background` (background). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function background
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    background: () => ({
      canvas: [{ type: "rect", x: 0, y: 0, w: 842, h: 596, color: COLORS.page }],
    }),
    content: [
      {
        table: {
          widths: ["*", 140],
          body: [[
            {
              border: [false, false, false, false],
              fillColor: COLORS.pink,
              margin: [18, 15, 18, 15],
              stack: [
                { text: isBuildingScope ? "BÁO CÁO THEO TÒA NHÀ" : "BÁO CÁO TOÀN HỆ THỐNG", fontSize: 8, bold: true, color: COLORS.muted },
                { text: "Tổng quan vận hành bãi xe", fontSize: 24, bold: true, color: COLORS.heading, margin: [0, 8, 0, 5] },
                { text: `${scopeSummary} • ${rangeLabel} • Xuất lúc ${generatedAt}`, fontSize: 9, bold: true, color: COLORS.muted },
              ],
            },
            {
              border: [false, false, false, false],
              fillColor: COLORS.accent,
              alignment: "right",
              margin: [14, 18, 14, 15],
              stack: [
                { text: "SUNRISE", fontSize: 15, bold: true, color: COLORS.white },
                { text: "PARKING", fontSize: 15, bold: true, color: COLORS.white },
                { text: isBuildingScope ? scopeName.toUpperCase() : `${buildingCount} TÒA NHÀ`, fontSize: 8, bold: true, color: COLORS.white, margin: [0, 8, 0, 0] },
              ],
            },
          ]],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ["*", "*", "*", "*"],
          body: [
            [
              summaryCard("Doanh thu đã thu", formatCurrency(totalRevenue), "Giao dịch thành công trong kỳ", true),
              summaryCard("Xe vào", toNumber(totals.entryCount), `Xe máy ${toNumber(totals.motorbikeEntries)} • Ô tô ${toNumber(totals.carEntries)}`),
              summaryCard("Xe ra", toNumber(totals.exitCount), `Còn ${toNumber(totals.activeSessions)} xe đang gửi`),
              summaryCard("Vé lượt/giờ hoàn tất", toNumber(totals.ticketSessionsCompleted), `${toNumber(report.tickets?.paidCount)} lượt đã thanh toán`),
            ],
            [
              summaryCard("Lượt dùng gói tháng", toNumber(totals.monthlyPassSessionsCompleted), "Lượt xe ra bằng gói tháng"),
              summaryCard("Gói tháng đã thanh toán", toNumber(revenue.completedMonthlyPayments), formatCurrency(toNumber(report.monthlyPasses?.totalPaid))),
              summaryCard("Phí vi phạm đã thu", formatCurrency(toNumber(revenue.violationRevenue)), "Đã cộng trong tổng doanh thu"),
              summaryCard(
                isBuildingScope ? "Phạm vi" : "Số tòa nhà",
                isBuildingScope ? "1" : buildingCount,
                isBuildingScope ? scopeName : "Tổng hợp toàn bộ cơ sở"
              ),
            ],
          ],
        },
        layout: {
          /**
           * Thực hiện nghiệp vụ `hLineColor` (h line color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function hLineColor
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          hLineColor: () => COLORS.border,
          /**
           * Thực hiện nghiệp vụ `hLineWidth` (h line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function hLineWidth
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          hLineWidth: () => 0,
          /**
           * Thực hiện nghiệp vụ `paddingBottom` (padding bottom). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingBottom
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingBottom: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingLeft` (padding left). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingLeft
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingLeft: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingRight` (padding right). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingRight
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingRight: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingTop` (padding top). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingTop
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingTop: () => 4,
          /**
           * Thực hiện nghiệp vụ `vLineWidth` (v line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function vLineWidth
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          vLineWidth: () => 0,
        },
        margin: [-4, -4, -4, 10],
      },
      {
        table: {
          widths: ["*", "*"],
          body: [[
            customerMixCard({ color: COLORS.pinkStrong, count: registered.count, label: "Người dùng hệ thống", percent: registered.percentage }),
            customerMixCard({ color: COLORS.accent, count: walkIn.count, label: "Khách vãng lai", percent: walkIn.percentage }),
          ]],
        },
        layout: {
          /**
           * Thực hiện nghiệp vụ `hLineColor` (h line color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function hLineColor
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          hLineColor: () => COLORS.border,
          /**
           * Thực hiện nghiệp vụ `hLineWidth` (h line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function hLineWidth
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          hLineWidth: () => 0.7,
          /**
           * Thực hiện nghiệp vụ `paddingBottom` (padding bottom). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingBottom
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingBottom: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingLeft` (padding left). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingLeft
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingLeft: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingRight` (padding right). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingRight
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingRight: () => 4,
          /**
           * Thực hiện nghiệp vụ `paddingTop` (padding top). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function paddingTop
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          paddingTop: () => 4,
          /**
           * Thực hiện nghiệp vụ `vLineColor` (v line color). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function vLineColor
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          vLineColor: () => COLORS.border,
          /**
           * Thực hiện nghiệp vụ `vLineWidth` (v line width). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function vLineWidth
           * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
           */
          vLineWidth: () => 0.7,
        },
        margin: [-4, 0, -4, 0],
        pageBreak: "after",
      },
      section({
        title: "Doanh thu theo nội dung",
        description: `Tổng đã thu ${formatCurrency(totalRevenue)}. Gói tháng, vé lượt, vé giờ và phí vi phạm được tách riêng; tổng các dòng bằng doanh thu đã thu.`,
        table: makeTable({ columns: revenueColumns, rows: revenueRows }),
      }),
      section({
        title: "Vé lượt và vé giờ đã hoàn tất",
        description: "Số lượt hoàn tất và số tiền đã thanh toán được tách theo loại xe và nhóm khách.",
        table: makeTable({ columns: ticketColumns, rows: ticketRows, fontSize: 7 }),
      }),
      section({
        title: "Xe vào, xe ra và vé đã hoàn tất theo tòa nhà",
        description: isBuildingScope
          ? `Chi tiết lượt xe, loại vé và tỷ lệ người dùng/khách vãng lai tại ${scopeName}.`
          : `So sánh dữ liệu của ${buildingCount} tòa nhà, gồm lượt dùng vé, lượt dùng gói tháng và tỷ lệ người dùng/khách vãng lai.`,
        pageBreak: "before",
        table: makeTable({ columns: operationColumns, rows: operationRows, fontSize: 6.8 }),
      }),
      section({
        title: "Gói tháng xe máy và ô tô",
        description: `${toNumber(report.monthlyPasses?.paidCount)} gói đã thanh toán, tổng ${formatCurrency(toNumber(report.monthlyPasses?.totalPaid))}. Danh sách hiển thị người dùng, xe, tòa nhà, thời hạn và trạng thái thanh toán.`,
        pageBreak: "before",
        table: makeTable({ columns: monthlyColumns, rows: monthlyRows, fontSize: 6.6 }),
      }),
      section({
        title: "Ô tô đậu sai ô và xe đậu sai khu",
        description: `Đã thu ${formatCurrency(toNumber(report.violations?.specialPaidPenalty))}. Nhóm này được tách khỏi các vi phạm thông thường để quản lý dễ đối chiếu.`,
        pageBreak: "before",
        table: makeTable({ columns: violationColumns, rows: specialViolationRows, fontSize: 7 }),
      }),
      section({
        title: "Vi phạm thường đã thu",
        description: `Đã thu ${formatCurrency(toNumber(report.violations?.regularPaidPenalty))}. Các lỗi trùng tên được cộng số lần và số tiền, đồng thời giữ người, xe và tòa nhà liên quan.`,
        pageBreak: "before",
        table: makeTable({ columns: violationColumns, rows: regularViolationRows, fontSize: 7 }),
      }),
      section({
        title: "Sức chứa từng tòa nhà",
        description: "Gói tháng xe máy được trừ khỏi số xe còn nhận; ô tô được tính theo các ô đỗ có thật trong từng tòa nhà.",
        pageBreak: "before",
        table: makeTable({ columns: capacityColumns, rows: capacityRows, fontSize: 6.9 }),
      }),
    ],
    defaultStyle: {
      color: COLORS.heading,
      font: "Roboto",
      fontSize: 8,
    },
    /**
     * Thực hiện nghiệp vụ `footer` (footer). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function footer
     * @param {*} currentPage - Giá trị `currentPage` được hàm sử dụng trong quá trình xử lý.
     * @param {*} pageCount - Giá trị `pageCount` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: "SUNRISE PARKING", color: COLORS.muted, fontSize: 7, bold: true },
        { text: `${currentPage} / ${pageCount}`, color: COLORS.muted, fontSize: 7, alignment: "right" },
      ],
      margin: [28, 0, 28, 0],
    }),
    info: {
      author: "Sunrise Parking",
      creator: "Sunrise Parking Management System",
      subject: `Báo cáo vận hành ${scopeName} ${filters.from} - ${filters.to}`,
      title: `Sunrise Parking - Báo cáo vận hành ${scopeName}`,
    },
    pageMargins: [28, 28, 28, 30],
    pageOrientation: "landscape",
    pageSize: "A4",
    styles: {
      sectionDescription: {
        color: COLORS.muted,
        fontSize: 8,
        margin: [0, 0, 0, 9],
      },
      sectionTitle: {
        color: COLORS.heading,
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 4],
      },
    },
  };
};

/**
 * Tạo nghiệp vụ `createPdfBlob` (create pdf blob). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function createPdfBlob
 * @param {*} pdfMake - Giá trị `pdfMake` được hàm sử dụng trong quá trình xử lý.
 * @param {*} definition - Giá trị `definition` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const createPdfBlob = (pdfMake, definition) =>
  /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  new Promise((resolve) => {
    pdfMake.createPdf(definition).getBlob(resolve);
  });

/**
 * Thực hiện nghiệp vụ `exportSystemReportPdf` (export system report pdf). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function exportSystemReportPdf
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
 */
export const exportSystemReportPdf = async ({ filters, report }) => {
  const [pdfMakeModule, fontModule] = await Promise.all([
    import("pdfmake/build/pdfmake.js"),
    import("pdfmake/build/vfs_fonts.js"),
  ]);
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const virtualFonts = fontModule.default || fontModule;

  pdfMake.addVirtualFileSystem(virtualFonts);

  const definition = buildSystemReportPdfDefinition({ filters, report });
  const blob = await createPdfBlob(pdfMake, definition);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  const scopeFilePart = report.scope?.buildingId
    ? `building-${uniqueFilePart(report.scope.buildingId)}`
    : "all-buildings";
  anchor.download = `sunrise-parking-report-${scopeFilePart}-${uniqueFilePart(filters.from)}-${uniqueFilePart(filters.to)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
