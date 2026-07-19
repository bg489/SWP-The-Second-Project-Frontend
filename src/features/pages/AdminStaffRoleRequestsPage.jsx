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
  RefreshCcw,
  Search,
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

const statusOptions = [
  { value: "PENDING", label: "Đang chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả hồ sơ" },
];

const statusMeta = {
  PENDING: { label: "Đang chờ duyệt", className: "warning" },
  APPROVED: { label: "Đã duyệt", className: "success" },
  REJECTED: { label: "Đã từ chối", className: "danger" },
  CANCELLED: { label: "Đã hủy", className: "neutral" },
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const AdminStaffRoleRequestsPage = () => {
  const dispatch = useDispatch();
  const {
    actionId,
    actionType,
    adminLoading,
    adminRequests,
    error,
    notice,
  } = useSelector((state) => state.staffRoleRequests);
  const [status, setStatus] = useState("PENDING");
  const [keyword, setKeyword] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [dialogError, setDialogError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminStaffRoleRequestsRequest(status ? { status } : {}));
  }, [dispatch, status]);

  const rows = useMemo(() => {
    const q = normalizeText(keyword.trim());
    if (!q) return adminRequests;

    return adminRequests.filter((request) =>
      [
        request.userName,
        request.userEmail,
        request.userPhone,
        request.managerName,
        request.managerEmail,
        request.buildingName,
      ].some((value) => normalizeText(value).includes(q))
    );
  }, [adminRequests, keyword]);
  const reviewRequest = selectedRequest
    ? adminRequests.find((request) => Number(request.id) === Number(selectedRequest.id)) || null
    : null;

  const openReview = (request) => {
    setSelectedRequest(request);
    setAdminNote("");
    setDialogError("");
  };

  const approve = () => {
    if (!selectedRequest) return;
    setDialogError("");
    dispatch(approveStaffRoleRequest({
      id: selectedRequest.id,
      adminNote: adminNote.trim() || undefined,
    }));
  };

  const reject = () => {
    if (!selectedRequest) return;
    if (!adminNote.trim()) {
      setDialogError("Vui lòng ghi rõ lý do để quản lý biết cần bổ sung điều gì.");
      return;
    }

    setDialogError("");
    dispatch(rejectStaffRoleRequest({
      id: selectedRequest.id,
      adminNote: adminNote.trim(),
    }));
  };

  const columns = [
    {
      header: "Ảnh chân dung",
      key: "portraitImageUrl",
      minWidth: "125px",
      render: (request) => (
        <button
          type="button"
          className="staff-role-portrait-button"
          onClick={() => openReview(request)}
          aria-label={`Xem ảnh chân dung của ${request.userName}`}
        >
          <img src={request.portraitImageUrl} alt={`Chân dung ${request.userName}`} />
          <span><Eye size={14} /> Xem ảnh</span>
        </button>
      ),
    },
    {
      header: "Người được đề nghị",
      key: "userName",
      minWidth: "230px",
      render: (request) => (
        <div className="request-person-copy">
          <strong>{request.userName || "Chưa cập nhật họ tên"}</strong>
          <small>Mã tài khoản #{request.userId}</small>
          <span className="metric-note">{request.userEmail}</span>
          <span className="metric-note">{request.userPhone || "Chưa có số điện thoại"}</span>
        </div>
      ),
    },
    {
      header: "Nơi làm việc",
      key: "buildingName",
      minWidth: "220px",
      render: (request) => (
        <>
          <strong>{request.buildingName}</strong>
          <br />
          <span className="metric-note">{request.buildingAddress || "Chưa có địa chỉ"}</span>
        </>
      ),
    },
    {
      header: "Người đề nghị",
      key: "managerName",
      minWidth: "210px",
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
      render: (request) => {
        const meta = statusMeta[request.status] || statusMeta.PENDING;
        return <span className={`pill ${meta.className}`}>{meta.label}</span>;
      },
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      minWidth: "145px",
      render: (request) => formatDateTime(request.createdAt),
    },
    {
      header: "Thao tác",
      key: "actions",
      minWidth: "145px",
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
          <div className="page-eyebrow"><UserCheck size={16} /> Duyệt nhân viên</div>
          <h1 className="page-title">Kiểm tra hồ sơ đề nghị nhân viên</h1>
          <p className="page-subtitle">
            Đối chiếu ảnh chân dung, thông tin cá nhân, tài khoản, tòa nhà và người quản lý gửi đề nghị trước khi cấp quyền.
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
            <p className="section-copy">Có thể tìm theo người dùng, người quản lý hoặc tòa nhà.</p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={adminLoading}
            onClick={() => dispatch(fetchAdminStaffRoleRequestsRequest(status ? { status } : {}))}
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
              placeholder="Nhập tên, email hoặc tòa nhà"
              icon={Search}
            />
          </FormField>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><FileCheck2 size={19} /> Danh sách hồ sơ</h2>
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
          onMouseDown={() => !actionId && setSelectedRequest(null)}
        >
          <section
            className="staff-role-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Hồ sơ đề nghị nhân viên ${selectedRequest.userName}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="image-review-close"
              onClick={() => setSelectedRequest(null)}
              disabled={Boolean(actionId)}
              aria-label="Đóng hồ sơ"
            >
              <X size={22} />
            </button>

            <header className="staff-role-review-header">
              <div>
                <span className="page-eyebrow"><Camera size={15} /> Hồ sơ chân dung</span>
                <h2>{selectedRequest.userName}</h2>
                <p>Đề nghị làm nhân viên tại {selectedRequest.buildingName}</p>
              </div>
              <span className={`pill ${(statusMeta[selectedRequest.status] || statusMeta.PENDING).className}`}>
                {(statusMeta[selectedRequest.status] || statusMeta.PENDING).label}
              </span>
            </header>

            <div className="staff-role-review-grid">
              <div className="staff-role-review-photo">
                <img
                  src={selectedRequest.portraitImageUrl}
                  alt={`Ảnh chân dung ${selectedRequest.userName}`}
                />
                <span>Ảnh này sẽ trở thành ảnh đại diện sau khi duyệt</span>
              </div>

              <div className="staff-role-review-details">
                <section>
                  <h3><UserCheck size={17} /> Thông tin cá nhân và tài khoản</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Họ tên</strong>{selectedRequest.userName}</span>
                    <span><strong>Email</strong>{selectedRequest.userEmail}</span>
                    <span><strong>Số điện thoại</strong>{selectedRequest.userPhone || "Chưa cập nhật"}</span>
                    <span><strong>Hồ sơ xe</strong>{Number(selectedRequest.vehicleCount || 0)} xe</span>
                    <span><strong>Ngày tham gia</strong>{formatDateTime(selectedRequest.userCreatedAt)}</span>
                  </div>
                </section>

                <section>
                  <h3><Building2 size={17} /> Nơi làm việc</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Tòa nhà</strong>{selectedRequest.buildingName}</span>
                    <span><strong>Địa chỉ</strong>{selectedRequest.buildingAddress || "Chưa cập nhật"}</span>
                  </div>
                </section>

                <section>
                  <h3><FileCheck2 size={17} /> Người gửi đề nghị</h3>
                  <div className="staff-role-detail-list">
                    <span><strong>Quản lý</strong>{selectedRequest.managerName}</span>
                    <span><strong>Liên hệ</strong>{selectedRequest.managerEmail}</span>
                    <span><strong>Ngày gửi</strong>{formatDateTime(selectedRequest.createdAt)}</span>
                  </div>
                  <p className="staff-role-manager-note">
                    {selectedRequest.managerNote || "Người quản lý không để lại ghi chú."}
                  </p>
                </section>
              </div>
            </div>

            {selectedRequest.status === "PENDING" ? (
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
                    placeholder="Ghi nội dung cần phản hồi cho người quản lý..."
                    disabled={Boolean(actionId)}
                  />
                </FormField>
                <div className="action-row">
                  <Button
                    variant="outline"
                    icon={XCircle}
                    disabled={Boolean(actionId)}
                    loading={actionId === selectedRequest.id && actionType === "REJECT"}
                    onClick={reject}
                  >
                    Từ chối hồ sơ
                  </Button>
                  <Button
                    icon={CheckCircle2}
                    loading={actionId === selectedRequest.id && actionType === "APPROVE"}
                    disabled={Boolean(actionId)}
                    onClick={approve}
                  >
                    Duyệt thành nhân viên
                  </Button>
                </div>
              </footer>
            ) : (
              <footer className="staff-role-review-result">
                <CalendarDays size={18} />
                <span>
                  Xử lý lúc {formatDateTime(selectedRequest.reviewedAt)}
                  {selectedRequest.adminNote ? ` - ${selectedRequest.adminNote}` : ""}
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
