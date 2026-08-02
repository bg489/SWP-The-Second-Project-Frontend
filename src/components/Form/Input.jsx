/**
 * @fileoverview Cung cấp component giao diện tái sử dụng Input và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import React from "react";
import "./Form.css";

/**
 * Khai báo `Input` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/components/Form/Input.jsx.
 */
/* Callback nội bộ của lời gọi `forwardRef`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
const Input = React.forwardRef(({
  type = "text",
  error = false,
  className = "",
  icon: Icon,
  rightElement,
  ...props
}, ref) => {
  return (
    <div className={`input-wrapper ${error ? "has-error" : ""} ${Icon ? "has-icon" : ""} ${rightElement ? "has-right-element" : ""}`}>
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        ref={ref}
        type={type}
        className={`form-input ${className}`}
        {...props}
      />
      {rightElement && <div className="input-right-element">{rightElement}</div>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
