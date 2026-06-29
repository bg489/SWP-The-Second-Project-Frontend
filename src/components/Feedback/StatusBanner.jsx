import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import "./StatusBanner.css";

const DISPLAY_MS = 10000;

const bannerStore = {
  entries: new Map(),
  listeners: new Set(),
  timers: new Map(),
  snapshot: { version: 0, now: 0 },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  getSnapshot() {
    return this.snapshot;
  },

  publish() {
    this.snapshot = {
      version: this.snapshot.version + 1,
      now: Date.now(),
    };
    this.listeners.forEach((listener) => listener());
  },

  schedule(signature, expiresAt) {
    if (this.timers.has(signature)) {
      window.clearTimeout(this.timers.get(signature));
    }

    const remaining = Math.max(0, expiresAt - Date.now());
    const timer = window.setTimeout(() => {
      this.publish();
      this.timers.delete(signature);
    }, remaining + 50);

    this.timers.set(signature, timer);
  },

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

const normalizeMessages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
};

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
    (listener) => bannerStore.subscribe(listener),
    () => bannerStore.getSnapshot(),
    () => bannerStore.getSnapshot()
  );
  const sawEmptyRef = useRef(false);

  const groups = useMemo(
    () =>
      [
        { tone: "success", messages: normalizeMessages(success) },
        { tone: "error", messages: normalizeMessages(errors) },
        { tone: "warning", messages: normalizeMessages(warning) },
        { tone: "info", messages: normalizeMessages(info) },
      ].filter((group) => group.messages.length > 0),
    [errors, info, success, warning]
  );

  const signature = useMemo(() => {
    if (groups.length === 0) return "";
    return JSON.stringify(groups.map((group) => [group.tone, group.messages]));
  }, [groups]);

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
