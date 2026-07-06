/**
 * Recharts Centralized Theme Configuration
 */

export const chartTheme = {
  grid: {
    strokeDasharray: "4 4",
    stroke: "var(--border)",
  },
  xAxis: {
    tick: { fill: "var(--text-muted)", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
  yAxis: {
    tick: { fill: "var(--text-muted)", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
  tooltip: {
    contentStyle: {
      background: "var(--surface-2)",
      border: "0.5px solid var(--border)",
      borderRadius: "6px",
      fontSize: "12px",
    },
    itemStyle: { color: "var(--text-primary)" },
    labelStyle: { color: "var(--text-muted)", fontWeight: 510 },
  },
  legend: {
    wrapperStyle: {
      fontSize: "12px",
      color: "var(--text-secondary)",
    },
  },
};

export default chartTheme;
