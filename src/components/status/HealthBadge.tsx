import React from "react";
import { Badge } from "@/components/ui/Badge";

interface HealthBadgeProps {
  health: "good" | "warning" | "risk" | string;
  style?: React.CSSProperties;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ health, style }) => {
  const norm = health.toLowerCase().trim();

  let variant: "active" | "pending" | "draft" | "overdue" | "inactive" = "inactive";
  let label = "Stable";

  if (norm === "good" || norm === "healthy") {
    variant = "active"; // maps to green
    label = "Healthy";
  } else if (norm === "warning" || norm === "hold") {
    variant = "pending"; // maps to violet
    label = "Warning";
  } else if (norm === "risk" || norm === "poor" || norm === "at_risk") {
    variant = "overdue"; // maps to red
    label = "At Risk";
  }

  return (
    <Badge variant={variant} style={style}>
      {label}
    </Badge>
  );
};

export default HealthBadge;
