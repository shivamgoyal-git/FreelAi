"use client";

interface ProposalScoreRingProps {
  score: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
}

export function ProposalScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label = "Overall",
  showLabel = true,
}: ProposalScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 85
      ? "#22863a"
      : clampedScore >= 70
      ? "#6366F1"
      : clampedScore >= 50
      ? "#B45309"
      : "#D93025";

  const gradientId = `score-gradient-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s var(--ease-spring)" }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="font-heading"
            style={{
              fontSize: size * 0.22,
              color,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {clampedScore}
          </span>
          <span
            style={{
              fontSize: size * 0.1,
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            /100
          </span>
        </div>
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
