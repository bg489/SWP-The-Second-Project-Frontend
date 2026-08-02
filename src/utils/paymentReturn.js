/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong paymentReturn.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/**
 * Khai báo `PAYMENT_RETURN_STORAGE_KEY` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/paymentReturn.js.
 */
export const PAYMENT_RETURN_STORAGE_KEY = "parking_payment_return_path";

/**
 * Khai báo `PAYMENT_RETURN_ROUTES` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/paymentReturn.js.
 */
const PAYMENT_RETURN_ROUTES = new Set([
  "/user/qr-pass",
  "/user/slot-reservations",
  "/staff/check-out",
  "/staff/slot-reservations",
]);

/**
 * Lấy nghiệp vụ `getPaymentReturnFromUrl` (get payment return from url). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function getPaymentReturnFromUrl
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const getPaymentReturnFromUrl = ({
  failureMessage = "Thanh toán chưa hoàn tất. Bạn có thể thử lại khi cần.",
  search = window.location.search,
  successMessage = "Thanh toán thành công.",
} = {}) => {
  const params = new URLSearchParams(search);
  const paymentStatus = params.get("paymentStatus");

  if (!paymentStatus) return null;

  const isSuccess = paymentStatus.toUpperCase() === "SUCCESS";
  const smsStatus = params.get("smsStatus")?.toUpperCase() || "";
  const smsError = params.get("smsError") || "";

  return {
    tone: isSuccess ? "success" : "warning",
    message: isSuccess ? successMessage : failureMessage,
    responseCode: params.get("responseCode"),
    smsStatus,
    smsWarning:
      smsStatus === "FAILED"
        ? `Thanh toán đã được ghi nhận nhưng chưa gửi được SMS: ${
            smsError || "Máy chủ chưa kết nối được dịch vụ SMS."
          }`
        : smsStatus === "PREVIEW"
          ? "SMS mới chỉ được kiểm tra thử và chưa gửi đến điện thoại của khách."
          : "",
    transactionRef: params.get("transactionRef"),
  };
};

/**
 * Lấy nghiệp vụ `getStoredPaymentReturnTarget` (get stored payment return target). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function getStoredPaymentReturnTarget
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const getStoredPaymentReturnTarget = ({ pathname, search }) => {
  const paymentResult = getPaymentReturnFromUrl({ search });
  const storedPath = sessionStorage.getItem(PAYMENT_RETURN_STORAGE_KEY);

  if (!paymentResult || !storedPath) return null;

  try {
    const storedUrl = new URL(storedPath, window.location.origin);

    if (
      storedUrl.origin !== window.location.origin ||
      !PAYMENT_RETURN_ROUTES.has(storedUrl.pathname) ||
      storedUrl.pathname === pathname
    ) {
      return null;
    }

    const resultParams = new URLSearchParams(search);
    /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    resultParams.forEach((value, key) => storedUrl.searchParams.set(key, value));

    return `${storedUrl.pathname}${storedUrl.search}${storedUrl.hash}`;
  } catch {
    return null;
  }
};

/**
 * Xóa hoặc đặt lại nghiệp vụ `clearPaymentReturnState` (clear payment return state). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function clearPaymentReturnState
 * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
 */
export const clearPaymentReturnState = () => {
  sessionStorage.removeItem(PAYMENT_RETURN_STORAGE_KEY);

  const url = new URL(window.location.href);
  url.searchParams.delete("paymentStatus");
  url.searchParams.delete("responseCode");
  url.searchParams.delete("smsError");
  url.searchParams.delete("smsStatus");
  url.searchParams.delete("transactionRef");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
};
