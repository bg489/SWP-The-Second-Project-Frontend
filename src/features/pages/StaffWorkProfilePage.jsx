import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BadgeCheck, IdCard, RefreshCcw, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import StaffWorkProfileCard from "../../components/Staff/StaffWorkProfileCard";
import {
  clearStaffProfile,
  fetchStaffProfileRequest,
} from "../backend/staffRoleRequests/staffRoleRequestSlice";

const StaffWorkProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, profileLoading, error } = useSelector((state) => state.staffRoleRequests);

  useEffect(() => {
    dispatch(fetchStaffProfileRequest());

    return () => {
      dispatch(clearStaffProfile());
    };
  }, [dispatch]);

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><IdCard size={16} /> Hồ sơ nhân viên</div>
          <h1 className="page-title">Thông tin công việc của tôi</h1>
          <p className="page-subtitle">
            Xem ảnh chân dung đã được duyệt, tòa nhà làm việc và thông tin xác nhận quyền nhân viên.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Trạng thái</span>
          <span className="page-hero-number">{profile ? "Đang làm việc" : "Đang tải"}</span>
          <span className="page-hero-label">{profile?.buildingName || "hồ sơ công việc"}</span>
        </div>
      </section>

      <StatusBanner errors={error} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><BadgeCheck size={19} /> Hồ sơ đã được quản trị viên xác nhận</h2>
            <p className="section-copy">
              Ảnh chân dung công việc được lưu riêng, không thay thế ảnh đại diện cá nhân trên tài khoản.
            </p>
          </div>
          <div className="action-row">
            <Button variant="outline" icon={UserRound} onClick={() => navigate("/profile")}>
              Hồ sơ cá nhân
            </Button>
            <Button
              variant="outline"
              icon={RefreshCcw}
              loading={profileLoading}
              onClick={() => dispatch(fetchStaffProfileRequest())}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {profileLoading && !profile ? (
          <div className="staff-profile-loading" aria-label="Đang tải hồ sơ nhân viên">
            <span />
            <span />
            <span />
          </div>
        ) : profile ? (
          <StaffWorkProfileCard profile={profile} />
        ) : (
          <div className="staff-request-empty">
            <IdCard size={34} />
            <strong>Chưa tìm thấy hồ sơ nhân viên</strong>
            <span>Hãy làm mới trang hoặc liên hệ quản lý nếu quyền nhân viên vừa được duyệt.</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default StaffWorkProfilePage;
