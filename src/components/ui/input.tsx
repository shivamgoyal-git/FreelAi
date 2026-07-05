"use client";

import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCount?: boolean;
  maxLength?: number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, showCount, maxLength, className = "", value, id, required, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="form-group-redesign">
        {label && (
          <label htmlFor={inputId} className="label-redesign">
            {label}
            {required && <span style={{ color: "var(--color-danger)", marginLeft: "3px" }}>*</span>}
          </label>
        )}
        <div style={{ position: "relative" }}>
          {leftIcon && (
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
            className={`input-redesign ${leftIcon ? "has-icon" : ""} ${className}`.trim()}
            style={error ? { borderColor: "var(--color-danger)" } : undefined}
            {...props}
          />
          {rightIcon && (
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
              {rightIcon}
            </span>
          )}
        </div>
        {showCount && maxLength && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
            {charCount}/{maxLength}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} role="alert" style={{ fontSize: "12px", color: "var(--color-danger)" }}>
            {error}
          </span>
        )}
        {helper && !error && (
          <span id={`${inputId}-helper`} style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {helper}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
