import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import "./DeadlineCountdown.css";

const getRemainingSeconds = (deadline, now = Date.now()) => {
  if (!deadline) return 0;
  return Math.max(Math.ceil((new Date(deadline).getTime() - now) / 1000), 0);
};

const formatRemaining = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const DeadlineCountdown = ({
  compact = false,
  deadline,
  status,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const waiting = status === "WAITING_USER";
  const remaining = useMemo(
    () => getRemainingSeconds(deadline, now),
    [deadline, now]
  );

  useEffect(() => {
    if (!waiting || !deadline) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline, waiting]);

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
