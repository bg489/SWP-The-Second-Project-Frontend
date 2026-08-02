/**
 * @fileoverview Xây dựng màn hình PlaceholderPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { Info } from "lucide-react";

/**
 * Thực hiện nghiệp vụ `PlaceholderPage` (placeholder page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function PlaceholderPage
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="card animate-fade-in" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
          <Info size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800" }}>{title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
            {description || "Trang này đang được chuẩn bị để sử dụng trong hệ thống."}
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
          Mục "{title}" đang được hoàn thiện.
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "450px" }}>
          Các thao tác chính sẽ được bổ sung theo cùng phong cách với phần còn lại của hệ thống.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
