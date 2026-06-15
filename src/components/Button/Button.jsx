import React from "react";
import "./Button.css";

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
