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
  ShieldMinus,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { compressImageFile } from "../../utils/imageFile";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import {
  clearStaffRoleCandidates,
  clearStaffRoleRequestNotice,
  fetchManagerStaffRoleRequestsRequest,
  fetchStaffRoleCandidatesRequest,
  submitStaffRoleRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

const REQUEST_TYPES = {
  PROMOTE: "PROMOTE",
  DEMOTE: "DEMOTE",
};

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

const requestTypeMeta = {
  PROMOTE: { label: "Bổ nhiệm nhân viên", className: "success" },
  DEMOTE: { label: "Hủy quyền nhân viên", className: "danger" },
};

const ManagerStaffAssignmentPage = () => {
  const dispatch = useDispatch();
  const { buildings, loading: buildingsLoading, error: buildingsError } = useSelector(
    (state) => state.buildings
  );
  const staffRole = useSelector((state) => state.staffRoleRequests);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [requestType, setRequestType] = useState(REQUEST_TYPES.PROMOTE);
  const [candidateKeyword, setCandidateKeyword] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [portraitImageUrl, setPortraitImageUrl] = useState("");
  const [managerNote, setManagerNote] = useState("");
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  const activeBuildingId = selectedBuildingId || String(buildings[0]?.id || "");
  const selectedBuilding = buildings.find(
    (building) => Number(building.id) === Number(activeBuildingId)
  ) || null;
  const activeCandidate = selectedCandidate && staffRole.candidates.some(
    (candidate) => Number(candidate.id) === Number(selectedCandidate.id)
  )
    ? selectedCandidate
    : null;

  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!activeBuildingId) {
      dispatch(clearStaffRoleCandidates());
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const params = {
        buildingId: Number(activeBuildingId),
        requestType,
        q: candidateKeyword.trim() || undefined,
      };
      dispatch(fetchStaffRoleCandidatesRequest(params));
      dispatch(fetchManagerStaffRoleRequestsRequest({
        buildingId: Number(activeBuildingId),
      }));
    }, 320);

    return () => window.clearTimeout(timer);
  }, [activeBuildingId, candidateKeyword, dispatch, requestType]);

  const buildingOptions = useMemo(
    () => buildings.map((building) => ({
      value: String(building.id),
      label: `${building.name}${building.address ? ` - ${building.address}` : ""}`,
    })),
    [buildings]
  );
  const pendingCount = staffRole.managerRequests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const resetForm = () => {
    setSelectedCandidate(null);
    setPortraitImageUrl("");
    setManagerNote("");
    setImageError("");
  };

  const changeBuilding = (value) => {
    setSelectedBuildingId(value);
    setCandidateKeyword("");
    resetForm();
    dispatch(clearStaffRoleCandidates());
    dispatch(clearStaffRoleRequestNotice());
  };

  const changeRequestType = (value) => {
    setRequestType(value);
    setCandidateKeyword("");
    resetForm();
    dispatch(clearStaffRoleCandidates());
    dispatch(clearStaffRoleRequestNotice());
  };

  const refresh = () => {
    dispatch(clearStaffRoleRequestNotice());
    dispatch(fetchBuildingsRequest());

    if (activeBuildingId) {
      dispatch(fetchStaffRoleCandidatesRequest({
        buildingId: Number(activeBuildingId),
        requestType,
        q: candidateKeyword.trim() || undefined,
      }));
      dispatch(fetchManagerStaffRoleRequestsRequest({
        buildingId: Number(activeBuildingId),
      }));
    }
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

    if (!activeCandidate || !activeBuildingId) return;
    if (requestType === REQUEST_TYPES.PROMOTE && !portraitImageUrl) {
      setImageError("Vui lòng gửi ảnh chân dung rõ khuôn mặt của người được đề nghị.");
      return;
    }

    const refreshParams = {
      buildingId: Number(activeBuildingId),
      requestType,
      q: candidateKeyword.trim() || undefined,
    };

    dispatch(submitStaffRoleRequest({
      buildingId: Number(activeBuildingId),
      userId: activeCandidate.id,
      requestType,
      portraitImageUrl: requestType === REQUEST_TYPES.PROMOTE
        ? portraitImageUrl
        : undefined,
      managerNote: managerNote.trim(),
      refreshParams,
    }));
  };

  const candidateColumns = [
    {
      header: requestType === REQUEST_TYPES.PROMOTE ? "Cư dân" : "Nhân viên",
      key: "name",
      minWidth: "220px",
      render: (row) => {
        const photo = requestType === REQUEST_TYPES.DEMOTE
          ? row.staffPortraitImageUrl || row.avatarUrl
          : row.avatarUrl;

        return (
          <div className="request-person">
            <span className="request-person-avatar">
              {photo ? <img src={photo} alt="" /> : String(row.name || "U").charAt(0)}
            </span>
            <span className="request-person-copy">
              <strong>{row.name || "Chưa cập nhật họ tên"}</strong>
              <small>Tham gia từ {formatDate(row.createdAt)}</small>
            </span>
          </div>
        );
      },
    },
    {
      header: "Liên hệ",
      key: "contact",
      minWidth: "220px",
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
      minWidth: "165px",
      render: (row) => {
        const isSelected = Number(activeCandidate?.id) === Number(row.id);
        return (
          <Button
            size="sm"
            variant={isSelected ? "outline" : requestType === REQUEST_TYPES.DEMOTE ? "danger" : "primary"}
            icon={requestType === REQUEST_TYPES.DEMOTE ? UserMinus : FileCheck2}
            onClick={() => {
              setSelectedCandidate(row);
              setPortraitImageUrl("");
              setManagerNote("");
              setImageError("");
            }}
          >
            {isSelected
              ? "Đang chọn"
              : requestType === REQUEST_TYPES.DEMOTE
                ? "Lập đề nghị"
                : "Lập hồ sơ"}
          </Button>
        );
      },
    },
  ];

  const historyColumns = [
    {
      header: "Loại đề nghị",
      key: "requestType",
      minWidth: "170px",
      render: (row) => {
        const meta = requestTypeMeta[row.requestType] || requestTypeMeta.PROMOTE;
        return <span className={`pill ${meta.className}`}>{meta.label}</span>;
      },
    },
    {
      header: "Người được đề nghị",
      key: "userName",
      minWidth: "220px",
      render: (row) => {
        const photo = row.portraitImageUrl || row.staffPortraitImageUrl || row.userAvatarUrl;
        return (
          <div className="request-person">
            <span className="request-person-avatar">
              {photo ? <img src={photo} alt={`Hồ sơ ${row.userName}`} /> : String(row.userName || "U").charAt(0)}
            </span>
            <span className="request-person-copy">
              <strong>{row.userName}</strong>
              <small>{row.userEmail}</small>
            </span>
          </div>
        );
      },
    },
    {
      header: "Tòa nhà",
      key: "buildingName",
      minWidth: "190px",
      render: (row) => row.buildingName,
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
      minWidth: "220px",
      render: (row) => row.adminNote || "Chưa có phản hồi",
    },
  ];

  const selectedPhoto = activeCandidate?.staffPortraitImageUrl || activeCandidate?.avatarUrl;
  const isPromotion = requestType === REQUEST_TYPES.PROMOTE;

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Users size={16} /> Đội ngũ toàn hệ thống</div>
          <h1 className="page-title">Bổ nhiệm và quản lý quyền nhân viên</h1>
          <p className="page-subtitle">
            Chọn bất kỳ tòa nhà nào, tìm đúng người trong tòa và gửi hồ sơ để quản trị viên duyệt bổ nhiệm hoặc hủy quyền.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang chờ duyệt</span>
          <span className="page-hero-number">{pendingCount}</span>
          <span className="page-hero-label">hồ sơ tại tòa đã chọn</span>
        </div>
      </section>

      <StatusBanner
        success={staffRole.notice}
        errors={[staffRole.error, buildingsError, imageError]}
      />

      <section className="card section-card manager-building-strip">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Chọn tòa nhà cần quản lý nhân sự</h2>
            <p className="section-copy">
              Manager có thể quản lý đội ngũ của tất cả tòa nhà trong hệ thống.
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={buildingsLoading || staffRole.candidatesLoading || staffRole.managerLoading}
            onClick={refresh}
          >
            Làm mới
          </Button>
        </div>

        <div className="manager-staff-scope-grid">
          <FormField label="Tòa nhà">
            <Select
              value={activeBuildingId}
              onChange={(event) => changeBuilding(event.target.value)}
              options={buildingOptions}
              placeholder={buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
              disabled={buildingsLoading || !buildings.length}
            />
          </FormField>

          <div className="manager-selected-building">
            <strong>{selectedBuilding?.name || "Chưa chọn tòa nhà"}</strong>
            <span>{selectedBuilding?.address || "Chọn tòa để xem người đang thuộc tòa đó."}</span>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><FileCheck2 size={19} /> Chọn loại đề nghị</h2>
            <p className="section-copy">Mọi thay đổi giữa cư dân và nhân viên đều cần quản trị viên duyệt.</p>
          </div>
        </div>
        <div className="staff-request-mode-switch" role="group" aria-label="Loại đề nghị nhân viên">
          <button
            type="button"
            className={isPromotion ? "active" : ""}
            onClick={() => changeRequestType(REQUEST_TYPES.PROMOTE)}
          >
            <UserPlus size={18} />
            <span><strong>Bổ nhiệm nhân viên</strong><small>Tìm cư dân của tòa đã chọn</small></span>
          </button>
          <button
            type="button"
            className={!isPromotion ? "active danger" : ""}
            onClick={() => changeRequestType(REQUEST_TYPES.DEMOTE)}
          >
            <UserMinus size={18} />
            <span><strong>Hủy quyền nhân viên</strong><small>Chuyển nhân viên về cư dân</small></span>
          </button>
        </div>
      </section>

      <div className="staff-request-workspace">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Search size={19} /> {isPromotion ? "Tìm cư dân trong tòa" : "Chọn nhân viên cần hủy quyền"}</h2>
              <p className="section-copy">
                {isPromotion
                  ? "Chỉ hiển thị cư dân đang hoạt động và chưa có hồ sơ chờ duyệt."
                  : "Chỉ hiển thị nhân viên đang làm việc tại đúng tòa nhà đã chọn."}
              </p>
            </div>
          </div>

          <FormField label="Tìm theo tên, email hoặc số điện thoại">
            <Input
              value={candidateKeyword}
              onChange={(event) => setCandidateKeyword(event.target.value)}
              placeholder="Nhập thông tin cần tìm"
              icon={Search}
              disabled={!activeBuildingId}
            />
          </FormField>

          <Table
            columns={candidateColumns}
            data={staffRole.candidates}
            loading={staffRole.candidatesLoading}
            emptyMessage={isPromotion
              ? "Không có cư dân phù hợp trong tòa nhà này."
              : "Tòa nhà này chưa có nhân viên phù hợp để hủy quyền."}
          />
        </section>

        <section className="card section-card staff-request-form-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {isPromotion ? <Camera size={19} /> : <ShieldMinus size={19} />}
                {isPromotion ? "Hồ sơ bổ nhiệm" : "Đề nghị hủy quyền"}
              </h2>
              <p className="section-copy">
                {isPromotion
                  ? "Ảnh chân dung được lưu riêng trong hồ sơ nhân viên, không thay đổi ảnh đại diện cá nhân."
                  : "Quản trị viên sẽ kiểm tra thông tin trước khi chuyển người này về quyền cư dân."}
              </p>
            </div>
          </div>

          {!activeCandidate ? (
            <div className="staff-request-empty">
              {isPromotion ? <UserPlus size={34} /> : <UserMinus size={34} />}
              <strong>{isPromotion ? "Chưa chọn người cần bổ nhiệm" : "Chưa chọn nhân viên cần hủy quyền"}</strong>
              <span>Chọn một người trong danh sách bên cạnh để tiếp tục.</span>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="staff-request-selected">
                <span className="request-person-avatar">
                  {selectedPhoto
                    ? <img src={selectedPhoto} alt="" />
                    : String(activeCandidate.name || "U").charAt(0)}
                </span>
                <div>
                  <strong>{activeCandidate.name}</strong>
                  <span>{activeCandidate.email}</span>
                  <span>{activeCandidate.phone || "Chưa có số điện thoại"}</span>
                  <span>{selectedBuilding?.name}</span>
                </div>
              </div>

              {isPromotion && (
                <FormField label="Ảnh chân dung hồ sơ nhân viên" required error={imageError || undefined}>
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
              )}

              {!isPromotion && (
                <div className="staff-demotion-warning">
                  <ShieldMinus size={22} />
                  <div>
                    <strong>Quyền nhân viên chỉ kết thúc sau khi Admin duyệt</strong>
                    <span>Người này vẫn làm việc bình thường trong lúc hồ sơ đang chờ xử lý.</span>
                  </div>
                </div>
              )}

              <FormField label={isPromotion ? "Ghi chú cho quản trị viên" : "Lý do đề nghị hủy quyền"}>
                <textarea
                  className="form-input"
                  rows="4"
                  maxLength="1000"
                  value={managerNote}
                  onChange={(event) => setManagerNote(event.target.value)}
                  placeholder={isPromotion
                    ? "Nêu vị trí công việc hoặc thông tin cần lưu ý..."
                    : "Nêu lý do để quản trị viên có đủ thông tin xét duyệt..."}
                  disabled={staffRole.submitting}
                />
              </FormField>

              <Button
                type="submit"
                variant={isPromotion ? "primary" : "danger"}
                icon={Send}
                loading={staffRole.submitting}
                disabled={processingImage || (isPromotion && !portraitImageUrl)}
              >
                {isPromotion ? "Gửi hồ sơ bổ nhiệm" : "Gửi đề nghị hủy quyền"}
              </Button>
            </form>
          )}
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><History size={19} /> Lịch sử đề nghị tại tòa đã chọn</h2>
            <p className="section-copy">Theo dõi cả hồ sơ bổ nhiệm và hủy quyền cùng phản hồi của quản trị viên.</p>
          </div>
        </div>
        <Table
          columns={historyColumns}
          data={staffRole.managerRequests}
          loading={staffRole.managerLoading}
          emptyMessage="Bạn chưa gửi đề nghị nhân viên nào tại tòa nhà này."
        />
      </section>
    </div>
  );
};

export default ManagerStaffAssignmentPage;
