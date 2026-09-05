"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X, Globe } from "lucide-react";
import { COUNTRIES, Country } from "@/lib/constants/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  disabled?: boolean;
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select Country...",
  className = "",
  style = {},
  id,
  disabled = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize matched country value
  const matchedCountry = useMemo(() => {
    if (!value) return "";
    return COUNTRIES.find((c) => c.toLowerCase() === value.toLowerCase()) || value;
  }, [value]);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
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

  const handleSelect = (c: string) => {
    onChange(c);
    setIsOpen(false);
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
      {/* Trigger Button */}
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
          padding: "9px 12px",
          gap: "8px",
          fontSize: "12.5px",
          background: "var(--surface-2, #14161b)",
          color: matchedCountry ? "var(--text-primary, #ffffff)" : "var(--text-muted, #71717a)",
          border: isOpen ? "1px solid var(--color-brand, #22c55e)" : "1px solid var(--border, #27272a)",
          borderRadius: "8px",
          transition: "all 0.15s ease",
          boxShadow: isOpen ? "0 0 0 2px rgba(34, 197, 94, 0.15)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Globe size={13} style={{ flexShrink: 0, color: "var(--text-muted, #a1a1aa)" }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {matchedCountry || placeholder}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
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
              placeholder="Search country..."
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
                } else if (e.key === "Enter" && filteredCountries.length > 0) {
                  e.preventDefault();
                  handleSelect(filteredCountries[0]);
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

          {/* Countries List */}
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
            {filteredCountries.length === 0 ? (
              <div
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  color: "var(--text-muted, #71717a)",
                  fontSize: "12px",
                }}
              >
                No countries found matching "{search}"
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = matchedCountry.toLowerCase() === c.toLowerCase();
                return (
                  <div
                    key={c}
                    onClick={() => handleSelect(c)}
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
                    <span>{c}</span>
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
