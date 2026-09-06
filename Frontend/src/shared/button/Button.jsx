import React from "react";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

  const variants = {
    primary:
      "bg-primary text-white hover:opacity-90 active:scale-[0.98]",

    secondary:
      "bg-secondary text-primary hover:opacity-90 active:scale-[0.98]",

    outline:
      "border border-border bg-transparent text-primary hover:bg-secondary active:scale-[0.98]",
  };

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        w-full sm:w-auto
        px-5 py-3
        text-sm sm:text-base
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;