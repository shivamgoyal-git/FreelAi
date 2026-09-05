"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X, Languages as LanguagesIcon, Plus } from "lucide-react";
import { LANGUAGES } from "@/lib/constants/languages";

interface LanguageSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  disabled?: boolean;
}

export default function LanguageSelect({
  value = [],
  onChange,
  placeholder = "Select languages...",
  className = "",
  style = {},
  id,
  disabled = false,
}: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize selected list for case-insensitive comparison
  const selectedSet = useMemo(() => {
    return new Set(value.map((v) => v.trim().toLowerCase()));
  }, [value]);

  // Filter languages based on search term
  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.toLowerCase().trim();
    return LANGUAGES.filter((l) => l.toLowerCase().includes(q));
  }, [search]);

  // Check if search query exactly matches an existing option
  const hasExactMatch = useMemo(() => {
    if (!search.trim()) return false;
    const q = search.toLowerCase().trim();
    return LANGUAGES.some((l) => l.toLowerCase() === q);
  }, [search]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opened & clear search
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleToggleLanguage = (lang: string) => {
    const cleanLang = lang.trim();
    if (!cleanLang) return;

    const isAlreadySelected = selectedSet.has(cleanLang.toLowerCase());
    if (isAlreadySelected) {
      onChange(value.filter((v) => v.trim().toLowerCase() !== cleanLang.toLowerCase()));
    } else {
      onChange([...value, cleanLang]);
    }
  };

  const handleAddCustom = () => {
    const clean = search.trim();
    if (!clean) return;
    if (!selectedSet.has(clean.toLowerCase())) {
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      onChange([...value, formatted]);
    }
    setSearch("");
  };

  const handleRemoveTag = (langToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(value.filter((l) => l.toLowerCase() !== langToRemove.toLowerCase()));
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Trigger Box with inline selected badges */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={className || "input-field"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          minHeight: "40px",
          padding: "5px 10px",
          gap: "8px",
          fontSize: "12.5px",
          background: "var(--surface-2, #14161b)",
          border: isOpen ? "1px solid var(--color-brand, #22c55e)" : "1px solid var(--border, #27272a)",
          borderRadius: "8px",
          transition: "all 0.15s ease",
          boxShadow: isOpen ? "0 0 0 2px rgba(34, 197, 94, 0.15)" : "none",
        }}
      >
        {/* Left icon and selected pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "5px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <LanguagesIcon
            size={13}
            style={{
              flexShrink: 0,
              color: value.length > 0 ? "var(--color-brand, #22c55e)" : "var(--text-muted, #a1a1aa)",
              marginRight: "2px",
            }}
          />

          {value.length === 0 ? (
            <span style={{ color: "var(--text-muted, #71717a)", fontSize: "12.5px" }}>
              {placeholder}
            </span>
          ) : (
            value.map((l) => (
              <span
                key={l}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 7px",
                  borderRadius: "5px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "var(--text-primary, #ffffff)",
                  border: "1px solid rgba(34, 197, 94, 0.28)",
                  lineHeight: 1.2,
                }}
              >
                <span>{l}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(l, e)}
                  title={`Remove ${l}`}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted, #a1a1aa)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                    transition: "color 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger, #ef4444)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted, #a1a1aa)")}
                >
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Right dropdown chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginLeft: "4px" }}>
          <ChevronDown
            size={14}
            style={{
              color: "var(--text-muted, #a1a1aa)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "var(--surface-1, #0f1015)",
            border: "1px solid var(--border-strong, #2f3336)",
            borderRadius: "10px",
            boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
            maxHeight: "320px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid var(--border, #22252a)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface-2, #14161b)",
            }}
          >
            <Search size={13} style={{ color: "var(--text-muted, #71717a)", flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type language..."
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary, #ffffff)",
                fontSize: "12.5px",
                padding: "2px 0",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsOpen(false);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (filteredLanguages.length > 0 && search.trim()) {
                    handleToggleLanguage(filteredLanguages[0]);
                  } else if (search.trim()) {
                    handleAddCustom();
                  }
                }
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Languages List */}
          <div
            ref={listRef}
            style={{
              overflowY: "auto",
              maxHeight: "260px",
              padding: "4px",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--border-strong, #333) transparent",
            }}
          >
            {/* Custom option when search doesn't match predefined list */}
            {search.trim() && !hasExactMatch && (
              <div
                onClick={handleAddCustom}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  fontSize: "12.5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--color-brand, #22c55e)",
                  background: "rgba(34, 197, 94, 0.06)",
                  fontWeight: 500,
                  marginBottom: "4px",
                  border: "1px dashed rgba(34, 197, 94, 0.3)",
                }}
              >
                <Plus size={13} />
                <span>Add &ldquo;{search.trim()}&rdquo;</span>
              </div>
            )}

            {filteredLanguages.length === 0 && !search.trim() ? (
              <div
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  color: "var(--text-muted, #71717a)",
                  fontSize: "12px",
                }}
              >
                No languages found
              </div>
            ) : (
              filteredLanguages.map((l) => {
                const isSelected = selectedSet.has(l.toLowerCase());
                return (
                  <div
                    key={l}
                    onClick={() => handleToggleLanguage(l)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      fontSize: "12.5px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: isSelected ? "var(--color-brand, #22c55e)" : "var(--text-secondary, #d4d4d8)",
                      background: isSelected ? "rgba(34, 197, 94, 0.1)" : "transparent",
                      fontWeight: isSelected ? 500 : 400,
                      transition: "all 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--surface-2, #1c1f26)";
                        e.currentTarget.style.color = "var(--text-primary, #ffffff)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary, #d4d4d8)";
                      }
                    }}
                  >
                    <span>{l}</span>
                    {isSelected && <Check size={13} style={{ color: "var(--color-brand, #22c55e)" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
