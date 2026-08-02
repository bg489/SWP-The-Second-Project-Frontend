/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong useResetAfterSuccess.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useCallback, useEffect, useRef } from "react";

/**
 * Thực hiện nghiệp vụ `useResetAfterSuccess` (use reset after success). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function useResetAfterSuccess
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const useResetAfterSuccess = ({
  submitting,
  success,
  error,
  onSuccess,
}) => {
  const pendingRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!pendingRef.current || submitting) return;

    if (success) {
      pendingRef.current = false;
      onSuccessRef.current?.();
      return;
    }

    if (error) {
      pendingRef.current = false;
    }
  }, [error, submitting, success]);

  /* Callback nội bộ của lời gọi `useCallback`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  return useCallback(() => {
    pendingRef.current = true;
  }, []);
};

export default useResetAfterSuccess;
