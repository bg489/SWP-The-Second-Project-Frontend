/**
 * @fileoverview Xây dựng màn hình UserParkingIssuesPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Car, CheckCircle2, MapPin, RefreshCcw, ShieldAlert } from "lucide-react";

import Button from "../../components/Button/Button";
import DeadlineCountdown from "../../components/Feedback/DeadlineCountdown";
import StatusBanner from "../../components/Feedback/StatusBanner";
import {
  fetchMyFloorMismatchCasesRequest,
  fetchMyNotificationsRequest,
  fetchMySlotRegistrationsRequest,
  fetchMyWrongSlotCasesRequest,
  markMyFloorMismatchMovedRequest,
  markMyWrongSlotMovedRequest,
} from "../backend/parking/parkingSlice";
import { formatDateTime } from "../../services/mockParkingData";
import "./UserParkingIssuesPage.css";

/**
 * Khai báo `wrongStatusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/UserParkingIssuesPage.jsx.
 */
const wrongStatusLabels = {
  ALLOWED: "Được phép đậu, không tính phí",
  WAITING_USER: "Đang chờ dời xe",
  USER_MOVED: "Đã dời xe đúng hạn",
  PENALIZED: "Đã quá hạn và tính phí",
  CANCELLED: "Đã hủy",
};

/**
 * Khai báo `floorStatusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/UserParkingIssuesPage.jsx.
 */
const floorStatusLabels = {
  LOCKED_AND_PENALIZED: "Đã khóa xe và tính phí",
  WAITING_USER: "Đang chờ dời xe",
  USER_MOVED: "Đã dời xe đúng hạn",
  TOWED: "Đã đưa xe về ô chỉ định",
  CANCELLED: "Đã hủy",
};

/**
 * Khai báo `restorationLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/UserParkingIssuesPage.jsx.
 */
const restorationLabels = {
  NONE: "Chưa cần gán ô tạm",
  TEMP_ASSIGNED: "Đang sử dụng ô được gán tạm",
  WAITING_RESERVED_EXIT: "Ô gốc đã trống, chờ xe rời ô tạm",
  RESTORED: "Đã khôi phục ô đăng ký ban đầu",
};

