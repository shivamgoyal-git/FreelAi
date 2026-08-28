"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CategoryItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface EarningsByCategoryCardProps {
  categories: CategoryItem[];
  currencySymbol: string;
}

export const EarningsByCategoryCard: React.FC<EarningsByCategoryCardProps> = ({
  categories,
  currencySymbol = "$",
}) => {
  const defaultCategories: CategoryItem[] = [
    { name: "Web Dev", value: 111825, percentage: 45, color: "var(--color-brand)" },
    { name: "UI/UX", value: 69580, percentage: 28, color: "#4ade80" },
    { name: "Branding", value: 37275, percentage: 15, color: "#9ca3af" },
    { name: "Consulting", value: 29820, percentage: 12, color: "#4b5563" },
  ];

  const displayData = categories && categories.length > 0 ? categories : defaultCategories;
  const totalValue = displayData.reduce((acc, curr) => acc + curr.value, 0);

  const formattedTotal =
    currencySymbol === "₹"
      ? `₹${(totalValue / 100000).toFixed(1)}L`
      : `${currencySymbol}${totalValue >= 1000 ? `${(totalValue / 1000).toFixed(0)}k` : totalValue}`;

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
      }}
    >
      {/* Header */}
      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
        Categories
      </span>

      {/* Donut & Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flex: 1,
        }}
      >
        {/* Donut */}
        <div style={{ position: "relative", width: "76px", height: "76px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={36}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "10.5px", fontWeight: 650, color: "var(--text-primary)" }}>
              {formattedTotal}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
          {displayData.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>
              </div>

              <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
