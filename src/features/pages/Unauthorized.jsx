import React from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../../context/MockAuthContext";
import Button from "../../components/Button/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const { role } = useMockAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go to default dashboard based on role
    if (role === "User") navigate("/user/dashboard");
    else if (role === "Staff") navigate("/staff/dashboard");
    else if (role === "Manager") navigate("/manager/dashboard");
    else if (role === "Admin") navigate("/admin/dashboard");
    else navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      textAlign: "center",
      padding: "24px"
    }}>
      <div className="card" style={{
        padding: "48px 32px",
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        boxShadow: "var(--shadow-premium)"
      }}>
        <div style={{
          padding: "16px",
          borderRadius: "50%",
          backgroundColor: "var(--danger-light)",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <ShieldAlert size={48} />
        </div>
        
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)" }}>
          Không có quyền truy cập!
        </h1>
        
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
          Tài khoản của bạn đang có vai trò là <strong>{role}</strong>, do đó bạn không có quyền xem trang yêu cầu này.
        </p>

        <Button variant="primary" onClick={handleGoBack} icon={ArrowLeft}>
          Quay lại Trang chủ
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
