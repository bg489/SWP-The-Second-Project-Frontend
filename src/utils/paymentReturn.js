export const PAYMENT_RETURN_STORAGE_KEY = "parking_payment_return_path";

const PAYMENT_RETURN_ROUTES = new Set([
  "/user/qr-pass",
  "/staff/check-out",
]);

export const getPaymentReturnFromUrl = ({
  failureMessage = "Thanh toán chưa hoàn tất. Bạn có thể thử lại khi cần.",
  search = window.location.search,
  successMessage = "Thanh toán thành công.",
} = {}) => {
  const params = new URLSearchParams(search);
  const paymentStatus = params.get("paymentStatus");

  if (!paymentStatus) return null;

  const isSuccess = paymentStatus.toUpperCase() === "SUCCESS";

  return {
    tone: isSuccess ? "success" : "warning",
    message: isSuccess ? successMessage : failureMessage,
    responseCode: params.get("responseCode"),
    transactionRef: params.get("transactionRef"),
  };
};

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
    resultParams.forEach((value, key) => storedUrl.searchParams.set(key, value));

    return `${storedUrl.pathname}${storedUrl.search}${storedUrl.hash}`;
  } catch {
    return null;
  }
};

export const clearPaymentReturnState = () => {
  sessionStorage.removeItem(PAYMENT_RETURN_STORAGE_KEY);

  const url = new URL(window.location.href);
  url.searchParams.delete("paymentStatus");
  url.searchParams.delete("responseCode");
  url.searchParams.delete("transactionRef");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
};