/**
 * Thực hiện nghiệp vụ `toneForStatus` (tone for status). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function toneForStatus
 * @param {*} status - Giá trị `status` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const toneForStatus = (status) => {
  if (["USER_MOVED", "ALLOWED"].includes(status)) return "success";
  if (status === "WAITING_USER") return "warning";
  return "danger";
};

/**
 * Thực hiện nghiệp vụ `UserParkingIssuesPage` (user parking issues page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function UserParkingIssuesPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const UserParkingIssuesPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  const {
    floorMismatchCases,
    notice,
    slotRegistrations,
    wrongSlotCases,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.parking);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    /**
     * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function refresh
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const refresh = () => {
      dispatch(fetchMyWrongSlotCasesRequest());
      dispatch(fetchMyFloorMismatchCasesRequest());
      dispatch(fetchMySlotRegistrationsRequest());
    };

    refresh();
    const timer = window.setInterval(refresh, 5000);
    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearInterval(timer);
  }, [dispatch]);

  const activeIssueCount = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => [
      ...(wrongSlotCases.myItems || []),
      ...(floorMismatchCases.myItems || []),
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    ].filter((item) => item.status === "WAITING_USER").length,
    [floorMismatchCases.myItems, wrongSlotCases.myItems]
  );

  return (
    <div className="parking-page user-parking-issues-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ShieldAlert size={16} /> Xử lý chỗ đỗ</div>
          <h1 className="page-title">Theo dõi xe đậu sai ô hoặc sai khu</h1>
          <p className="page-subtitle">
            Xem ảnh minh chứng, thời hạn dời xe, ô được gán tạm và quá trình trả lại ô đăng ký.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Cần xử lý</span>
          <span className="page-hero-number">{activeIssueCount}</span>
          <span className="page-hero-label">trường hợp</span>
        </div>
      </section>

      <StatusBanner
        success={notice}
        errors={[
          wrongSlotCases.error,
          floorMismatchCases.error,
          slotRegistrations.error,
        ]}
      />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Ô tô đậu sai ô</h2>
            <p className="section-copy">
              Hiển thị cả trường hợp xe của bạn đậu nhầm và trường hợp ô đăng ký của bạn bị xe khác chiếm.
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            onClick={() => dispatch(fetchMyWrongSlotCasesRequest())}
          >
            Làm mới
          </Button>
        </div>

        <div className="parking-issue-grid">
          {(wrongSlotCases.myItems || []).map((item) => {
            const isReservedOwner = Number(item.reservedUserId) === Number(user?.id);
            const isOffender = Number(item.userId) === Number(user?.id);

            return (
              <article className="parking-issue-card" key={`wrong-${item.id}`}>
                <div className="parking-issue-head">
                  <div>
                    <span>{isReservedOwner ? "Ô đăng ký bị chiếm" : "Xe đậu nhầm ô"}</span>
                    <h3>
                      {isReservedOwner
                        ? item.originalSlotCode || item.observedSlotCode
                        : item.plateNumber}
                    </h3>
                  </div>
                  <span className={`pill ${toneForStatus(item.status)}`}>
                    {wrongStatusLabels[item.status] || item.status}
                  </span>
                </div>

                {item.status === "WAITING_USER" && (
                  <DeadlineCountdown deadline={item.notifyUntil} status={item.status} />
                )}

                <div className="parking-issue-details">
                  <div><span>Xe đang chiếm ô</span><strong>{item.plateNumber || "-"}</strong></div>
                  <div><span>Ô bị chiếm</span><strong>{item.observedSlotCode || "-"}</strong></div>
                  {isReservedOwner && (
                    <>
                      <div><span>Xe đã đăng ký ô</span><strong>{item.reservedPlateNumber || "-"}</strong></div>
                      <div><span>Ô đang được giữ</span><strong>{item.reservedCurrentSlotCode || item.reassignedSlotCode || item.observedSlotCode || "-"}</strong></div>
                      <div><span>Tiến trình trả ô</span><strong>{restorationLabels[item.restorationStatus] || "Đang theo dõi"}</strong></div>
                    </>
                  )}
                  <div><span>Thời điểm ghi nhận</span><strong>{formatDateTime(item.createdAt)}</strong></div>
                </div>

                {item.evidenceUrl && (
                  <img className="parking-issue-evidence" src={item.evidenceUrl} alt="Ảnh xe đậu sai ô" />
                )}

                {isOffender && item.status === "WAITING_USER" && (
                  <Button
                    variant="primary"
                    icon={CheckCircle2}
                    loading={wrongSlotCases.movingId === item.id}
                    onClick={() => {
                      dispatch(markMyWrongSlotMovedRequest({ id: item.id }));
                      dispatch(fetchMyNotificationsRequest());
                    }}
                  >
                    Tôi đã dời xe
                  </Button>
                )}
              </article>
            );
          })}

          {!wrongSlotCases.loading && (wrongSlotCases.myItems || []).length === 0 && (
            <div className="empty-state">Bạn chưa có trường hợp đậu sai ô nào.</div>
          )}
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><AlertTriangle size={19} /> Xe đậu sai khu</h2>
            <p className="section-copy">
              Ô tô có 15 phút để dời về ô chỉ định; xe máy vào khu ô tô được nhân viên đưa về vị trí an toàn.
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            onClick={() => dispatch(fetchMyFloorMismatchCasesRequest())}
          >
            Làm mới
          </Button>
        </div>

        <div className="parking-issue-grid">
          {(floorMismatchCases.myItems || []).map((item) => (
            <article className="parking-issue-card" key={`floor-${item.id}`}>
              <div className="parking-issue-head">
                <div>
                  <span>{item.vehicleType === "CAR" ? "Ô tô sai khu" : "Xe máy sai khu"}</span>
                  <h3>{item.plateNumber}</h3>
                </div>
                <span className={`pill ${toneForStatus(item.status)}`}>
                  {floorStatusLabels[item.status] || item.status}
                </span>
              </div>

              {item.status === "WAITING_USER" && (
                <DeadlineCountdown deadline={item.notifyUntil} status={item.status} />
              )}

              <div className="parking-issue-details">
                <div><span><MapPin size={14} /> Khu đang đậu</span><strong>{item.observedFloorName || "-"}</strong></div>
                <div><span>Khu đúng</span><strong>{item.originalFloorName || "-"}</strong></div>
                <div><span>Ô cần đưa xe về</span><strong>{item.targetSlotCode || item.originalSlotCode || "-"}</strong></div>
                <div><span>Thời điểm ghi nhận</span><strong>{formatDateTime(item.createdAt)}</strong></div>
              </div>

              {item.evidenceUrl && (
                <img className="parking-issue-evidence" src={item.evidenceUrl} alt="Ảnh xe đậu sai khu" />
              )}

              {item.vehicleType === "CAR" && item.status === "WAITING_USER" && (
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  loading={floorMismatchCases.movingId === item.id}
                  onClick={() => dispatch(markMyFloorMismatchMovedRequest({ id: item.id }))}
                >
                  Tôi đã đưa xe về đúng ô
                </Button>
              )}
            </article>
          ))}

          {!floorMismatchCases.loading && (floorMismatchCases.myItems || []).length === 0 && (
            <div className="empty-state">Bạn chưa có trường hợp đậu sai khu nào.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserParkingIssuesPage;
