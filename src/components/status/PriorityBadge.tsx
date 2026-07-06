import React from "react";
import { Badge } from "@/components/ui/Badge";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | string;
  style?: React.CSSProperties;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, style }) => {
  const norm = priority.toLowerCase().trim();

  let variant: "active" | "pending" | "draft" | "overdue" | "inactive" = "inactive";
  let label = "Low";

  if (norm === "high" || norm === "urgent") {
    variant = "overdue"; // maps to coral red
    label = "High";
  } else if (norm === "medium" || norm === "normal") {
    variant = "pending"; // maps to iris violet
    label = "Medium";
  } else {
    variant = "inactive"; // maps to muted ash/fog
    label = "Low";
  }

  return (
    <Badge variant={variant} style={style}>
      {label}
    </Badge>
  );
};

export default PriorityBadge;
