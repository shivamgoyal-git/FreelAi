import React from "react";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  initials: string;
  size?: number;
  hoverScale?: boolean;
}

export default function UserAvatar({
  src,
  name,
  initials,
  size = 34,
  hoverScale = true,
}: UserAvatarProps) {
  return (
    <div
      className="avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: "var(--color-brand)",
        color: "var(--color-on-brand)",
        fontSize: size <= 34 ? "12px" : "14px",
        fontWeight: 700,
        cursor: "pointer",
        border: "0.5px solid var(--border-strong)",
        borderRadius: "50%",
        overflow: "hidden",
        padding: 0,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform var(--dur-fast) ease",
      }}
      onMouseEnter={(e) => {
        if (hoverScale) {
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverScale) {
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
