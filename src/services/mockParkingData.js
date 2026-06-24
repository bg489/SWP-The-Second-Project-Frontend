export const ROLE_KEYS = {
  USER: "USER",
  PARKING_STAFF: "PARKING_STAFF",
  PARKING_MANAGER: "PARKING_MANAGER",
  ADMIN: "ADMIN",
};

export const roleLabels = {
  USER: "Cư dân",
  PARKING_STAFF: "Nhân viên bãi xe",
  PARKING_MANAGER: "Quản lý bãi xe",
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên bãi xe",
  MANAGER: "Quản lý bãi xe",
};

export const roleHomePaths = {
  USER: "/user/dashboard",
  PARKING_STAFF: "/staff/dashboard",
  PARKING_MANAGER: "/manager/dashboard",
  ADMIN: "/admin/dashboard",
};

export const buildingInfo = {
  id: 1,
  name: "Sunrise Residence Parking",
  address: "Tòa A, khu đô thị Sunrise, Quận 7, TP. Hồ Chí Minh",
  hours: "05:30 - 23:30",
  status: "ACTIVE",
  manager: "Phạm Minh Châu",
  hotline: "1900 2208",
  description:
    "Hệ thống quản lý tòa nhà gửi xe bằng QR. Xe máy quản lý theo sức chứa, ô tô quản lý theo từng ô đỗ cụ thể.",
};

export const floors = [
  {
    id: 1,
    code: "B1-MB",
    name: "Tầng B1 - Xe máy cư dân",
    buildingId: 1,
    floorType: "MOTORBIKE",
    capacity: 320,
    currentCount: 268,
    slotsCount: 0,
    status: "ACTIVE",
    note: "Ưu tiên cư dân có gói tháng trong giờ cao điểm.",
  },
  {
    id: 2,
    code: "B2-MB",
    name: "Tầng B2 - Xe máy khách",
    buildingId: 1,
    floorType: "MOTORBIKE",
    capacity: 240,
    currentCount: 217,
    slotsCount: 0,
    status: "ACTIVE",
    note: "Nhận khách vãng lai bằng QR/session card tạm.",
  },
  {
    id: 3,
    code: "B3-CAR",
    name: "Tầng B3 - Ô tô",
    buildingId: 1,
    floorType: "CAR",
    capacity: 0,
    currentCount: 27,
    slotsCount: 36,
    status: "ACTIVE",
    note: "Gán ô đỗ cụ thể, nhân viên xác nhận trước khi xe vào.",
  },
];

export const carSlots = Array.from({ length: 36 }, (_, index) => {
  const slotNo = String(index + 1).padStart(2, "0");
  const statusMap = {
    1: ["OCCUPIED", "51G-222.18", "2026-06-11T06:42:00+07:00"],
    2: ["OCCUPIED", "30F-999.99", "2026-06-11T07:10:00+07:00"],
    3: ["RESERVED", "51H-120.45", null],
    4: ["AVAILABLE", null, null],
    5: ["MAINTENANCE", null, null],
    6: ["CONFLICT", "51K-888.88 / 30A-111.22", "2026-06-11T08:05:00+07:00"],
    9: ["OCCUPIED", "51G-776.51", "2026-06-11T08:31:00+07:00"],
    12: ["RESERVED", "30E-258.66", null],
    14: ["OCCUPIED", "29A-558.16", "2026-06-11T09:44:00+07:00"],
    18: ["LOCKED", null, null],
    21: ["OCCUPIED", "51F-902.31", "2026-06-11T10:03:00+07:00"],
    25: ["CONFLICT", "Không khớp QR", "2026-06-11T10:40:00+07:00"],
    29: ["OCCUPIED", "30H-123.88", "2026-06-11T11:10:00+07:00"],
    33: ["RESERVED", "51A-999.19", null],
  };

  const [status, plateNumber, checkInAt] = statusMap[index + 1] || ["AVAILABLE", null, null];

  return {
    id: index + 1,
    floorId: 3,
    slotCode: `C-${slotNo}`,
    status,
    plateNumber,
    checkInAt,
    sizeLabel: index % 6 === 0 ? "Large" : "Standard",
    note: status === "CONFLICT" ? "Nhân viên cần kiểm tra thực tế và ghi nhận vi phạm nếu cần." : "",
  };
});

