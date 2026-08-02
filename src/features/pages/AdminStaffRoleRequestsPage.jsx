/**
 * @fileoverview Xây dựng màn hình AdminStaffRoleRequestsPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  FileCheck2,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import {
  approveStaffRoleRequest,
  fetchAdminStaffRoleRequestsRequest,
  rejectStaffRoleRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/AdminStaffRoleRequestsPage.jsx.
 */
const statusOptions = [
  { value: "PENDING", label: "Đang chờ duyệt" },
  { value: "APPROVED", label: "Đã tạo tài khoản" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả hồ sơ" },
];

/**
 * Khai báo `statusMeta` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/AdminStaffRoleRequestsPage.jsx.
 */
const statusMeta = {
  PENDING: { label: "Đang chờ duyệt", className: "warning" },
  APPROVED: { label: "Đã tạo tài khoản", className: "success" },
  REJECTED: { label: "Đã từ chối", className: "danger" },
  CANCELLED: { label: "Đã hủy", className: "neutral" },
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDateTime` (format date time). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDateTime
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatDateTime = (value) => value
  ? new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
  : "-";

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeText` (normalize text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeText
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeText = (value) => String(value || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

/**
 * Thực hiện nghiệp vụ `AdminStaffRoleRequestsPage` (admin staff role requests page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function AdminStaffRoleRequestsPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AdminStaffRoleRequestsPage = () => {
  const dispatch = useDispatch();
  const {
    actionId,
    actionType,
    adminLoading,
    adminRequests,
    error,
    notice,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.staffRoleRequests);
  const [status, setStatus] = useState("PENDING");
  const [keyword, setKeyword] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [dialogError, setDialogError] = useState("");

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchAdminStaffRoleRequestsRequest({ status: status || undefined }));
  }, [dispatch, status]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const rows = useMemo(() => {
    const q = normalizeText(keyword.trim());
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return adminRequests.filter((request) => {
      if (status && request.status !== status) return false;
      if (!q) return true;
      return [
        request.userName,
        request.userEmail,
        request.userPhone,
        request.managerName,
        request.managerEmail,
        request.buildingName,
      /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ].some((value) => normalizeText(value).includes(q));
    });
  }, [adminRequests, keyword, status]);

  const reviewRequest = selectedRequestId
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    ? adminRequests.find((request) => Number(request.id) === Number(selectedRequestId)) || null
    : null;

  /**
   * Hiển thị nghiệp vụ `openReview` (open review). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function openReview
   * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const openReview = (request) => {
    setSelectedRequestId(request.id);
    setAdminNote("");
    setDialogError("");
  };

  /**
   * Thực hiện nghiệp vụ `approve` (approve). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function approve
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const approve = () => {
    if (!reviewRequest) return;
    setDialogError("");
    dispatch(approveStaffRoleRequest({
      id: reviewRequest.id,
      adminNote: adminNote.trim() || undefined,
    }));
  };

  /**
   * Thực hiện nghiệp vụ `reject` (reject). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function reject
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const reject = () => {
    if (!reviewRequest) return;
    if (!adminNote.trim()) {
      setDialogError("Vui lòng ghi rõ lý do để Manager biết cần bổ sung điều gì.");
      return;
    }

    setDialogError("");
    dispatch(rejectStaffRoleRequest({
      id: reviewRequest.id,
      adminNote: adminNote.trim(),
    }));
  };

  const columns = [
    {
      header: "Ảnh chân dung",
      key: "portraitImageUrl",
      minWidth: "125px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => (
        <button
          type="button"
          className="staff-role-portrait-button"
          onClick={() => openReview(request)}
          aria-label={`Xem ảnh chân dung của ${request.userName}`}
        >
          {request.portraitImageUrl ? (
            <img src={request.portraitImageUrl} alt={`Chân dung ${request.userName}`} />
          ) : (
            <span className="staff-role-portrait-placeholder">
              {String(request.userName || "N").charAt(0)}
            </span>
          )}
          <span><Eye size={14} /> Xem hồ sơ</span>
        </button>
      ),
    },
    {
      header: "Tài khoản được đề nghị",
      key: "userName",
      minWidth: "240px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => (
        <div className="request-person-copy">
          <strong>{request.userName}</strong>
          <span className="metric-note">{request.userEmail}</span>
          <span className="metric-note">{request.userPhone || "Chưa có số điện thoại"}</span>
          {request.userId && <small>Tài khoản Staff #{request.userId}</small>}
        </div>
      ),
    },
    {
      header: "Nơi làm việc",
      key: "buildingName",
      minWidth: "210px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => (
        <>
          <strong>{request.buildingName}</strong>
          <br />
          <span className="metric-note">{request.buildingAddress || "Chưa có địa chỉ"}</span>
        </>
      ),
    },
    {
      header: "Manager đề nghị",
      key: "managerName",
      minWidth: "210px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => (
        <div className="request-person-copy">
          <strong>{request.managerName}</strong>
          <small>{request.managerEmail}</small>
          <small>{request.managerPhone || "Chưa có số điện thoại"}</small>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      key: "status",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => {
        const meta = statusMeta[request.status] || statusMeta.PENDING;
        return <span className={`pill ${meta.className}`}>{meta.label}</span>;
      },
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => formatDateTime(request.createdAt),
    },
    {
      header: "Thao tác",
      key: "actions",
      minWidth: "145px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => (
        <Button size="sm" icon={FileCheck2} onClick={() => openReview(request)}>
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><UserCheck size={16} /> Duyệt tài khoản Staff</div>
          <h1 className="page-title">Kiểm tra hồ sơ nhân viên mới</h1>
          <p className="page-subtitle">
            Mỗi hồ sơ được duyệt sẽ tạo một tài khoản Staff mới hoàn toàn. Hệ thống không lấy tài khoản User và cũng không đổi quyền của cư dân.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang hiển thị</span>
          <span className="page-hero-number">{rows.length}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={[error, dialogError]} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Search size={19} /> Tìm hồ sơ cần kiểm tra</h2>
            <p className="section-copy">Tìm theo nhân viên, Manager đề nghị hoặc tòa nhà làm việc.</p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={adminLoading}
            onClick={() => dispatch(fetchAdminStaffRoleRequestsRequest({
              status: status || undefined,
            }))}
          >
            Làm mới
          </Button>
        </div>

        <div className="filter-grid">
          <FormField label="Trạng thái">
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={statusOptions}
              placeholder={null}
            />
          </FormField>
          <FormField label="Tìm kiếm">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên, email, Manager hoặc tòa nhà"
              icon={Search}
            />
          </FormField>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><FileCheck2 size={19} /> Danh sách hồ sơ tạo Staff</h2>
            <p className="section-copy">Mỗi hồ sơ chỉ được xử lý một lần.</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={rows}
          loading={adminLoading}
          emptyMessage="Không có hồ sơ phù hợp."
        />
      </section>

      {reviewRequest && createPortal(
        <div
          className="staff-role-review-backdrop"
          role="presentation"
          onMouseDown={() => !actionId && setSelectedRequestId(null)}
        >
          <section
            className="staff-role-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Hồ sơ tạo tài khoản Staff cho ${reviewRequest.userName}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="image-review-close"
              onClick={() => setSelectedRequestId(null)}
              disabled={Boolean(actionId)}
              aria-label="Đóng hồ sơ"
            >
              <X size={22} />
            </button>

            <header className="staff-role-review-header">
              <div>
                <span className="page-eyebrow"><ShieldCheck size={15} /> Tài khoản Staff độc lập</span>
                <h2>{reviewRequest.userName}</h2>
                <p>Đề nghị làm nhân viên tại {reviewRequest.buildingName}</p>
              </div>
              <span className={`pill ${(statusMeta[reviewRequest.status] || statusMeta.PENDING).className}`}>
                {(statusMeta[reviewRequest.status] || statusMeta.PENDING).label}
              </span>
            </header>

            <div className="staff-role-review-grid">
              <div className="staff-role-review-photo">
                {reviewRequest.portraitImageUrl ? (
                  <img src={reviewRequest.portraitImageUrl} alt={`Ảnh chân dung ${reviewRequest.userName}`} />
                ) : (
                  <div className="staff-role-review-photo-empty">
                    <Camera size={38} />
                    <span>Chưa có ảnh hồ sơ nhân viên</span>
                  </div>
                )}
                <span>Ảnh hồ sơ nghề nghiệp, tách biệt với ảnh đại diện cá nhân.</span>
              </div>

              <div className="staff-role-review-details">
                <section>
                  <h3><UserCheck size={17} /> Thông tin tài khoản sẽ tạo</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Họ tên</strong>{reviewRequest.userName}</span>
                    <span><strong><Mail size={14} /> Email</strong>{reviewRequest.userEmail}</span>
                    <span><strong><Phone size={14} /> Số điện thoại</strong>{reviewRequest.userPhone || "Không cung cấp"}</span>
                    <span><strong>Vai trò</strong>Staff</span>
                    <span><strong>Mã tài khoản</strong>{reviewRequest.userId ? `#${reviewRequest.userId}` : "Sinh sau khi duyệt"}</span>
                  </div>
                </section>

                <section>
                  <h3><Building2 size={17} /> Nơi làm việc</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Tòa nhà</strong>{reviewRequest.buildingName}</span>
                    <span><strong>Địa chỉ</strong>{reviewRequest.buildingAddress || "Chưa cập nhật"}</span>
                  </div>
                </section>

                <section>
                  <h3><FileCheck2 size={17} /> Người gửi đề nghị</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Manager</strong>{reviewRequest.managerName}</span>
                    <span><strong>Liên hệ</strong>{reviewRequest.managerEmail}</span>
                    <span><strong>Ngày gửi</strong>{formatDateTime(reviewRequest.createdAt)}</span>
                  </div>
                  <p className="staff-role-manager-note">
                    {reviewRequest.managerNote || "Manager không để lại ghi chú."}
                  </p>
                </section>
              </div>
            </div>

            {reviewRequest.status === "PENDING" ? (
              <footer className="staff-role-review-actions">
                <FormField label="Ghi chú hoặc lý do từ chối" error={dialogError || undefined}>
                  <textarea
                    className="form-input"
                    rows="3"
                    maxLength="1000"
                    value={adminNote}
                    onChange={(event) => {
                      setAdminNote(event.target.value);
                      setDialogError("");
                    }}
                    placeholder="Ghi nội dung phản hồi cho Manager..."
                    disabled={Boolean(actionId)}
                  />
                </FormField>
                <div className="action-row">
                  <Button
                    variant="outline"
                    icon={XCircle}
                    disabled={Boolean(actionId)}
                    loading={actionId === reviewRequest.id && actionType === "REJECT"}
                    onClick={reject}
                  >
                    Từ chối hồ sơ
                  </Button>
                  <Button
                    icon={CheckCircle2}
                    loading={actionId === reviewRequest.id && actionType === "APPROVE"}
                    disabled={Boolean(actionId)}
                    onClick={approve}
                  >
                    Duyệt và tạo tài khoản
                  </Button>
                </div>
              </footer>
            ) : (
              <footer className="staff-role-review-result">
                <CalendarDays size={18} />
                <span>
                  Xử lý lúc {formatDateTime(reviewRequest.reviewedAt)}
                  {reviewRequest.adminNote ? ` - ${reviewRequest.adminNote}` : ""}
                </span>
              </footer>
            )}
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminStaffRoleRequestsPage;
