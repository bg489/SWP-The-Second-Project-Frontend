import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { useMockAuth } from "../../context/MockAuthContext";
import { buildingInfo, floors, roleHomePaths, roleLabels } from "../../services/mockParkingData";
import { ArrowRight, Building2, Car, Layers, QrCode, ShieldCheck, Sparkles, User } from "lucide-react";

const roleCards = [
  {
    key: "USER",
    title: "Cư dân",
    desc: "Đăng ký xe, mua gói tháng, xem mã QR và theo dõi lượt gửi xe.",
    icon: User,
  },
  {
    key: "PARKING_STAFF",
    title: "Nhân viên bãi xe",
    desc: "Quét QR xe vào/ra, phát QR tạm, gán ô đỗ và ghi nhận vi phạm.",
    icon: QrCode,
  },
  {
    key: "PARKING_MANAGER",
    title: "Quản lý bãi xe",
    desc: "Thiết lập tòa nhà, tầng, sức chứa, ô đỗ ô tô và xem báo cáo.",
    icon: Layers,
  },
  {
    key: "ADMIN",
    title: "Quản trị viên",
    desc: "Duyệt tài khoản, duyệt xe, phân quyền và quản lý chính sách hệ thống.",
    icon: ShieldCheck,
  },
];

const Login = () => {
  const { login, isDarkMode, toggleDarkMode } = useMockAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    const nextPath = login(role) || roleHomePaths[role];
    navigate(nextPath);
  };

  const motorbikeCapacity = floors
    .filter((floor) => floor.floorType === "MOTORBIKE")
    .reduce((sum, floor) => sum + floor.capacity, 0);
  const carSlots = floors.find((floor) => floor.floorType === "CAR")?.slotsCount || 0;

  return (
    <div className="login-shell">
      <section className="login-story">
        <div>
          <div className="page-eyebrow">
            <Sparkles size={16} /> Sunrise Parking
          </div>
          <h1 className="page-title">Hệ thống quản lý tòa giữ xe</h1>
          <p className="page-subtitle">
            Một tòa nhà, xe máy theo sức chứa, ô tô theo từng ô đỗ, mã QR tháng và QR tạm cho khách vãng lai.
          </p>
        </div>

        <div className="soft-panel">
          <div className="section-title">
            <Building2 size={19} /> {buildingInfo.name}
          </div>
          <div className="data-list" style={{ marginTop: 14 }}>
            <div className="data-row">
              <span>Địa chỉ</span>
              <strong>{buildingInfo.address}</strong>
            </div>
            <div className="data-row">
              <span>Sức chứa xe máy</span>
              <strong>{motorbikeCapacity} xe</strong>
            </div>
            <div className="data-row">
              <span>Ô đỗ ô tô</span>
              <strong>{carSlots} ô</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="login-panel-wrap">
        <div className="card section-card" style={{ maxWidth: 760, width: "100%", margin: "0 auto" }}>
          <div className="section-header">
            <div>
              <div className="page-eyebrow">Chế độ xem nhanh</div>
              <h2 className="section-title">Chọn nhóm người dùng để vào hệ thống</h2>
              <p className="section-copy">
                Dùng để xem nhanh các màn hình theo từng công việc trong bãi xe.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleDarkMode}>
              {isDarkMode ? "Giao diện sáng" : "Giao diện tối"}
            </Button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {roleCards.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.key} className="role-card" onClick={() => handleRoleSelect(card.key)}>
                  <div className="metric-icon" style={{ marginBottom: 0 }}>
                    <Icon size={21} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>{card.title}</h3>
                      <span className="pill neutral">{roleLabels[card.key]}</span>
                    </div>
                    <p className="section-copy">{card.desc}</p>
                  </div>
                  <ArrowRight size={18} style={{ color: "var(--primary)", alignSelf: "center" }} />
                </button>
              );
            })}
          </div>

          <div className="dashboard-grid" style={{ marginTop: 20 }}>
            <div className="soft-panel">
              <Car size={20} color="var(--primary)" />
              <div className="metric-value">2 loại xe</div>
              <div className="metric-note">Xe máy theo số lượng, ô tô theo từng ô đỗ.</div>
            </div>
            <div className="soft-panel">
              <QrCode size={20} color="var(--primary)" />
              <div className="metric-value">Ra vào bằng QR</div>
              <div className="metric-note">Gói tháng và thẻ QR tạm.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
