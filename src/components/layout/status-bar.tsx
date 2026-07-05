"use client";

import React, { useState, useEffect } from "react";
import { Database, Cpu, Cloud } from "lucide-react";

type StatusLevel = "ok" | "warn" | "error" | "loading";

interface StatusItem {
  label: string;
  status: StatusLevel;
  icon: React.ElementType;
}

const DOT: Record<StatusLevel, string> = {
  ok:      "status-dot status-dot-green",
  warn:    "status-dot status-dot-amber",
  error:   "status-dot status-dot-red",
  loading: "status-dot status-dot-amber",
};

export default function StatusBar() {
  const [items, setItems] = useState<StatusItem[]>([
    { label: "Database", status: "loading", icon: Database },
    { label: "AI",       status: "loading", icon: Cpu },
    { label: "Sync",     status: "ok",      icon: Cloud },
  ]);

  useEffect(() => {
    // Simulate connection checks
    const timer = setTimeout(() => {
      setItems([
        { label: "Database", status: "ok", icon: Database },
        { label: "AI",       status: "ok", icon: Cpu },
        { label: "Sync",     status: "ok", icon: Cloud },
      ]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="status-bar" role="status" aria-live="polite">
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <span className={DOT[item.status]} />
          <span style={{ fontSize: "10.5px", whiteSpace: "nowrap" }}>{item.label}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
