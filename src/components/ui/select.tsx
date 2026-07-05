"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  defaultValue,
  placeholder = "Select an option...",
  options,
  label,
  error,
  id,
  name,
  disabled,
}: SelectProps) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="form-group-redesign">
      {label && (
        <label htmlFor={selectId} className="label-redesign">
          {label}
        </label>
      )}
      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        name={name}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          id={selectId}
          className="input-redesign"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderColor: error ? "var(--color-danger)" : undefined,
            cursor: disabled ? "not-allowed" : "pointer",
            background: "var(--surface-2)",
          }}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon style={{ color: "var(--text-muted)", display: "flex" }}>
            <ChevronDown size={14} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            style={{
              overflow: "hidden",
              background: "var(--surface-1)",
              borderRadius: "var(--radius)",
              border: "0.5px solid var(--border-strong)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 300,
            }}
          >
            <RadixSelect.ScrollUpButton style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "25px", background: "var(--surface-1)", color: "var(--text-secondary)", cursor: "default" }}>
              <ChevronDown size={14} style={{ transform: "rotate(180deg)" }} />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport style={{ padding: "4px" }}>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 24px 8px 12px",
                    position: "relative",
                    userSelect: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator style={{ position: "absolute", right: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "25px", background: "var(--surface-1)", color: "var(--text-secondary)", cursor: "default" }}>
              <ChevronDown size={14} />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && (
        <span style={{ fontSize: "12px", color: "var(--color-danger)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
