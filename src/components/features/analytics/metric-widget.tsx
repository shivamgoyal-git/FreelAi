"use client";

import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricWidgetProps {
  title: string;
  value: number | string;
  format?: "number" | "currency" | "percent";
  currency?: string;
  trend?: number;
  trendLabel?: string;
  period?: string;
  loading?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
}

function AnimatedCounter({ target, format, currency = "$" }: { target: number; format?: string; currency?: string }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [target]);

  if (format === "currency") return <>{currency}{current.toLocaleString()}</>;
  if (format === "percent")  return <>{current}%</>;
  return <>{current.toLocaleString()}</>;
}

export function MetricWidget({
  title, value, format = "number", currency = "$", trend, trendLabel, period, loading, error, icon,
}: MetricWidgetProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""));

  return (
    <div className="metric-widget">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <p className="metric-widget-label">{title}</p>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="skeleton" style={{ height: "28px", width: "70%" }} />
          <div className="skeleton" style={{ height: "11px", width: "40%" }} />
        </div>
      ) : error ? (
        <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>Failed to load</p>
      ) : (
        <>
          <p className="metric-widget-value">
            {typeof value === "number"
              ? <AnimatedCounter target={numericValue} format={format} currency={currency} />
              : value}
          </p>

          {trend !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "8px" }}>
              {trend > 0 ? <TrendingUp size={13} className="metric-trend-up" /> :
               trend < 0 ? <TrendingDown size={13} className="metric-trend-down" /> :
               <Minus size={13} style={{ color: "var(--text-muted)" }} />}
              <span className={trend > 0 ? "metric-trend-up" : trend < 0 ? "metric-trend-down" : ""} style={{ fontSize: "12px", fontWeight: 600 }}>
                {Math.abs(trend)}%
              </span>
              {period && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{period}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MetricWidget;
