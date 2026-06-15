import React from "react";
import { useMockAuth } from "../../context/MockAuthContext";
import { Info } from "lucide-react";

const PlaceholderPage = ({ title, description }) => {
  const { role } = useMockAuth();
  
  return (
    <div className="card animate-fade-in" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
          <Info size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800" }}>{title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
            {description || `Trang chức năng giả lập dành riêng cho vai trò ${role}.`}
          </p>
        </div>
      </div>

      <div style={{
        padding: "64px 32px",
        border: "2px dashed var(--border-color)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-primary)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
          Module "{title}" đang trong trạng thái chờ kết nối dữ liệu.
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "450px" }}>
          Khung sườn giao diện (UI skeleton) của trang đã được thiết lập xong. Khi có dữ liệu API từ phía Backend, chỉ cần kết nối các endpoints tương ứng vào saga.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
