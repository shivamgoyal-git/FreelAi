import React from "react";
import { Badge } from "@/components/ui/Badge";

interface ProgressBadgeProps {
  progress: number;
  style?: React.CSSProperties;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({ progress, style }) => {
  let variant: "active" | "pending" | "draft" | "overdue" | "inactive" = "inactive";

  if (progress === 100) {
    variant = "active";
  } else if (progress > 0) {
    variant = "pending";
  } else {
    variant = "draft";
  }

  return (
    <Badge variant={variant} style={style}>
      {progress}%
    </Badge>
  );
};

export default ProgressBadge;
