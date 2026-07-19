import { formatCurrency } from "../../../services/mockParkingData.js";

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

const asRows = (value) => (Array.isArray(value) ? value : []);
const toNumber = (value) => Number(value || 0);
const displayText = (value, fallback = "Chưa có") => String(value ?? "").trim() || fallback;
const labelOf = (labels, value) => labels[value] || value || "Chưa có";
const displayDate = (value) => {
  if (!value) return "Chưa có";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa có" : date.toLocaleDateString("vi-VN");
};
const percentage = (value) => `${toNumber(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
const uniqueFilePart = (value) => String(value || "all").replace(/[^0-9a-z-]/gi, "-");

const tableLayout = {
  fillColor: (rowIndex) => (rowIndex === 0 ? COLORS.tableHead : null),
  hLineColor: () => COLORS.border,
  hLineWidth: () => 0.7,
  paddingBottom: () => 5,
  paddingLeft: () => 5,
  paddingRight: () => 5,
  paddingTop: () => 5,
  vLineColor: () => COLORS.border,
  vLineWidth: () => 0.35,
};

const headerCell = (text) => ({
  color: COLORS.muted,
  fontSize: 7.5,
  bold: true,
  text,
});

const bodyCell = (value, options = {}) => ({
  color: options.color || COLORS.heading,
  fontSize: options.fontSize || 7.5,
  bold: Boolean(options.bold),
  text: displayText(value),
});

const makeTable = ({ columns, rows, fontSize = 7.5 }) => {
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
      ...Array.from({ length: Math.max(0, columns.length - 1) }, () => ({})),
    ]);
  } else {
    rows.forEach((row) => {
      body.push(
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
      widths: columns.map((column) => column.width || "*"),
    },
    layout: tableLayout,
  };
};

const section = ({ title, description, table, pageBreak }) => ({
  pageBreak,
  margin: [0, 0, 0, 14],
  stack: [
    { text: title, style: "sectionTitle" },
    ...(description ? [{ text: description, style: "sectionDescription" }] : []),
    table,
  ],
});

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

export const buildSystemReportPdfDefinition = ({ filters, report }) => {
  const revenue = report.revenue || {};
  const operations = report.operations || {};
  const totals = operations.totals || {};
  const customerMix = operations.customerMix || {};
  const revenueRows = asRows(revenue.breakdown);
  const operationRows = asRows(operations.byBuilding);
  const ticketRows = asRows(report.tickets?.rows);
  const monthlyRows = asRows(report.monthlyPasses?.rows);
  const violationRows = asRows(report.violations?.rows);
  const capacityRows = asRows(report.capacity);
  const totalRevenue = toNumber(revenue.totalRevenue || revenue.paidRevenue);
  const buildingCount = toNumber(report.scope?.buildingCount || capacityRows.length);
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
      render: (row) => percentage(totalRevenue > 0 ? (toNumber(row.amount) / totalRevenue) * 100 : 0),
    },
    { header: "Số tiền", width: 105, render: (row) => formatCurrency(toNumber(row.amount)) },
  ];

  const ticketColumns = [
    { header: "Loại xe", width: 62, render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    { header: "Loại vé", width: 55, render: (row) => labelOf(pricingLabels, row.pricingType) },
    { header: "Nhóm khách", width: 90, render: (row) => labelOf(customerLabels, row.customerType) },
    { header: "Hoàn tất", key: "completedCount", width: 48 },
    { header: "Đã trả", key: "paidCount", width: 46 },
    { header: "Tiền gửi xe", width: 82, render: (row) => formatCurrency(toNumber(row.parkingFeeTotal)) },
    { header: "Phí vi phạm", width: 82, render: (row) => formatCurrency(toNumber(row.violationFeeTotal)) },
    { header: "Tổng đã thu", width: 88, render: (row) => formatCurrency(toNumber(row.totalAmount)) },
  ];

  const operationColumns = [
    { header: "Tòa nhà", key: "buildingName", width: 108, bold: true },
    { header: "Xe vào", key: "entryCount", width: 38 },
    { header: "Xe ra", key: "exitCount", width: 38 },
    { header: "Đang gửi", key: "activeSessions", width: 44 },
    { header: "Xe máy vào / ra", width: 67, render: (row) => `${toNumber(row.motorbikeEntries)} / ${toNumber(row.motorbikeExits)}` },
    { header: "Ô tô vào / ra", width: 62, render: (row) => `${toNumber(row.carEntries)} / ${toNumber(row.carExits)}` },
    { header: "Vé lượt / giờ", width: 58, render: (row) => toNumber(row.turnTicketsCompleted) + toNumber(row.hourlyTicketsCompleted) },
    { header: "Lượt gói tháng", key: "monthlyPassSessionsCompleted", width: 65 },
    { header: "Người dùng / khách", width: 88, render: (row) => `${percentage(row.registeredUserPercentage)} / ${percentage(row.walkInGuestPercentage)}` },
  ];

  const monthlyColumns = [
    { header: "Người đăng ký", key: "ownerName", width: 83, bold: true },
    { header: "Biển số", key: "plateNumber", width: 61 },
    { header: "Tòa nhà", key: "buildingName", width: 86 },
    { header: "Loại xe", width: 50, render: (row) => labelOf(vehicleLabels, row.vehicleType) },
    { header: "Tên gói", key: "packageName", width: 93 },
    { header: "Trạng thái", width: 68, render: (row) => labelOf(statusLabels, row.status) },
    { header: "Thanh toán", width: 68, render: (row) => labelOf(statusLabels, row.paymentStatus) },
    { header: "Bắt đầu / hết hạn", width: 93, render: (row) => `${displayDate(row.startDate)}\n${displayDate(row.endDate)}` },
    { header: "Số tiền", width: 72, render: (row) => formatCurrency(toNumber(row.amount)) },
  ];

  const violationColumns = [
    { header: "Lỗi vi phạm", width: 145, bold: true, render: (row) => labelOf(violationLabels, row.violationName) },
    { header: "Tòa nhà", key: "buildingNames", width: 110 },
    { header: "Số lần", key: "violationCount", width: 45 },
    { header: "Người liên quan", key: "userNames", width: 140 },
    { header: "Xe liên quan", key: "plateNumbers", width: 115 },
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
                { text: "BÁO CÁO TOÀN HỆ THỐNG", fontSize: 8, bold: true, color: COLORS.muted },
                { text: "Tổng quan vận hành bãi xe", fontSize: 24, bold: true, color: COLORS.heading, margin: [0, 8, 0, 5] },
                { text: `${buildingCount} tòa nhà • ${rangeLabel} • Xuất lúc ${generatedAt}`, fontSize: 9, bold: true, color: COLORS.muted },
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
                { text: `${buildingCount} TÒA NHÀ`, fontSize: 8, bold: true, color: COLORS.white, margin: [0, 8, 0, 0] },
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
              summaryCard("Số tòa nhà", buildingCount, "Tổng hợp toàn bộ cơ sở"),
            ],
          ],
        },
        layout: {
          hLineColor: () => COLORS.border,
          hLineWidth: () => 0,
          paddingBottom: () => 4,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
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
          hLineColor: () => COLORS.border,
          hLineWidth: () => 0.7,
          paddingBottom: () => 4,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          vLineColor: () => COLORS.border,
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
        description: `So sánh dữ liệu của ${buildingCount} tòa nhà, gồm lượt dùng vé, lượt dùng gói tháng và tỷ lệ người dùng/khách vãng lai.`,
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
        title: "Phí vi phạm đã thu",
        description: `Đã thu ${formatCurrency(toNumber(revenue.violationRevenue))}. Các lỗi trùng tên được cộng số lần và số tiền, đồng thời giữ người, xe và tòa nhà liên quan.`,
        pageBreak: "before",
        table: makeTable({ columns: violationColumns, rows: violationRows, fontSize: 7 }),
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
      subject: `Báo cáo vận hành ${filters.from} - ${filters.to}`,
      title: "Sunrise Parking - Báo cáo vận hành toàn hệ thống",
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

const createPdfBlob = (pdfMake, definition) =>
  new Promise((resolve) => {
    pdfMake.createPdf(definition).getBlob(resolve);
  });

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
  anchor.download = `sunrise-parking-system-report-${uniqueFilePart(filters.from)}-${uniqueFilePart(filters.to)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};
