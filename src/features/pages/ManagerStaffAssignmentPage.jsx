/**
 * @fileoverview Xây dựng màn hình ManagerStaffAssignmentPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Camera,
  FileCheck2,
  History,
  KeyRound,
  Mail,
  Phone,
  RefreshCcw,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import { compressImageFile } from "../../utils/imageFile";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import {
  clearStaffRoleRequestNotice,
  fetchManagerStaffRoleRequestsRequest,
  submitStaffRoleRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

/**
 * Khai báo `emptyForm` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/ManagerStaffAssignmentPage.jsx.
 */
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  portraitImageUrl: "",
  managerNote: "",
};

/**
 * Khai báo `requestStatus` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/ManagerStaffAssignmentPage.jsx.
 */
const requestStatus = {
  PENDING: { label: "Đang chờ duyệt", className: "warning" },
  APPROVED: { label: "Đã tạo tài khoản", className: "success" },
  REJECTED: { label: "Đã từ chối", className: "danger" },
  CANCELLED: { label: "Đã hủy", className: "neutral" },
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDate` (format date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDate
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

/**
 * Thực hiện nghiệp vụ `ManagerStaffAssignmentPage` (manager staff assignment page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ManagerStaffAssignmentPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ManagerStaffAssignmentPage = () => {
  const dispatch = useDispatch();
  const { buildings, loading: buildingsLoading, error: buildingsError } = useSelector(
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (state) => state.buildings
  );
  const {
    error,
    managerLoading,
    managerRequests,
    notice,
    submitting,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.staffRoleRequests);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [processingImage, setProcessingImage] = useState(false);

  const activeBuildingId = selectedBuildingId || String(buildings[0]?.id || "");
  const selectedBuilding = buildings.find(
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (building) => Number(building.id) === Number(activeBuildingId)
  ) || null;

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!activeBuildingId) return;
    dispatch(fetchManagerStaffRoleRequestsRequest({
      buildingId: Number(activeBuildingId),
    }));
  }, [activeBuildingId, dispatch]);

  const buildingOptions = useMemo(
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => buildings.map((building) => ({
      value: String(building.id),
      label: `${building.name}${building.address ? ` - ${building.address}` : ""}`,
    })),
    [buildings]
  );
  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const pendingCount = managerRequests.filter((request) => request.status === "PENDING").length;
  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const approvedCount = managerRequests.filter((request) => request.status === "APPROVED").length;

  const markSubmitted = useResetAfterSuccess({
    submitting,
    success: notice,
    error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    onSuccess: () => {
      setForm(emptyForm);
      setFormErrors({});
    },
  });

  /**
   * Cập nhật nghiệp vụ `updateForm` (update form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateForm = (field, value) => {
    dispatch(clearStaffRoleRequestNotice());
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((current) => ({ ...current, [field]: value }));
    /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  /**
   * Xử lý nghiệp vụ `handlePortrait` (handle portrait). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handlePortrait
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
   */
  const handlePortrait = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setProcessingImage(true);
    /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFormErrors((current) => ({ ...current, portraitImageUrl: "" }));
    try {
      const portraitImageUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 1200,
        maxLength: 850_000,
      });
      updateForm("portraitImageUrl", portraitImageUrl);
    } catch (imageError) {
      /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setForm((current) => ({ ...current, portraitImageUrl: "" }));
      /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setFormErrors((current) => ({
        ...current,
        portraitImageUrl: imageError.message || "Không chuẩn bị được ảnh chân dung.",
      }));
    } finally {
      setProcessingImage(false);
    }
  };

  /**
   * Kiểm tra nghiệp vụ `validate` (validate). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function validate
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const validate = () => {
    const nextErrors = {};
    if (!activeBuildingId) nextErrors.buildingId = "Vui lòng chọn tòa nhà làm việc.";
    if (form.name.trim().length < 2) nextErrors.name = "Vui lòng nhập họ tên đầy đủ.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Email không hợp lệ.";
    }
    if (form.phone.trim() && !/^0\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
    }
    if (form.password.length < 6) nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!form.portraitImageUrl) nextErrors.portraitImageUrl = "Vui lòng thêm ảnh chân dung rõ khuôn mặt.";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /**
   * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(clearStaffRoleRequestNotice());
    if (!validate()) return;

    markSubmitted();
    dispatch(submitStaffRoleRequest({
      buildingId: Number(activeBuildingId),
      email: form.email.trim(),
      managerNote: form.managerNote.trim() || undefined,
      name: form.name.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      portraitImageUrl: form.portraitImageUrl,
      refreshParams: { buildingId: Number(activeBuildingId) },
    }));
  };

  const columns = [
    {
      header: "Nhân viên đề nghị",
      key: "userName",
      minWidth: "220px",
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
        </div>
      ),
    },
    {
      header: "Tòa nhà làm việc",
      key: "buildingName",
      minWidth: "190px",
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
      header: "Tài khoản Staff",
      key: "userId",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (request) => request.userId ? `#${request.userId}` : "Chưa được tạo",
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
        const meta = requestStatus[request.status] || requestStatus.PENDING;
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
      render: (request) => formatDate(request.createdAt),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><UserPlus size={16} /> Tài khoản Staff độc lập</div>
          <h1 className="page-title">Đề nghị tạo tài khoản nhân viên mới</h1>
          <p className="page-subtitle">
            Manager gửi hồ sơ của nhân viên cần tuyển. Khi Admin duyệt, hệ thống tạo một tài khoản Staff mới và không thay đổi bất kỳ tài khoản cư dân nào.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang chờ duyệt</span>
          <span className="page-hero-number">{pendingCount}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={[buildingsError, error]} />

      <section className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-label">Hồ sơ đã gửi</div>
          <div className="metric-value">{managerRequests.length}</div>
          <div className="metric-note">Tại tòa nhà đang chọn</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tài khoản đã tạo</div>
          <div className="metric-value">{approvedCount}</div>
          <div className="metric-note">Staff đã được Admin duyệt</div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><FileCheck2 size={19} /> Hồ sơ tạo tài khoản Staff</h2>
            <p className="section-copy">
              Email và số điện thoại phải chưa thuộc tài khoản nào. Mật khẩu tạm thời chỉ được lưu dưới dạng mã hóa trong thời gian chờ duyệt.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="filter-grid">
            <FormField label="Tòa nhà làm việc" required error={formErrors.buildingId}>
              <Select
                value={activeBuildingId}
                onChange={(event) => {
                  setSelectedBuildingId(event.target.value);
                  setFormErrors((current) => ({ ...current, buildingId: "" }));
                }}
                options={buildingOptions}
                placeholder="Chọn tòa nhà"
                disabled={buildingsLoading || submitting}
              />
            </FormField>
            <FormField label="Họ tên nhân viên" required error={formErrors.name}>
              <Input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Nguyễn Văn A"
                disabled={submitting}
              />
            </FormField>
            <FormField label="Email đăng nhập" required error={formErrors.email}>
              <Input
                type="email"
                icon={Mail}
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="staff@sunrise.vn"
                disabled={submitting}
              />
            </FormField>
            <FormField label="Số điện thoại" error={formErrors.phone}>
              <Input
                icon={Phone}
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value.replace(/\D/g, ""))}
                placeholder="0901234567"
                disabled={submitting}
              />
            </FormField>
            <FormField label="Mật khẩu tạm thời" required error={formErrors.password}>
              <Input
                type="password"
                icon={KeyRound}
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField label="Ảnh chân dung hồ sơ Staff" required error={formErrors.portraitImageUrl}>
            <label className="staff-portrait-upload">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePortrait}
                disabled={processingImage || submitting}
              />
              {form.portraitImageUrl ? (
                <img src={form.portraitImageUrl} alt="Ảnh chân dung nhân viên" />
              ) : (
                <span>
                  <Camera size={28} />
                  <strong>{processingImage ? "Đang chuẩn bị ảnh..." : "Chọn ảnh chân dung"}</strong>
                  <small>Ảnh rõ khuôn mặt, dùng riêng trong hồ sơ nghề nghiệp</small>
                </span>
              )}
            </label>
          </FormField>

          <FormField label="Ghi chú cho Admin">
            <textarea
              className="form-input"
              rows="3"
              maxLength="1000"
              value={form.managerNote}
              onChange={(event) => updateForm("managerNote", event.target.value)}
              placeholder="Kinh nghiệm, ca làm việc hoặc thông tin cần Admin lưu ý..."
              disabled={submitting}
            />
          </FormField>

          <div className="action-row">
            <Button type="submit" icon={Send} loading={submitting} disabled={submitting || processingImage}>
              Gửi hồ sơ duyệt
            </Button>
            <span className="metric-note">
              <ShieldCheck size={15} /> Tài khoản chỉ được sinh sau khi Admin chấp thuận.
            </span>
          </div>
        </form>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><History size={19} /> Lịch sử đề nghị</h2>
            <p className="section-copy">Theo dõi hồ sơ tại {selectedBuilding?.name || "tòa nhà đang chọn"}.</p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={managerLoading}
            onClick={() => activeBuildingId && dispatch(fetchManagerStaffRoleRequestsRequest({
              buildingId: Number(activeBuildingId),
            }))}
          >
            Làm mới
          </Button>
        </div>
        <Table
          columns={columns}
          data={managerRequests}
          loading={managerLoading}
          emptyMessage="Chưa có đề nghị tạo tài khoản Staff tại tòa nhà này."
        />
      </section>
    </div>
  );
};

export default ManagerStaffAssignmentPage;
