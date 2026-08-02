import "./Button.css";
/**
 * @fileoverview Cung cấp component giao diện tái sử dụng Button và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */

/**
 * Thực hiện nghiệp vụ `Button` (button). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function Button
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${loading ? "btn-loading" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner"></span>}
      {!loading && Icon && <Icon size={size === "sm" ? 16 : size === "lg" ? 22 : 18} className="btn-icon" />}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
