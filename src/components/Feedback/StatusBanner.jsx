/**
 * @fileoverview Cung cấp component giao diện tái sử dụng StatusBanner và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import "./StatusBanner.css";

/**
 * Khai báo `DISPLAY_MS` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/components/Feedback/StatusBanner.jsx.
 */
const DISPLAY_MS = 10000;

/**
 * Khai báo `bannerStore` để định nghĩa câu truy vấn SQL nền và ánh xạ các cột dữ liệu cho những thao tác bên dưới.
 * Phạm vi sử dụng: src/components/Feedback/StatusBanner.jsx.
 */
const bannerStore = {
  entries: new Map(),
  listeners: new Set(),
  timers: new Map(),
  snapshot: { version: 0, now: 0 },

  /**
   * Thực hiện nghiệp vụ `anonymousCallback` (anonymous callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function anonymousCallback
   * @param {*} listener - Giá trị `listener` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => this.listeners.delete(listener);
  },

  /**
   * Thực hiện nghiệp vụ `anonymousCallback` (anonymous callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function anonymousCallback
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  getSnapshot() {
    return this.snapshot;
  },

  /**
   * Thực hiện nghiệp vụ `anonymousCallback` (anonymous callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function anonymousCallback
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  publish() {
    this.snapshot = {
      version: this.snapshot.version + 1,
      now: Date.now(),
    };
    /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    this.listeners.forEach((listener) => listener());
  },

  /**
   * Thực hiện nghiệp vụ `anonymousCallback` (anonymous callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function anonymousCallback
   * @param {*} signature - Giá trị `signature` được hàm sử dụng trong quá trình xử lý.
   * @param {*} expiresAt - Giá trị `expiresAt` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  schedule(signature, expiresAt) {
    if (this.timers.has(signature)) {
      window.clearTimeout(this.timers.get(signature));
    }

    const remaining = Math.max(0, expiresAt - Date.now());
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setTimeout(() => {
      this.publish();
      this.timers.delete(signature);
    }, remaining + 50);

    this.timers.set(signature, timer);
  },

  /**
   * Thực hiện nghiệp vụ `anonymousCallback` (anonymous callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function anonymousCallback
   * @param {*} signature - Giá trị `signature` được hàm sử dụng trong quá trình xử lý.
   * @param {*} routeKey - Giá trị `routeKey` được hàm sử dụng trong quá trình xử lý.
   * @param {*} forceNew - Giá trị `forceNew` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  ensure(signature, routeKey, forceNew = false) {
    const existing = this.entries.get(signature);

    if (existing && !forceNew) {
      this.schedule(signature, existing.expiresAt);
      this.publish();
      return;
    }

    const entry = {
      routeKey,
      expiresAt: Date.now() + DISPLAY_MS,
    };

    this.entries.set(signature, entry);
    this.schedule(signature, entry.expiresAt);
    this.publish();
  },
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeMessages` (normalize messages). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeMessages
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeMessages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
};

/**
 * Khai báo `toneMeta` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/components/Feedback/StatusBanner.jsx.
 */
const toneMeta = {
  success: {
    icon: CheckCircle2,
    title: "Thành công",
  },
  error: {
    icon: XCircle,
    title: "Có lỗi xảy ra",
  },
  warning: {
    icon: AlertTriangle,
    title: "Cần chú ý",
  },
  info: {
    icon: Info,
    title: "Thông tin",
  },
};

/**
 * Thực hiện nghiệp vụ `StatusBanner` (status banner). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function StatusBanner
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const StatusBanner = ({
  success,
  errors,
  warning,
  info,
  className = "",
}) => {
  const location = useLocation();
  const routeKey = location.pathname;
  const snapshot = useSyncExternalStore(
    /* Callback nội bộ của lời gọi `useSyncExternalStore`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (listener) => bannerStore.subscribe(listener),
    /* Callback nội bộ của lời gọi `useSyncExternalStore`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => bannerStore.getSnapshot(),
    /* Callback nội bộ của lời gọi `useSyncExternalStore`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => bannerStore.getSnapshot()
  );
  const sawEmptyRef = useRef(false);

  const groups = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () =>
      [
        { tone: "success", messages: normalizeMessages(success) },
        { tone: "error", messages: normalizeMessages(errors) },
        { tone: "warning", messages: normalizeMessages(warning) },
        { tone: "info", messages: normalizeMessages(info) },
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ].filter((group) => group.messages.length > 0),
    [errors, info, success, warning]
  );

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const signature = useMemo(() => {
    if (groups.length === 0) return "";
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return JSON.stringify(groups.map((group) => [group.tone, group.messages]));
  }, [groups]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!signature) {
      sawEmptyRef.current = true;
      return;
    }

    bannerStore.ensure(signature, routeKey, sawEmptyRef.current);
    sawEmptyRef.current = false;
  }, [routeKey, signature]);

  const entry = signature ? bannerStore.entries.get(signature) : null;
  const isVisible = Boolean(
    signature &&
    entry &&
    entry.routeKey === routeKey &&
    entry.expiresAt > snapshot.now
  );

  if (!isVisible) return null;

  return (
    <section className={`status-stack ${className}`.trim()} aria-live="polite">
      {groups.map((group) => {
        const meta = toneMeta[group.tone];
        const Icon = meta.icon;

        return (
          <div className={`status-banner ${group.tone}`} key={group.tone}>
            <div className="status-icon">
              <Icon size={24} strokeWidth={2.6} />
            </div>
            <div className="status-content">
              <div className="status-title">{meta.title}</div>
              <div className="status-messages">
                {group.messages.map((message, index) => (
                  <p key={`${group.tone}-${index}`}>{message}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default StatusBanner;
