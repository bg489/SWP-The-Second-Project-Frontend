import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  IdCard,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  UserRoundCog,
  Users,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import StaffWorkProfileCard from "../../components/Staff/StaffWorkProfileCard";
import Table from "../../components/Table/Table";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import {
  clearStaffProfile,
  clearStaffProfiles,
  fetchStaffProfileRequest,
  fetchStaffProfilesRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const ManagerStaffProfilesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { buildings, loading: buildingsLoading, error: buildingsError } = useSelector(
    (state) => state.buildings
  );
  const staffRole = useSelector((state) => state.staffRoleRequests);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const activeBuildingId = selectedBuildingId || String(buildings[0]?.id || "");
  const activeBuilding = buildings.find(
    (building) => Number(building.id) === Number(activeBuildingId)
  ) || null;
  const profiles = useMemo(
    () => Number(staffRole.profilesBuilding?.id) === Number(activeBuildingId)
      ? staffRole.staffProfiles
      : [],
    [activeBuildingId, staffRole.profilesBuilding?.id, staffRole.staffProfiles]
  );

  useEffect(() => {
    dispatch(fetchBuildingsRequest());

    return () => {
      dispatch(clearStaffProfiles());
      dispatch(clearStaffProfile());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!activeBuildingId) return undefined;

    const timer = window.setTimeout(() => {
      dispatch(fetchStaffProfilesRequest({
        buildingId: Number(activeBuildingId),
        q: keyword.trim() || undefined,
      }));
    }, 320);

    return () => window.clearTimeout(timer);
  }, [activeBuildingId, dispatch, keyword]);

  const buildingOptions = useMemo(
    () => buildings.map((building) => ({
      value: String(building.id),
      label: `${building.name}${building.address ? ` - ${building.address}` : ""}`,
    })),
    [buildings]
  );

  const selectProfile = (row) => {
    setSelectedUserId(row.userId);
    dispatch(fetchStaffProfileRequest({ userId: row.userId }));
  };

  const changeBuilding = (value) => {
    setSelectedBuildingId(value);
    setKeyword("");
    setSelectedUserId(null);
    dispatch(clearStaffProfiles());
    dispatch(clearStaffProfile());
  };

  const refresh = () => {
    dispatch(fetchBuildingsRequest());
    if (activeBuildingId) {
      dispatch(fetchStaffProfilesRequest({
        buildingId: Number(activeBuildingId),
        q: keyword.trim() || undefined,
      }));
    }
    if (selectedUserId) {
      dispatch(fetchStaffProfileRequest({ userId: selectedUserId }));
    }
  };

  const columns = [
    {
      header: "Nhân viên",
      key: "name",
      minWidth: "220px",
      render: (row) => (
        <div className="request-person">
          <span className="request-person-avatar">
            {row.portraitImageUrl
              ? <img src={row.portraitImageUrl} alt="" />
              : String(row.name || "N").charAt(0)}
          </span>
          <span className="request-person-copy">
            <strong>{row.name || "Chưa cập nhật họ tên"}</strong>
            <small>NV-{String(row.userId || 0).padStart(4, "0")}</small>
          </span>
        </div>
      ),
    },
    {
      header: "Liên hệ",
      key: "contact",
      minWidth: "230px",
      render: (row) => (
        <div className="request-contact-list">
          <span><Mail size={14} /> {row.email || "Chưa có email"}</span>
          <span><Phone size={14} /> {row.phone || "Chưa có số điện thoại"}</span>
        </div>
      ),
    },
    {
      header: "Bắt đầu làm việc",
      key: "startedAt",
      minWidth: "150px",
      render: (row) => formatDate(row.startedAt),
    },
    {
      header: "Trạng thái",
      key: "profileStatus",
      render: () => <span className="pill success">Đang làm việc</span>,
    },
    {
      header: "Thao tác",
      key: "action",
      render: (row) => (
        <Button
          size="sm"
          variant={Number(selectedUserId) === Number(row.userId) ? "primary" : "outline"}
          icon={Eye}
          onClick={() => selectProfile(row)}
        >
          {Number(selectedUserId) === Number(row.userId) ? "Đang xem" : "Xem hồ sơ"}
        </Button>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Users size={16} /> Hồ sơ đội ngũ</div>
          <h1 className="page-title">Nhân viên tại tất cả tòa nhà</h1>
          <p className="page-subtitle">
            Chọn từng tòa nhà để xem ảnh chân dung công việc, thông tin liên hệ và hồ sơ xác nhận của nhân viên.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Nhân viên đang hiển thị</span>
          <span className="page-hero-number">{profiles.length}</span>
          <span className="page-hero-label">{activeBuilding?.name || "chưa chọn tòa nhà"}</span>
        </div>
      </section>

      <StatusBanner errors={[staffRole.error, buildingsError]} />

      <section className="card section-card manager-building-strip">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Chọn tòa nhà cần xem nhân viên</h2>
            <p className="section-copy">Quản lý được xem đội ngũ của mọi tòa nhà trong hệ thống.</p>
          </div>
          <div className="action-row">
            <Button variant="outline" icon={UserRoundCog} onClick={() => navigate("/manager/staff")}>
              Điều chỉnh quyền
            </Button>
            <Button
              variant="outline"
              icon={RefreshCcw}
              loading={buildingsLoading || staffRole.profilesLoading || staffRole.profileLoading}
              onClick={refresh}
            >
              Làm mới
            </Button>
          </div>
        </div>

        <div className="manager-staff-profile-filters">
          <FormField label="Tòa nhà">
            <Select
              value={activeBuildingId}
              onChange={(event) => changeBuilding(event.target.value)}
              options={buildingOptions}
              placeholder={buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
              disabled={buildingsLoading || !buildings.length}
            />
          </FormField>
          <FormField label="Tìm nhân viên">
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedUserId(null);
                dispatch(clearStaffProfile());
              }}
              icon={Search}
              placeholder="Nhập tên, email hoặc số điện thoại"
              disabled={!activeBuildingId}
            />
          </FormField>
        </div>
      </section>

      <div className="manager-staff-profile-workspace">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Users size={19} /> Danh sách nhân viên</h2>
              <p className="section-copy">Chỉ hiển thị nhân viên đang làm việc tại đúng tòa nhà đã chọn.</p>
            </div>
          </div>
          <Table
            columns={columns}
            data={profiles}
            loading={staffRole.profilesLoading}
            emptyMessage="Tòa nhà này chưa có nhân viên phù hợp."
          />
        </section>

        <section className="card section-card manager-staff-profile-detail">
          <div className="section-header">
            <div>
              <h2 className="section-title"><IdCard size={19} /> Chi tiết hồ sơ nhân viên</h2>
              <p className="section-copy">Ảnh chân dung công việc và ảnh đại diện cá nhân được hiển thị riêng.</p>
            </div>
          </div>

          {staffRole.profileLoading && !staffRole.profile ? (
            <div className="staff-profile-loading" aria-label="Đang tải chi tiết nhân viên">
              <span />
              <span />
              <span />
            </div>
          ) : staffRole.profile ? (
            <StaffWorkProfileCard profile={staffRole.profile} />
          ) : (
            <div className="staff-request-empty">
              <IdCard size={34} />
              <strong>Chưa chọn nhân viên</strong>
              <span>Chọn “Xem hồ sơ” trong danh sách để mở thông tin công việc chi tiết.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManagerStaffProfilesPage;
