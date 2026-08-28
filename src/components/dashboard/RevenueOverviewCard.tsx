"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataItem {
  month: string;
  earnings: number;
}

interface RevenueOverviewCardProps {
  data: {
    ytd: ChartDataItem[];
    "6m": ChartDataItem[];
    "3m": ChartDataItem[];
    this_month: ChartDataItem[];
    last_month: ChartDataItem[];
  };
  currencySymbol: string;
}

const TIME_RANGES = [
  { key: "ytd", label: "YTD" },
  { key: "6m", label: "6M" },
  { key: "3m", label: "3M" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
] as const;

export const RevenueOverviewCard: React.FC<RevenueOverviewCardProps> = ({
  data,
  currencySymbol = "$",
}) => {
  const [selectedRange, setSelectedRange] = useState<keyof typeof data>("ytd");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeData = data?.[selectedRange] || data?.ytd || [];
  const currentRangeLabel = TIME_RANGES.find((r) => r.key === selectedRange)?.label || "YTD";

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Revenue
        </span>

        {/* Time range selector */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              fontSize: "11px",
              fontWeight: 500,
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <span>{currentRangeLabel}</span>
            <ChevronDown size={11} />
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  width: "100px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "6px",
                  padding: "2px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      setSelectedRange(r.key);
                      setDropdownOpen(false);
                    }}
                    style={{
                      textAlign: "left",
                      padding: "5px 8px",
                      fontSize: "11px",
                      fontWeight: selectedRange === r.key ? 600 : 400,
                      color: selectedRange === r.key ? "var(--color-brand)" : "var(--text-primary)",
                      background: selectedRange === r.key ? "rgba(139, 207, 53, 0.08)" : "transparent",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ flex: 1, minHeight: "180px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 4, right: 6, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueSubtle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v === 0
                  ? "0"
                  : `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
              }
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-strong)",
                borderRadius: "6px",
                fontSize: "11px",
              }}
              itemStyle={{ color: "var(--color-brand)" }}
              labelStyle={{ color: "var(--text-muted)", marginBottom: "2px" }}
              formatter={(value) => [
                `${currencySymbol}${Number(value || 0).toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="var(--color-brand)"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#revenueSubtle)"
              dot={false}
              activeDot={{
                r: 3.5,
                stroke: "var(--color-brand)",
                strokeWidth: 1.5,
                fill: "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
