import React from "react";
import { Badge } from "@/components/ui/Badge";

interface StatusBadgeProps {
  status: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const normalized = status.toLowerCase().replace(/_/g, " ");

  let variant: "active" | "pending" | "draft" | "overdue" | "inactive" = "inactive";

  if (["completed", "active", "paid"].includes(normalized)) {
    variant = "active";
  } else if (["in review", "on hold", "sent", "partially paid", "pending"].includes(normalized)) {
    variant = "pending";
  } else if (["draft"].includes(normalized)) {
    variant = "draft";
  } else if (["overdue", "cancelled", "failed"].includes(normalized)) {
    variant = "overdue";
  }

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Badge variant={variant} style={style}>
      {capitalize(normalized)}
    </Badge>
  );
};

export default StatusBadge;
