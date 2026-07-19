import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Camera,
  FileCheck2,
  History,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  Send,
  UserPlus,
  Users,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import { compressImageFile } from "../../utils/imageFile";
import {
  assignStaffToBuildingRequest,
  clearParkingNotice,
  fetchStaffAssignmentsRequest,
} from "../backend/parking/parkingSlice";
import {
  clearStaffRoleRequestNotice,
  fetchManagerStaffRoleRequestsRequest,
  fetchStaffRoleCandidatesRequest,
  submitStaffRoleRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.-]/g, "");

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const requestStatus = {
  PENDING: { label: "Đang chờ duyệt", className: "warning" },
  APPROVED: { label: "Đã duyệt", className: "success" },
  REJECTED: { label: "Đã từ chối", className: "danger" },
  CANCELLED: { label: "Đã hủy", className: "neutral" },
};

const ManagerStaffAssignmentPage = () => {
  const dispatch = useDispatch();
  const { staffAssignments, notice: parkingNotice } = useSelector((state) => state.parking);
  const { user } = useSelector((state) => state.auth);
  const staffRole = useSelector((state) => state.staffRoleRequests);
  const [staffKeyword, setStaffKeyword] = useState("");
  const [candidateKeyword, setCandidateKeyword] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [portraitImageUrl, setPortraitImageUrl] = useState("");
  const [managerNote, setManagerNote] = useState("");
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    dispatch(fetchStaffAssignmentsRequest());
    dispatch(fetchManagerStaffRoleRequestsRequest());
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(fetchStaffRoleCandidatesRequest({ q: candidateKeyword.trim() }));
    }, 320);

    return () => window.clearTimeout(timer);
  }, [candidateKeyword, dispatch]);

  const building = staffRole.building || staffAssignments.building || {
    id: user?.buildingId,
    name: user?.buildingName,
    address: user?.buildingAddress,
  };

  const filteredStaff = useMemo(() => {
    const normalizedKeyword = normalizeText(staffKeyword);

    if (!normalizedKeyword) return staffAssignments.items || [];

    return (staffAssignments.items || []).filter((staff) =>
      [staff.name, staff.email, staff.phone, staff.buildingName]
        .some((value) => normalizeText(value).includes(normalizedKeyword))
    );
  }, [staffAssignments.items, staffKeyword]);

  const assignedCount = (staffAssignments.items || []).filter(
    (staff) => String(staff.buildingId || "") === String(building?.id || "")
  ).length;
  const pendingCount = staffRole.managerRequests.filter(
    (request) => request.status === "PENDING"
  ).length;
  const activeCandidate = selectedCandidate && !staffRole.managerRequests.some(
    (request) =>
      Number(request.userId) === Number(selectedCandidate.id)
      && request.status === "PENDING"
  )
    ? selectedCandidate
    : null;

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(clearStaffRoleRequestNotice());
    dispatch(fetchStaffAssignmentsRequest());
    dispatch(fetchManagerStaffRoleRequestsRequest());
    dispatch(fetchStaffRoleCandidatesRequest({ q: candidateKeyword.trim() }));
  };

  const handlePortraitChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setProcessingImage(true);
    setImageError("");

    try {
      const compressedImage = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 1200,
        maxLength: 850_000,
      });
      setPortraitImageUrl(compressedImage);
    } catch (error) {
      setPortraitImageUrl("");
      setImageError(error.message || "Không chuẩn bị được ảnh chân dung.");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setImageError("");

    if (!activeCandidate) return;
    if (!portraitImageUrl) {
      setImageError("Vui lòng gửi ảnh chân dung rõ khuôn mặt của người được đề nghị.");
      return;
    }

    dispatch(submitStaffRoleRequest({
      userId: activeCandidate.id,
      portraitImageUrl,
      managerNote: managerNote.trim(),
    }));
  };

  const candidateColumns = [
    {
      header: "Người dùng",
      key: "name",
      minWidth: "210px",
      render: (row) => (
        <div className="request-person">
          <span className="request-person-avatar">
            {row.avatarUrl ? <img src={row.avatarUrl} alt="" /> : String(row.name || "U").charAt(0)}
          </span>
          <span className="request-person-copy">
            <strong>{row.name || "Chưa cập nhật họ tên"}</strong>
            <small>Tham gia từ {formatDate(row.createdAt)}</small>
          </span>
        </div>
      ),
    },
    {
      header: "Liên hệ",
      key: "contact",
      minWidth: "210px",
      render: (row) => (
        <div className="request-contact-list">
          <span><Mail size={14} /> {row.email || "Chưa có email"}</span>
          <span><Phone size={14} /> {row.phone || "Chưa có số điện thoại"}</span>
        </div>
      ),
    },
    {
      header: "Hồ sơ xe",
      key: "vehicleCount",
      render: (row) => `${Number(row.vehicleCount || 0)} xe`,
    },
    {
      header: "Thao tác",
      key: "action",
      minWidth: "150px",
      render: (row) => (
        <Button
          size="sm"
          variant={Number(selectedCandidate?.id) === Number(row.id) ? "outline" : "primary"}
          icon={FileCheck2}
          onClick={() => {
            setSelectedCandidate(row);
            setPortraitImageUrl("");
            setManagerNote("");
            setImageError("");
          }}
        >
          {Number(selectedCandidate?.id) === Number(row.id) ? "Đang chọn" : "Lập hồ sơ"}
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      header: "Người được đề nghị",
      key: "userName",
      minWidth: "210px",
      render: (row) => (
        <div className="request-person">
          <span className="request-person-avatar">
            <img src={row.portraitImageUrl} alt={`Chân dung ${row.userName}`} />
          </span>
          <span className="request-person-copy">
            <strong>{row.userName}</strong>
            <small>{row.userEmail}</small>
          </span>
        </div>
      ),
    },
    {
      header: "Ngày gửi",
      key: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        const meta = requestStatus[row.status] || requestStatus.PENDING;
        return <span className={`pill ${meta.className}`}>{meta.label}</span>;
      },
    },
    {
      header: "Phản hồi",
      key: "adminNote",
      minWidth: "210px",
      render: (row) => row.adminNote || "Chưa có phản hồi",
    },
  ];

  const staffColumns = [
    {
      header: "Nhân viên",
      key: "name",
      minWidth: "210px",
      render: (row) => (
        <div className="table-person">
          <strong>{row.name || "Chưa có tên"}</strong>
          <p className="section-copy">{row.email || "-"}</p>
          <p className="section-copy">{row.phone || "Chưa cập nhật số điện thoại"}</p>
        </div>
      ),
    },
    {
      header: "Tòa hiện tại",
      key: "buildingName",
      minWidth: "220px",
      render: (row) => row.buildingName ? (
        <div>
          <strong>{row.buildingName}</strong>
          <p className="section-copy">{row.buildingAddress || "Chưa có địa chỉ"}</p>
        </div>
      ) : <span className="pill warning">Chưa gán tòa</span>,
    },
    {
      header: "Ngày cập nhật",
      key: "updatedAt",
      render: (row) => formatDate(row.updatedAt || row.createdAt),
    },
    {
      header: "Thao tác",
      key: "actions",
      render: (row) => {
        const isAssigned = String(row.buildingId || "") === String(building?.id || "");

        return (
          <Button
            size="sm"
            variant={isAssigned ? "outline" : "primary"}
            icon={UserPlus}
            disabled={isAssigned || !building?.id}
            loading={staffAssignments.assigningId === row.id}
            onClick={() => dispatch(assignStaffToBuildingRequest({ id: row.id }))}
          >
            {isAssigned ? "Đã ở tòa này" : "Gán vào tòa"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Users size={16} /> Đội ngũ tòa nhà</div>
          <h1 className="page-title">Đề nghị và phân công nhân viên</h1>
          <p className="page-subtitle">
            Tìm cư dân đang ở đúng tòa, gửi hồ sơ chân dung để quản trị viên xét duyệt, sau đó phân công người đã được cấp quyền.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang chờ duyệt</span>
          <span className="page-hero-number">{pendingCount}</span>
          <span className="page-hero-label">hồ sơ</span>
        </div>
      </section>

      <StatusBanner
        success={[staffRole.notice, parkingNotice]}
        errors={[staffRole.error, staffAssignments.error, imageError]}
      />

      <section className="card section-card manager-building-strip">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Tòa đang quản lý</h2>
            <p className="section-copy">
              {building?.name || "Tài khoản quản lý chưa được gán tòa nhà"}
              {building?.address ? ` - ${building.address}` : ""}
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={staffAssignments.loading || staffRole.candidatesLoading || staffRole.managerLoading}
            onClick={refresh}
          >
            Làm mới
          </Button>
        </div>
      </section>

      <div className="staff-request-workspace">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Search size={19} /> Tìm người trong tòa</h2>
              <p className="section-copy">Chỉ hiển thị cư dân đã được duyệt và chưa có hồ sơ đang chờ.</p>
            </div>
          </div>

          <FormField label="Tìm theo tên, email hoặc số điện thoại">
            <Input
              value={candidateKeyword}
              onChange={(event) => setCandidateKeyword(event.target.value)}
              placeholder="Nhập thông tin cần tìm"
              icon={Search}
            />
          </FormField>

          <Table
            columns={candidateColumns}
            data={staffRole.candidates}
            loading={staffRole.candidatesLoading}
            emptyMessage="Không có cư dân phù hợp trong tòa nhà này."
          />
        </section>

        <section className="card section-card staff-request-form-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Camera size={19} /> Hồ sơ đề nghị</h2>
              <p className="section-copy">Ảnh được duyệt sẽ trở thành ảnh đại diện của nhân viên.</p>
            </div>
          </div>

          {!activeCandidate ? (
            <div className="staff-request-empty">
              <UserPlus size={34} />
              <strong>Chưa chọn người cần đề nghị</strong>
              <span>Chọn “Lập hồ sơ” trong danh sách bên cạnh để tiếp tục.</span>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="staff-request-selected">
                <span className="request-person-avatar">
                  {activeCandidate.avatarUrl
                    ? <img src={activeCandidate.avatarUrl} alt="" />
                    : String(activeCandidate.name || "U").charAt(0)}
                </span>
                <div>
                  <strong>{activeCandidate.name}</strong>
                  <span>{activeCandidate.email}</span>
                  <span>{activeCandidate.phone || "Chưa có số điện thoại"}</span>
                </div>
              </div>

              <FormField label="Ảnh chân dung rõ khuôn mặt" required error={imageError || undefined}>
                <label className="staff-portrait-upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="user"
                    onChange={handlePortraitChange}
                    disabled={processingImage || staffRole.submitting}
                  />
                  {portraitImageUrl ? (
                    <img src={portraitImageUrl} alt={`Chân dung ${activeCandidate.name}`} />
                  ) : (
                    <span>
                      <Camera size={26} />
                      <strong>{processingImage ? "Đang chuẩn bị ảnh..." : "Chụp hoặc chọn ảnh chân dung"}</strong>
                      <small>Ảnh thẳng mặt, đủ sáng và không bị che khuất.</small>
                    </span>
                  )}
                </label>
              </FormField>

              <FormField label="Ghi chú cho quản trị viên">
                <textarea
                  className="form-input"
                  rows="4"
                  maxLength="1000"
                  value={managerNote}
                  onChange={(event) => setManagerNote(event.target.value)}
                  placeholder="Nêu vị trí công việc hoặc thông tin cần lưu ý..."
                  disabled={staffRole.submitting}
                />
              </FormField>

              <Button
                type="submit"
                icon={Send}
                loading={staffRole.submitting}
                disabled={processingImage || !portraitImageUrl}
              >
                Gửi quản trị viên duyệt
              </Button>
            </form>
          )}
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><History size={19} /> Hồ sơ đã gửi</h2>
            <p className="section-copy">Theo dõi kết quả và phản hồi của quản trị viên.</p>
          </div>
        </div>
        <Table
          columns={historyColumns}
          data={staffRole.managerRequests}
          loading={staffRole.managerLoading}
          emptyMessage="Bạn chưa gửi hồ sơ đề nghị nhân viên nào."
        />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Users size={19} /> Nhân viên đã được duyệt</h2>
            <p className="section-copy">Hiện có {assignedCount} nhân viên đang làm việc tại tòa này.</p>
          </div>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm nhân viên">
            <Input
              value={staffKeyword}
              onChange={(event) => setStaffKeyword(event.target.value)}
              placeholder="Nhập tên, email hoặc số điện thoại"
              icon={Search}
            />
          </FormField>
        </div>

        <Table
          columns={staffColumns}
          data={filteredStaff}
          loading={staffAssignments.loading}
          emptyMessage="Chưa có nhân viên phù hợp để phân công vào tòa này."
        />
      </section>
    </div>
  );
};

export default ManagerStaffAssignmentPage;
