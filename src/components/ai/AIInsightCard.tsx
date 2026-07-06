import React from "react";
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface AIInsightCardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ title = "AI Insight", children, style }) => {
  return (
    <Card
      style={{
        borderLeft: "2px solid var(--color-signal-teal)",
        background: "var(--surface-1)",
        ...style,
      }}
    >
      <CardHeader style={{ paddingBottom: "var(--spacing-8)", display: "flex", flexDirection: "row", alignItems: "center", gap: "var(--spacing-8)" }}>
        <Sparkles size={14} color="var(--color-signal-teal)" />
        <CardTitle style={{ fontSize: "var(--text-caption)", color: "var(--color-signal-teal)", fontWeight: 510, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: "0 var(--spacing-24) var(--spacing-20) var(--spacing-24)", fontSize: "var(--text-body-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
