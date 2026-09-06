// src/shared/input/Input.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  error,
  registration = {},
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} ${
            isPassword ? "pr-9" : "pr-3"
          } py-2.5 text-sm bg-surface border rounded-lg outline-none transition-colors duration-200
            ${
              error
                ? "border-error focus:border-error"
                : "border-border focus:border-accent"
            }
          `}
          {...registration}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-error mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default Input;