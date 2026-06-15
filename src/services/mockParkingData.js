// Mock Data chung cho toàn bộ dự án bãi đỗ xe thông minh

export const mockVehicles = [
  { id: "V001", plate: "29A-123.45", type: "Xe máy", status: "Đã duyệt", package: "Gói tháng xe máy thường", expires: "2026-07-01", owner: "Nguyễn Văn A" },
  { id: "V002", plate: "30F-999.99", type: "Ô tô", status: "Đã duyệt", package: "Gói tháng ô tô VIP", expires: "2026-07-15", owner: "Nguyễn Văn A" },
  { id: "V003", plate: "51G-888.88", type: "Xe máy", status: "Chờ duyệt", package: "Chưa đăng ký", expires: "", owner: "Nguyễn Văn A" }
];

export const mockActiveSession = {
  id: "SESS-9982",
  plate: "30F-999.99",
  type: "Ô tô",
  checkInTime: "2026-06-07T14:30:00+07:00",
  slot: "C-05"
};

export const mockPackages = [
  { id: "PKG-01", name: "Gói xe máy thường", price: "100,000đ", duration: "30 ngày", type: "Xe máy" },
  { id: "PKG-02", name: "Gói ô tô tiêu chuẩn", price: "1,200,000đ", duration: "30 ngày", type: "Ô tô" },
  { id: "PKG-03", name: "Gói ô tô VIP", price: "2,000,000đ", duration: "30 ngày", type: "Ô tô" }
];

export const mockMotorbikeFloors = [
  { id: "FL-M1", name: "Tầng Hầm B1", type: "Xe máy", capacity: 500, parkedCount: 382, status: "Còn chỗ" },
  { id: "FL-M2", name: "Tầng Hầm B2", type: "Xe máy", capacity: 400, parkedCount: 400, status: "Đầy chỗ" }
];

// Bản đồ slot đỗ ô tô dạng rạp chiếu phim (30 slots)
// Trạng thái gồm: trống, đang dùng, đặt trước, bảo trì, xung đột
export const mockCarSlots = [
  { id: "C-01", status: "trống", plate: null, checkInTime: null },
  { id: "C-02", status: "đang dùng", plate: "30F-555.55", checkInTime: "2026-06-07T08:15:00+07:00" },
  { id: "C-03", status: "đặt trước", plate: null, checkInTime: null },
  { id: "C-04", status: "bảo trì", plate: null, checkInTime: null },
  { id: "C-05", status: "đang dùng", plate: "30F-999.99", checkInTime: "2026-06-07T14:30:00+07:00" }, // User's car
  { id: "C-06", status: "xung đột", plate: "29H-777.77 / 30L-111.11", checkInTime: "2026-06-07T12:00:00+07:00", warning: "Phát hiện đỗ chồng chéo" },
  { id: "C-07", status: "trống", plate: null, checkInTime: null },
  { id: "C-08", status: "đang dùng", plate: "29A-234.56", checkInTime: "2026-06-07T09:30:00+07:00" },
  { id: "C-09", status: "trống", plate: null, checkInTime: null },
  { id: "C-10", status: "đặt trước", plate: null, checkInTime: null },
  { id: "C-11", status: "trống", plate: null, checkInTime: null },
  { id: "C-12", status: "đang dùng", plate: "30A-888.88", checkInTime: "2026-06-07T10:00:00+07:00" },
  { id: "C-13", status: "trống", plate: null, checkInTime: null },
  { id: "C-14", status: "bảo trì", plate: null, checkInTime: null },
  { id: "C-15", status: "trống", plate: null, checkInTime: null },
  { id: "C-16", status: "đang dùng", plate: "29D-444.44", checkInTime: "2026-06-07T11:45:00+07:00" },
  { id: "C-17", status: "đang dùng", plate: "30E-222.22", checkInTime: "2026-06-07T13:10:00+07:00" },
  { id: "C-18", status: "trống", plate: null, checkInTime: null },
  { id: "C-19", status: "trống", plate: null, checkInTime: null },
  { id: "C-20", status: "đặt trước", plate: null, checkInTime: null },
  { id: "C-21", status: "trống", plate: null, checkInTime: null },
  { id: "C-22", status: "trống", plate: null, checkInTime: null },
  { id: "C-23", status: "đang dùng", plate: "29C-987.65", checkInTime: "2026-06-07T15:00:00+07:00" },
  { id: "C-24", status: "trống", plate: null, checkInTime: null },
  { id: "C-25", status: "xung đột", plate: "30K-444.44 / Không thẻ", checkInTime: "2026-06-07T16:20:00+07:00", warning: "Sai biển đăng ký" },
  { id: "C-26", status: "trống", plate: null, checkInTime: null },
  { id: "C-27", status: "trống", plate: null, checkInTime: null },
  { id: "C-28", status: "trống", plate: null, checkInTime: null },
  { id: "C-29", status: "đang dùng", plate: "30H-123.88", checkInTime: "2026-06-07T15:40:00+07:00" },
  { id: "C-30", status: "trống", plate: null, checkInTime: null }
];

export const mockViolations = [
  { id: "VIO-01", plate: "30F-555.55", type: "Đỗ sai vị trí vạch quy định", date: "2026-06-05", fine: "200,000đ", status: "Chưa thanh toán" },
  { id: "VIO-02", plate: "29A-234.56", type: "Quá hạn đỗ xe quy định", date: "2026-06-06", fine: "100,000đ", status: "Chưa thanh toán" },
  { id: "VIO-03", plate: "30A-888.88", type: "Làm hỏng dải chắn an toàn", date: "2026-06-04", fine: "500,000đ", status: "Đã thanh toán" }
];

export const mockBuildingInfo = {
  name: "Tòa nhà Smart Tower",
  address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
  hours: "06:00 - 23:30",
  desc: "Hệ thống bãi đỗ xe thông minh công nghệ cao hỗ trợ xe máy, ô tô phân cấp tầng và slot đỗ xe tự động.",
  status: "Đang hoạt động"
};

export const mockManagerFloors = [
  { id: "FL-B1", name: "Tầng B1", type: "Xe máy", capacity: 500, slotsCount: 0, status: "Đang hoạt động" },
  { id: "FL-B2", name: "Tầng B2", type: "Xe máy", capacity: 400, slotsCount: 0, status: "Đang hoạt động" },
  { id: "FL-B3", name: "Tầng B3", type: "Ô tô", capacity: 0, slotsCount: 30, status: "Đang hoạt động" }
];
