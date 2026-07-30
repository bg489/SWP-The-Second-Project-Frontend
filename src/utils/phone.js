export const VIETNAM_PHONE_PATTERN = /^0\d{9}$/;

export const sanitizeVietnamPhoneInput = (value) =>
  String(value || "").replace(/\D/g, "").slice(0, 10);

export const isValidOptionalVietnamPhone = (value) => {
  const phone = String(value || "").trim();
  return !phone || VIETNAM_PHONE_PATTERN.test(phone);
};

export const VIETNAM_PHONE_ERROR =
  "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng 0.";
