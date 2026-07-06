import React from "react";
import { Badge } from "@/components/ui/Badge";

interface AIConfidenceBadgeProps {
  score: number; // 0 to 100
  style?: React.CSSProperties;
}

export const AIConfidenceBadge: React.FC<AIConfidenceBadgeProps> = ({ score, style }) => {
  let variant: "active" | "pending" | "draft" | "overdue" | "inactive" = "inactive";

  if (score >= 85) {
    variant = "active"; // green
  } else if (score >= 60) {
    variant = "pending"; // violet
  } else {
    variant = "overdue"; // red
  }

  return (
    <Badge variant={variant} style={style}>
      {score}% Match
    </Badge>
  );
};

export default AIConfidenceBadge;
