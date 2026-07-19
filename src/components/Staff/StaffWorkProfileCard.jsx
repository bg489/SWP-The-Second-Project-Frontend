import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Car,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Chưa cập nhật";
  }
};

const getInitials = (name) => {
  const parts = String(name || "Nhân viên").trim().split(/\s+/).filter(Boolean);
  return parts.slice(-2).map((part) => part.charAt(0)).join("").toUpperCase() || "NV";
};

const StaffImage = ({ src, alt, className, fallback }) => {
  const [failedSrc, setFailedSrc] = useState("");
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    return (
      <div className={`${className} staff-profile-image-fallback`} aria-label={alt}>
        <UserRound size={32} />
        <span>{fallback}</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="staff-work-detail">
    <span className="staff-work-detail-icon"><Icon size={17} /></span>
    <span>
      <small>{label}</small>
      <strong>{value || "Chưa cập nhật"}</strong>
    </span>
  </div>
);

const StaffWorkProfileCard = ({ profile }) => {
  if (!profile) return null;

  const initials = getInitials(profile.name);
  const employeeCode = `NV-${String(profile.userId || 0).padStart(4, "0")}`;

  return (
    <article className="staff-work-profile-card">
      <div className="staff-work-profile-visual">
        <div className="staff-formal-photo-frame">
          <StaffImage
            src={profile.portraitImageUrl}
            alt={`Ảnh chân dung hồ sơ nhân viên ${profile.name || ""}`}
            className="staff-formal-photo"
            fallback="Chưa có ảnh chân dung hồ sơ"
          />
          <span className="staff-formal-photo-label"><BadgeCheck size={15} /> Ảnh hồ sơ công việc</span>
        </div>

        <div className="staff-personal-avatar-panel">
          <StaffImage
            src={profile.avatarUrl}
            alt={`Ảnh đại diện cá nhân ${profile.name || ""}`}
            className="staff-personal-avatar"
            fallback={initials}
          />
          <div>
            <small>Ảnh đại diện cá nhân</small>
            <strong>{profile.name || "Nhân viên"}</strong>
            <span>Ảnh này do chính người dùng cập nhật.</span>
          </div>
        </div>
      </div>

      <div className="staff-work-profile-content">
        <header className="staff-work-profile-heading">
          <div>
            <span className="pill success"><ShieldCheck size={14} /> Hồ sơ đang hoạt động</span>
            <h2>{profile.name || "Nhân viên bãi xe"}</h2>
            <p>Nhân viên bãi xe tại {profile.buildingName || "tòa nhà chưa xác định"}</p>
          </div>
          <span className="staff-employee-code"><IdCard size={18} /> {employeeCode}</span>
        </header>

        <div className="staff-work-detail-grid">
          <DetailItem icon={Mail} label="Email tài khoản" value={profile.email} />
          <DetailItem icon={Phone} label="Số điện thoại" value={profile.phone} />
          <DetailItem icon={Building2} label="Tòa nhà làm việc" value={profile.buildingName} />
          <DetailItem icon={MapPin} label="Địa chỉ" value={profile.buildingAddress} />
          <DetailItem icon={CalendarDays} label="Ngày bắt đầu" value={formatDate(profile.startedAt)} />
          <DetailItem icon={Car} label="Hồ sơ xe cá nhân" value={`${Number(profile.vehicleCount || 0)} xe`} />
        </div>

        <div className="staff-work-approval-strip">
          <BadgeCheck size={20} />
          <div>
            <strong>Thông tin xác nhận nhân viên</strong>
            <span>
              Đề nghị bởi {profile.proposedByName || "quản lý"}
              {profile.approvedByName ? `, duyệt bởi ${profile.approvedByName}` : ""}
              {profile.approvedAt ? ` ngày ${formatDate(profile.approvedAt)}` : ""}.
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default StaffWorkProfileCard;
