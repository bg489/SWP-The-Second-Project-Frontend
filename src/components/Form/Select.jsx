/**
 * @fileoverview Cung cấp component giao diện tái sử dụng Select và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import React from "react";
import "./Form.css";

/**
 * Khai báo `Select` để định nghĩa câu truy vấn SQL nền và ánh xạ các cột dữ liệu cho những thao tác bên dưới.
 * Phạm vi sử dụng: src/components/Form/Select.jsx.
 */
/* Callback nội bộ của lời gọi `forwardRef`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
const Select = React.forwardRef(({
  options = [],
  error = false,
  placeholder = "Chọn một tùy chọn...",
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`select-wrapper ${error ? "has-error" : ""}`}>
      <select
        ref={ref}
        className={`form-select ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

Select.displayName = "Select";

export default Select;
