import React from "react";
import "./Form.css";

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
