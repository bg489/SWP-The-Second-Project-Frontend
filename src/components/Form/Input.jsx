import React from "react";
import "./Form.css";

const Input = React.forwardRef(({
  type = "text",
  error = false,
  className = "",
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className={`input-wrapper ${error ? "has-error" : ""} ${Icon ? "has-icon" : ""}`}>
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        ref={ref}
        type={type}
        className={`form-input ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

export default Input;