export const users = [
  {
    id: 1,
    name: "Nguyễn An",
    email: "nguyen.an@example.com",
    phone: "0901 222 333",
    role: "USER",
    buildingId: 1,
    status: "ACTIVE",
    createdAt: "2026-06-01",
  },
  {
    id: 2,
    name: "Trần Bảo",
    email: "staff@example.com",
    phone: "0908 444 111",
    role: "PARKING_STAFF",
    buildingId: 1,
    status: "ACTIVE",
    createdAt: "2026-05-24",
  },
  {
    id: 3,
    name: "Phạm Minh Châu",
    email: "manager@example.com",
    phone: "0903 111 555",
    role: "PARKING_MANAGER",
    buildingId: 1,
    status: "ACTIVE",
    createdAt: "2026-05-19",
  },
  {
    id: 4,
    name: "Lê Hoàng Duy",
    email: "admin@example.com",
    phone: "0909 888 777",
    role: "ADMIN",
    buildingId: null,
    status: "ACTIVE",
    createdAt: "2026-05-10",
  },
  {
    id: 5,
    name: "Vũ Thanh Mai",
    email: "mai.vu@example.com",
    phone: "0912 777 888",
    role: "USER",
    buildingId: 1,
    status: "PENDING_REVIEW",
    createdAt: "2026-06-10",
  },
];

export const vehicles = [
  {
    id: 101,
    userId: 1,
    owner: "Nguyễn An",
    plateNumber: "59S1-223.45",
    vehicleType: "MOTORBIKE",
    brand: "Honda SH",
    color: "Trắng",
    status: "APPROVED",
    buildingId: 1,
  },
  {
    id: 102,
    userId: 1,
    owner: "Nguyễn An",
    plateNumber: "30F-999.99",
    vehicleType: "CAR",
    brand: "Mazda CX-5",
    color: "Đen",
    status: "APPROVED",
    buildingId: 1,
  },
  {
    id: 103,
    userId: 1,
    owner: "Nguyễn An",
    plateNumber: "51G-888.88",
    vehicleType: "MOTORBIKE",
    brand: "Yamaha Janus",
    color: "Xanh",
    status: "PENDING",
    buildingId: 1,
  },
  {
    id: 104,
    userId: 5,
    owner: "Vũ Thanh Mai",
    plateNumber: "51K-888.88",
    vehicleType: "CAR",
    brand: "Toyota Vios",
    color: "Bạc",
    status: "PENDING",
    buildingId: 1,
  },
  {
    id: 105,
    userId: 5,
    owner: "Vũ Thanh Mai",
    plateNumber: "59B2-665.20",
    vehicleType: "MOTORBIKE",
    brand: "Vision",
    color: "Đỏ",
    status: "REJECTED",
    buildingId: 1,
  },
];

export const monthlyPasses = [
  {
    id: 501,
    userId: 1,
    vehicleId: 101,
    vehicleType: "MOTORBIKE",
    plateNumber: "59S1-223.45",
    packageName: "Gói tháng xe máy",
    amount: 120000,
    status: "ACTIVE",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    qrCode: "QR-MB-59S1-22345",
  },
  {
    id: 502,
    userId: 1,
    vehicleId: 102,
    vehicleType: "CAR",
    plateNumber: "30F-999.99",
    packageName: "Gói tháng ô tô B3",
    amount: 1800000,
    status: "ACTIVE",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    qrCode: "QR-CAR-30F-99999",
  },
  {
    id: 503,
    userId: 5,
    vehicleId: 104,
    vehicleType: "CAR",
    plateNumber: "51K-888.88",
    packageName: "Gói tháng ô tô B3",
    amount: 1800000,
    status: "EXPIRED",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    qrCode: "QR-CAR-51K-88888",
  },
];

export const monthlyPackages = [
  { id: "PKG-MB", name: "Gói tháng xe máy", vehicleType: "MOTORBIKE", price: 120000, duration: "30 ngày" },
  { id: "PKG-CAR", name: "Gói tháng ô tô B3", vehicleType: "CAR", price: 1800000, duration: "30 ngày" },
  { id: "PKG-CAR-VIP", name: "Gói ô tô ô ưu tiên", vehicleType: "CAR", price: 2400000, duration: "30 ngày" },
];

