import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AIActionCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onActionClick: () => void;
  loading?: boolean;
  style?: React.CSSProperties;
}

export const AIActionCard: React.FC<AIActionCardProps> = ({
  title,
  description,
  actionLabel,
  onActionClick,
  loading,
  style,
}) => {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-cards)",
        padding: "var(--spacing-20) var(--spacing-24)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-16)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, var(--color-iris-violet) 0%, var(--color-signal-teal) 100%)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
        <h4
          className="font-heading"
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--text-primary)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-8)",
          }}
        >
          <Sparkles size={14} color="var(--color-iris-violet)" />
          {title}
        </h4>
        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>

      <Button
        variant="primary"
        size="sm"
        loading={loading}
        onClick={onActionClick}
        style={{ width: "fit-content" }}
      >
        {actionLabel}
      </Button>
    </div>
  );
};

export default AIActionCard;
