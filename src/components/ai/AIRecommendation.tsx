import React from "react";
import { Lightbulb } from "lucide-react";

interface AIRecommendationProps {
  recommendation: string;
  style?: React.CSSProperties;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({ recommendation, style }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--spacing-12)",
        padding: "var(--spacing-12) var(--spacing-16)",
        background: "rgba(139, 92, 246, 0.05)",
        border: "1px solid rgba(139, 92, 246, 0.15)",
        borderRadius: "var(--radius)",
        ...style,
      }}
    >
      <Lightbulb size={16} color="var(--color-lavender)" style={{ flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {recommendation}
        </p>
      </div>
    </div>
  );
};

export default AIRecommendation;
