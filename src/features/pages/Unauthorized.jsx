import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { useMockAuth } from "../../context/MockAuthContext";
import { roleHomePaths, roleLabels } from "../../services/mockParkingData";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  const { role } = useMockAuth();
  const navigate = useNavigate();

  return (
    <div className="parking-page" style={{ minHeight: "70vh", justifyContent: "center", alignItems: "center" }}>
      <div className="card section-card" style={{ maxWidth: 520, textAlign: "center" }}>
        <div className="metric-icon" style={{ margin: "0 auto 16px", color: "var(--danger)", background: "var(--danger-light)" }}>
          <ShieldAlert size={28} />
        </div>
        <h1 className="section-title" style={{ justifyContent: "center" }}>Bạn chưa có quyền vào trang này</h1>
        <p className="section-copy" style={{ marginTop: 10 }}>
          Vai trò hiện tại của bạn là <strong>{roleLabels[role] || role}</strong>. Hãy quay lại trang phù hợp với tài khoản này.
        </p>
        <div style={{ marginTop: 20 }}>
          <Button variant="primary" icon={ArrowLeft} onClick={() => navigate(roleHomePaths[role] || "/login")}>
            Quay lại trang chính
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
