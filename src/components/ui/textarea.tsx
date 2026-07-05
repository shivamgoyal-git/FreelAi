"use client";

import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  showCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, showCount, maxLength, autoResize, className = "", value, id, required, onChange, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;
    const charCount = typeof value === "string" ? value.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="form-group-redesign">
        {label && (
          <label htmlFor={inputId} className="label-redesign">
            {label}
            {required && <span style={{ color: "var(--color-danger)", marginLeft: "3px" }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          required={required}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          className={`textarea-redesign ${className}`.trim()}
          style={error ? { borderColor: "var(--color-danger)" } : undefined}
          {...props}
        />
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
Textarea.displayName = "Textarea";

export default Textarea;