export const slotRegistrations = [
  {
    id: 701,
    userId: 1,
    vehicleId: 102,
    plateNumber: "30F-999.99",
    vehicleType: "CAR",
    buildingId: 1,
    floorId: 3,
    slotId: 2,
    slotCode: "C-02",
    amount: 1800000,
    status: "PAID",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
  },
  {
    id: 702,
    userId: 1,
    vehicleId: 103,
    plateNumber: "51G-888.88",
    vehicleType: "MOTORBIKE",
    buildingId: 1,
    floorId: 1,
    slotId: null,
    slotCode: null,
    amount: 120000,
    status: "PENDING_PAYMENT",
    startDate: null,
    endDate: null,
  },
];

export const tempQrCards = [
  { id: "TMP-001", label: "QR tạm 001", status: "READY", currentSessionId: null, note: "Sẵn sàng phát cho khách vãng lai." },
  { id: "TMP-002", label: "QR tạm 002", status: "IN_USE", currentSessionId: "SESS-1002", note: "Đang gắn với khách ô tô." },
  { id: "TMP-003", label: "QR tạm 003", status: "RETURNED", currentSessionId: null, note: "Đã hoàn tất, có thể tái sử dụng." },
  { id: "TMP-004", label: "QR tạm 004", status: "LOCKED", currentSessionId: null, note: "Mất/hỏng, tạm khóa." },
];

export const parkingSessions = [
  {
    id: "SESS-1001",
    userId: 1,
    vehicleId: 102,
    plateNumber: "30F-999.99",
    vehicleType: "CAR",
    customerType: "REGISTERED_USER",
    pricingType: "MONTHLY_PASS",
    status: "ACTIVE",
    floorId: 3,
    floorName: "Tầng B3 - Ô tô",
    slotCode: "C-02",
    qrCardId: "QR-CAR-30F-99999",
    checkInAt: "2026-06-11T07:10:00+07:00",
    checkOutAt: null,
    baseFee: 0,
    violationFee: 0,
    totalAmount: 0,
    paymentStatus: "WAIVED",
  },
  {
    id: "SESS-1002",
    userId: null,
    vehicleId: null,
    plateNumber: "51G-776.51",
    vehicleType: "CAR",
    customerType: "WALK_IN_GUEST",
    pricingType: "HOURLY",
    status: "ACTIVE",
    floorId: 3,
    floorName: "Tầng B3 - Ô tô",
    slotCode: "C-09",
    qrCardId: "TMP-002",
    checkInAt: "2026-06-11T08:31:00+07:00",
    checkOutAt: null,
    baseFee: 0,
    violationFee: 0,
    totalAmount: 0,
    paymentStatus: "UNPAID",
  },
  {
    id: "SESS-1003",
    userId: null,
    vehicleId: null,
    plateNumber: "59X2-812.77",
    vehicleType: "MOTORBIKE",
    customerType: "WALK_IN_GUEST",
    pricingType: "TURN",
    status: "ACTIVE",
    floorId: 2,
    floorName: "Tầng B2 - Xe máy khách",
    slotCode: null,
    qrCardId: "TMP-006",
    checkInAt: "2026-06-11T10:20:00+07:00",
    checkOutAt: null,
    baseFee: 0,
    violationFee: 0,
    totalAmount: 0,
    paymentStatus: "UNPAID",
  },
  {
    id: "SESS-0990",
    userId: null,
    vehicleId: null,
    plateNumber: "30H-123.88",
    vehicleType: "CAR",
    customerType: "WALK_IN_GUEST",
    pricingType: "HOURLY",
    status: "PENDING_PAYMENT",
    floorId: 3,
    floorName: "Tầng B3 - Ô tô",
    slotCode: "C-29",
    qrCardId: "TMP-010",
    checkInAt: "2026-06-11T06:50:00+07:00",
    checkOutAt: "2026-06-11T11:35:00+07:00",
    baseFee: 100000,
    violationFee: 300000,
    totalAmount: 400000,
    paymentStatus: "PENDING",
  },
];

