/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong phone.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/**
 * Khai báo `VIETNAM_PHONE_PATTERN` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/phone.js.
 */
export const VIETNAM_PHONE_PATTERN = /^0\d{9}$/;

/**
 * Thực hiện nghiệp vụ `sanitizeVietnamPhoneInput` (sanitize vietnam phone input). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function sanitizeVietnamPhoneInput
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const sanitizeVietnamPhoneInput = (value) =>
  String(value || "").replace(/\D/g, "").slice(0, 10);

/**
 * Kiểm tra nghiệp vụ `isValidOptionalVietnamPhone` (is valid optional vietnam phone). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function isValidOptionalVietnamPhone
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const isValidOptionalVietnamPhone = (value) => {
  const phone = String(value || "").trim();
  return !phone || VIETNAM_PHONE_PATTERN.test(phone);
};

/**
 * Khai báo `VIETNAM_PHONE_ERROR` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/phone.js.
 */
export const VIETNAM_PHONE_ERROR =
  "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng 0.";
