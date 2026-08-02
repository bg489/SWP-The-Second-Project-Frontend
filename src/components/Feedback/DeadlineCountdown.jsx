/**
 * @fileoverview Cung cấp component giao diện tái sử dụng DeadlineCountdown và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import "./DeadlineCountdown.css";

/**
 * Lấy nghiệp vụ `getRemainingSeconds` (get remaining seconds). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getRemainingSeconds
 * @param {*} deadline - Giá trị `deadline` được hàm sử dụng trong quá trình xử lý.
 * @param {*} now - Giá trị `now` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getRemainingSeconds = (deadline, now = Date.now()) => {
  if (!deadline) return 0;
  return Math.max(Math.ceil((new Date(deadline).getTime() - now) / 1000), 0);
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatRemaining` (format remaining). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatRemaining
 * @param {*} seconds - Giá trị `seconds` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatRemaining = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

/**
 * Thực hiện nghiệp vụ `DeadlineCountdown` (deadline countdown). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function DeadlineCountdown
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const DeadlineCountdown = ({
  compact = false,
  deadline,
  status,
}) => {
  /* Callback nội bộ của lời gọi `useState`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const [now, setNow] = useState(() => Date.now());
  const waiting = status === "WAITING_USER";
  const remaining = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => getRemainingSeconds(deadline, now),
    [deadline, now]
  );

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!waiting || !deadline) return undefined;

    /* Callback nội bộ của lời gọi `setInterval`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearInterval(timer);
  }, [deadline, waiting]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const content = useMemo(() => {
    if (!waiting) return "Đã kết thúc đếm ngược";
    if (remaining <= 0) return "Đang tự động xử lý quá hạn";
    return `Còn ${formatRemaining(remaining)}`;
  }, [remaining, waiting]);

  return (
    <span
      className={`deadline-countdown ${compact ? "compact" : ""} ${
        waiting && remaining <= 60 ? "urgent" : ""
      }`}
      aria-live="polite"
    >
      <Clock3 size={compact ? 14 : 17} />
      {content}
    </span>
  );
};

export default DeadlineCountdown;