export const violations = [
  {
    id: "VIO-01",
    sessionId: "SESS-0990",
    plateNumber: "30H-123.88",
    vehicleType: "CAR",
    type: "Ô tô chiếm ô đã đặt trước",
    detectedAt: "2026-06-11T10:58:00+07:00",
    staffName: "Trần Bảo",
    fine: 300000,
    status: "UNPAID",
    note: "Xe đỗ sang C-33, ảnh hưởng ô đã đặt.",
  },
  {
    id: "VIO-02",
    sessionId: "SESS-1002",
    plateNumber: "51G-776.51",
    vehicleType: "CAR",
    type: "Đậu lệch vạch",
    detectedAt: "2026-06-11T09:42:00+07:00",
    staffName: "Trần Bảo",
    fine: 0,
    status: "WARNING",
    note: "Nhắc nhở, chưa tính phí phạt.",
  },
  {
    id: "VIO-03",
    sessionId: "SESS-1003",
    plateNumber: "59X2-812.77",
    vehicleType: "MOTORBIKE",
    type: "Xe máy đi sai tầng",
    detectedAt: "2026-06-11T10:41:00+07:00",
    staffName: "Lý Hải",
    fine: 50000,
    status: "UNPAID",
    note: "Đi vào khu cư dân B1 khi dùng QR khách.",
  },
];

export const payments = [
  {
    id: 9001,
    slotRegistrationId: 701,
    parkingSessionId: null,
    provider: "VNPAY",
    amount: 1800000,
    status: "SUCCESS",
    transactionRef: "VNP-202606010701",
    payDate: "20260601101544",
  },
  {
    id: 9002,
    slotRegistrationId: 702,
    parkingSessionId: null,
    provider: "VNPAY",
    amount: 120000,
    status: "PENDING",
    transactionRef: "VNP-202606110702",
    payDate: null,
  },
  {
    id: 9003,
    slotRegistrationId: null,
    parkingSessionId: "SESS-0990",
    provider: "CASH",
    amount: 400000,
    status: "PENDING",
    transactionRef: "CASH-SESS-0990",
    payDate: null,
  },
];

export const reportSummary = {
  date: "2026-06-11",
  trafficIn: 842,
  trafficOut: 791,
  revenueToday: 17840000,
  revenueMonth: 224650000,
  monthlyPassRevenue: 142800000,
  walkInRevenue: 61850000,
  violationRevenue: 3200000,
  activeQrPasses: 186,
  expiringQrPasses: 24,
  expiredQrPasses: 11,
};

export const revenueSeries = [
  { label: "T2", value: 128 },
  { label: "T3", value: 146 },
  { label: "T4", value: 171 },
  { label: "T5", value: 203 },
  { label: "T6", value: 225 },
];

export const pricingPolicy = {
  motorbikeTurn: 4000,
  carHourly: 20000,
  lostQrFine: 100000,
  wrongSlotFine: 300000,
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN", { hour12: false }) : "-";

export const getVehicleTypeLabel = (type) => (type === "CAR" ? "Ô tô" : "Xe máy");

export const getStatusTone = (status) => {
  const normalized = String(status || "").toUpperCase();
  if (["ACTIVE", "APPROVED", "PAID", "SUCCESS", "AVAILABLE", "READY", "RETURNED"].includes(normalized)) return "success";
  if (["PENDING", "PENDING_PAYMENT", "PENDING_REVIEW", "RESERVED", "IN_USE", "WARNING", "OPEN", "RESOLVED"].includes(normalized)) return "warning";
  if (["REJECTED", "FAILED", "EXPIRED", "CANCELLED", "CONFLICT", "LOCKED", "MAINTENANCE", "UNPAID", "LOST"].includes(normalized)) return "danger";
  return "neutral";
};

export const statusLabels = {
  ACTIVE: "Đang hoạt động",
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  PENDING_REVIEW: "Chờ kiểm tra",
  REJECTED: "Từ chối",
  PAID: "Đã thanh toán",
  PENDING_PAYMENT: "Chờ thanh toán",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
  AVAILABLE: "Trống",
  OCCUPIED: "Đang dùng",
  RESERVED: "Đã đặt",
  MAINTENANCE: "Bảo trì",
  LOCKED: "Tạm khóa",
  CONFLICT: "Xung đột",
  READY: "Sẵn sàng",
  IN_USE: "Đang sử dụng",
  RETURNED: "Đã trả",
  COMPLETED: "Đã hoàn tất",
  LOST: "Mất thẻ",
  UNPAID: "Chưa thanh toán",
  WARNING: "Cảnh báo",
  WAIVED: "Miễn phí",
  OPEN: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  COLLECTED: "Đã thu tiền",
  INACTIVE: "Ngưng hoạt động",
};

export const getStatusLabel = (status) => statusLabels[status] || status || "-";
