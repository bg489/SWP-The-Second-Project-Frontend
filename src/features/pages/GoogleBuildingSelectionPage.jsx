import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LogOut,
  MapPin,
  Sparkles,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  completeGoogleOnboardingRequest,
  fetchRegisterBuildingsRequest,
  logout as logoutAction,
} from "../backend/auth/authSlice";
import { roleHomePaths } from "../../services/mockParkingData";

const GoogleBuildingSelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    login,
    logout: logoutContext,
    isDarkMode,
    toggleDarkMode,
  } = useMockAuth();
  const {
    frontendRole,
    isAuthenticated,
    onboardingError,
    onboardingLoading,
    registerBuildings,
    registerBuildingsError,
    registerBuildingsLoading,
    requiresBuildingSelection,
    token,
    user,
  } = useSelector((state) => state.auth);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectionError, setSelectionError] = useState("");

  useEffect(() => {
    dispatch(fetchRegisterBuildingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      requiresBuildingSelection ||
      onboardingLoading ||
      !token
    ) {
      return;
    }

    const role = frontendRole || "USER";
    login(role, user, token);
    navigate(roleHomePaths[role] || "/user/dashboard", { replace: true });
  }, [
    frontendRole,
    isAuthenticated,
    login,
    navigate,
    onboardingLoading,
    requiresBuildingSelection,
    token,
    user,
  ]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  const submitSelection = (event) => {
    event.preventDefault();

    if (!selectedBuildingId) {
      setSelectionError("Vui lòng chọn tòa nhà bạn đang sử dụng.");
      return;
    }

    setSelectionError("");
    dispatch(
      completeGoogleOnboardingRequest({
        buildingId: Number(selectedBuildingId),
      })
    );
  };

  const signOut = () => {
    dispatch(logoutAction());
    logoutContext();
    navigate("/login", { replace: true });
  };

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <div className="brand-mark">
          <Sparkles size={18} />
        </div>
        <div>
          <strong>Sunrise Parking</strong>
          <p>Thiết lập tài khoản Google lần đầu</p>
        </div>
        <div className="onboarding-header-actions">
          <Button type="button" variant="outline" size="sm" onClick={toggleDarkMode}>
            {isDarkMode ? "Giao diện sáng" : "Giao diện tối"}
          </Button>
          <Button type="button" variant="outline" size="sm" icon={LogOut} onClick={signOut}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="onboarding-content">
        <section className="page-hero onboarding-hero">
          <div className="page-hero-content">
            <div className="page-eyebrow">
              <Building2 size={16} /> Chọn tòa nhà
            </div>
            <h1 className="page-title">Bạn đang gửi xe ở tòa nhà nào?</h1>
            <p className="page-subtitle">
              Lựa chọn này quyết định nơi đăng ký xe, mua gói và nhận thông tin bãi
              đỗ. Bạn vẫn có thể gửi yêu cầu đổi tòa sau này.
            </p>
          </div>
          <div className="page-hero-aside">
            <span className="page-hero-label">Tài khoản Google</span>
            <span className="onboarding-user-name">{user?.name}</span>
            <span className="page-hero-label">{user?.email}</span>
          </div>
        </section>

        <StatusBanner
          errors={[selectionError, onboardingError, registerBuildingsError]}
        />

        <form className="card section-card" onSubmit={submitSelection}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <MapPin size={19} /> Danh sách tòa nhà
              </h2>
              <p className="section-copy">
                Chọn đúng cơ sở để hệ thống hiển thị sức chứa, tầng và ô đỗ phù hợp.
              </p>
            </div>
          </div>

          {registerBuildingsLoading ? (
            <div className="onboarding-loading">Đang tải danh sách tòa nhà...</div>
          ) : (
            <div className="building-choice-grid">
              {registerBuildings.map((building) => {
                const selected =
                  String(selectedBuildingId) === String(building.id);

                return (
                  <button
                    key={building.id}
                    type="button"
                    className={`building-choice ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedBuildingId(String(building.id));
                      setSelectionError("");
                    }}
                  >
                    <span className="building-choice-icon">
                      <Building2 size={22} />
                    </span>
                    <span className="building-choice-copy">
                      <strong>{building.name}</strong>
                      <small>
                        <MapPin size={14} />
                        {building.address || "Chưa cập nhật địa chỉ"}
                      </small>
                      <small>
                        {Number(building.floorCount || 0)} tầng,{" "}
                        {Number(building.carSlotCount || 0)} ô tô
                      </small>
                    </span>
                    {selected && (
                      <CheckCircle2
                        className="building-choice-check"
                        size={24}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!registerBuildingsLoading && registerBuildings.length === 0 && (
            <div className="soft-panel">
              Hệ thống chưa có tòa nhà để lựa chọn. Vui lòng liên hệ quản lý.
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            icon={ArrowRight}
            loading={onboardingLoading}
            disabled={
              onboardingLoading ||
              registerBuildingsLoading ||
              registerBuildings.length === 0
            }
          >
            Xác nhận và vào hệ thống
          </Button>
        </form>
      </main>
    </div>
  );
};

export default GoogleBuildingSelectionPage;
