/**
 * @fileoverview Cung cấp component giao diện tái sử dụng FormField và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import React from "react";
import "./Form.css";

/**
 * Thực hiện nghiệp vụ `FormField` (form field). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function FormField
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const FormField = ({
  label,
  error,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={`form-field ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="label-required">*</span>}
        </label>
      )}
      <div className="form-control-wrapper">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (typeof child.type === "string") {
              return React.cloneElement(child, {
                "aria-invalid": error ? true : undefined,
              });
            }

            return React.cloneElement(child, { error: error ? true : undefined });
          }
          return child;
        })}
      </div>
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
};

export default FormField;
