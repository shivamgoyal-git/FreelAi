import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ChevronDown, Check, X } from "lucide-react";

export interface EntitySelectorItem {
  id: string;
  title: string;
  description?: string;
  avatar?: string | null;
  [key: string]: any;
}

interface EntitySelectorProps {
  label?: string;
  items: EntitySelectorItem[];
  selectedId?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyLabel?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onSelect: (item: EntitySelectorItem | null) => void;
  renderItem?: (item: EntitySelectorItem, active: boolean, focused: boolean) => React.ReactNode;
  triggerRender?: (selectedItem: EntitySelectorItem | null) => React.ReactNode;
}

export default function EntitySelector({
  label,
  items,
  selectedId,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  loading = false,
  emptyLabel = "No matching items found.",
  emptyActionLabel,
  onEmptyAction,
  onSelect,
  renderItem,
  triggerRender,
}: EntitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Auto-focus search input when opening dropdown
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setFocusedIndex(0);
    } else {
      setSearch("");
    }
  }, [open]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredItems.length > 0) {
          setFocusedIndex((prev) => (prev + 1) % filteredItems.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (filteredItems.length > 0) {
          setFocusedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems.length > 0 && focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          onSelect(filteredItems[focusedIndex]);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll focused element into view
  useEffect(() => {
    if (open && listRef.current && filteredItems.length > 0) {
      const listEl = listRef.current;
      const focusedEl = listEl.children[focusedIndex] as HTMLElement;
      if (focusedEl) {
        const listHeight = listEl.clientHeight;
        const focusedTop = focusedEl.offsetTop;
        const focusedHeight = focusedEl.clientHeight;

        if (focusedTop + focusedHeight > listEl.scrollTop + listHeight) {
          listEl.scrollTop = focusedTop + focusedHeight - listHeight;
        } else if (focusedTop < listEl.scrollTop) {
          listEl.scrollTop = focusedTop;
        }
      }
    }
  }, [focusedIndex, open, filteredItems.length]);

  return (
    <div className="form-group-redesign" style={{ position: "relative" }} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && <label className="label-redesign">{label}</label>}

      {/* Trigger Button */}
      <div
        className="input-redesign"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius)",
          padding: "0 14px",
          height: "40px",
          position: "relative",
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", overflow: "hidden" }}>
          {triggerRender ? (
            triggerRender(selectedItem)
          ) : selectedItem ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              {selectedItem.avatar ? (
                <img
                  src={selectedItem.avatar}
                  alt={selectedItem.title}
                  style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--primary-dim)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {selectedItem.title.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                {selectedItem.title}
              </span>
              {selectedItem.description && (
                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  ({selectedItem.description})
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {selectedItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setOpen(false);
              }}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "2px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast)" }} />
        </div>
      </div>

      {/* Dropdown Container */}
      {open && (
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 300,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "320px",
            overflow: "hidden",
            padding: "6px",
          }}
        >
          {/* Search bar inside dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "var(--radius)",
              marginBottom: "6px",
            }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder={searchPlaceholder}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "13px",
                width: "100%",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* List items */}
          <div
            ref={listRef}
            style={{
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px 0", color: "var(--text-muted)" }}>
                <Loader2 size={16} className="loading-spinner" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "13px" }}>Loading...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", textAlign: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>{emptyLabel}</span>
                {emptyActionLabel && onEmptyAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEmptyAction();
                      setOpen(false);
                    }}
                    className="btn btn-primary"
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      height: "auto",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {emptyActionLabel}
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isActive = item.id === selectedId;
                const isFocused = idx === focusedIndex;

                if (renderItem) {
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      style={{ cursor: "pointer" }}
                    >
                      {renderItem(item, isActive, isFocused)}
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "var(--radius)",
                      cursor: "pointer",
                      background: isFocused
                        ? "rgba(255, 255, 255, 0.06)"
                        : isActive
                        ? "rgba(99, 102, 241, 0.08)"
                        : "transparent",
                      transition: "background var(--dur-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.title}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: isActive ? "var(--primary)" : "var(--border-strong)",
                            color: isActive ? "var(--text-on-primary)" : "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </span>
                        {item.description && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && <Check size={14} style={{ color: "var(--primary)" }} />}
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
