import React from "react";
import "./Form.css";

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
