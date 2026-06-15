import React from "react";
import "./Form.css";

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
            return React.cloneElement(child, { error: !!error });
          }
          return child;
        })}
      </div>
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
};

export default FormField;
