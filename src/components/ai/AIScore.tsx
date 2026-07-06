import React from "react";

interface AIScoreProps {
  score: number; // 0 to 100
  label?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const AIScore: React.FC<AIScoreProps> = ({ score, label = "AI Score", size = 80, style }) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "var(--color-pulse-green)"; // green
  if (score < 60) {
    color = "var(--color-coral-red)"; // red
  } else if (score < 85) {
    color = "var(--color-iris-violet)"; // violet
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-8)",
        padding: "var(--spacing-16)",
        ...style,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--surface-3)"
            strokeWidth={strokeWidth}
          />
          {/* Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${size * 0.22}px`,
            fontWeight: 510,
            color: "var(--text-primary)",
          }}
        >
          {score}%
        </div>
      </div>
      {label && (
        <span
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default AIScore;
