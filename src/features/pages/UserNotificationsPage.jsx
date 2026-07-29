import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Eye, Image, RefreshCcw } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import Select from "../../components/Form/Select";
import {
  fetchMyNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "../backend/parking/parkingSlice";
import { formatDateTime } from "../../services/mockParkingData";
import "./UserNotificationsPage.css";

const PAGE_SIZE = 10;

const getNotificationTarget = (item) => {
  if (item.relatedType === "WRONG_SLOT_CASE") {
    return `/user/parking-issues?type=wrong-slot&id=${item.relatedId || ""}`;
  }

  if (item.relatedType === "FLOOR_MISMATCH_CASE") {
    return `/user/parking-issues?type=floor-mismatch&id=${item.relatedId || ""}`;
  }

  if (item.relatedType === "BUILDING_CHANGE_REQUEST") {
    return "/user/building-change";
  }

  if (item.relatedType === "VEHICLE") {
    return "/user/profile";
  }

  return "";
};

const UserNotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications } = useSelector((state) => state.parking);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyNotificationsRequest());
    const timer = window.setInterval(() => {
      dispatch(fetchMyNotificationsRequest());
    }, 15000);

    return () => window.clearInterval(timer);
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!status) return notifications.mine || [];
    return (notifications.mine || []).filter((item) => item.status === status);
  }, [notifications.mine, status]);
  const unreadCount = (notifications.mine || []).filter(
    (item) => item.status === "UNREAD"
  ).length;
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visibleItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const openNotification = (item) => {
    if (item.status === "UNREAD") {
      dispatch(markNotificationReadRequest({ id: item.id }));
    }

    const target = getNotificationTarget(item);
    if (target) navigate(target);
  };

  return (
    <div className="parking-page user-notifications-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Bell size={16} /> Thông báo của tôi</div>
          <h1 className="page-title">Theo dõi mọi thay đổi liên quan đến xe</h1>
          <p className="page-subtitle">
            Đọc thông báo về tài khoản, phương tiện, chỗ đỗ và mở thẳng nội dung cần xử lý.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Chưa đọc</span>
          <span className="page-hero-number">{unreadCount}</span>
          <span className="page-hero-label">thông báo</span>
        </div>
      </section>

      <StatusBanner errors={notifications.error} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Bell size={19} /> Danh sách thông báo</h2>
            <p className="section-copy">{filtered.length} thông báo phù hợp.</p>
          </div>
          <div className="action-row">
            <Button
              variant="outline"
              icon={RefreshCcw}
              loading={notifications.loading}
              onClick={() => dispatch(fetchMyNotificationsRequest())}
            >
              Làm mới
            </Button>
            <Button
              variant="secondary"
              icon={CheckCheck}
              loading={notifications.markingAll}
              disabled={unreadCount === 0}
              onClick={() => dispatch(markAllNotificationsReadRequest())}
            >
              Đọc tất cả
            </Button>
          </div>
        </div>

        <div className="notification-page-filter">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả thông báo" },
              { value: "UNREAD", label: "Chưa đọc" },
              { value: "READ", label: "Đã đọc" },
              { value: "ACTION_TAKEN", label: "Đã xử lý" },
            ]}
            placeholder={null}
          />
        </div>

        <div className="notification-page-list">
          {visibleItems.map((item) => {
            const target = getNotificationTarget(item);

            return (
              <article
                className={`notification-page-item ${item.status === "UNREAD" ? "unread" : ""}`}
                key={item.id}
              >
                <div className="notification-page-icon">
                  {item.evidenceUrl ? <Image size={21} /> : <Bell size={21} />}
                </div>
                <div className="notification-page-content">
                  <div className="notification-page-title">
                    <strong>{item.title}</strong>
                    <span className={`pill ${item.status === "UNREAD" ? "warning" : "success"}`}>
                      {item.status === "UNREAD" ? "Chưa đọc" : "Đã đọc"}
                    </span>
                  </div>
                  <p>{item.message}</p>
                  <time>{formatDateTime(item.createdAt)}</time>
                </div>
                {item.evidenceUrl && (
                  <img
                    className="notification-page-evidence"
                    src={item.evidenceUrl}
                    alt="Ảnh minh chứng"
                  />
                )}
                <Button
                  size="sm"
                  variant={target ? "primary" : "outline"}
                  icon={Eye}
                  loading={notifications.updatingId === item.id}
                  onClick={() => openNotification(item)}
                >
                  {target ? "Xem chi tiết" : "Đánh dấu đã đọc"}
                </Button>
              </article>
            );
          })}

          {!notifications.loading && visibleItems.length === 0 && (
            <div className="empty-state">Chưa có thông báo phù hợp.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <Button
              size="sm"
              variant="outline"
              disabled={safePage <= 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              Trước
            </Button>
            <span>Trang {safePage}/{totalPages}</span>
            <Button
              size="sm"
              variant="outline"
              disabled={safePage >= totalPages}
              onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
            >
              Sau
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserNotificationsPage;
