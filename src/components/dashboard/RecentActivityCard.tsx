"use client";

import React, { useState } from "react";
import {
  FileText,
  Briefcase,
  Send,
  DollarSign,
  UserCheck,
  Sparkles,
  X,
} from "lucide-react";

interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

function getActivityIcon(type: string) {
  switch (type) {
    case "invoice_sent":
    case "invoice_paid":
      return DollarSign;
    case "project_created":
    case "project_updated":
      return Briefcase;
    case "proposal_generated":
    case "proposal_sent":
      return Send;
    case "client_added":
      return UserCheck;
    default:
      return FileText;
  }
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const displayList = activities && activities.length > 0 ? activities.slice(0, 5) : [];

  return (
    <>
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            Activity
          </span>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "11px",
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            View all
          </button>
        </div>

        {/* Activity Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {displayList.length === 0 ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "11.5px" }}>
              No recent activity.
            </div>
          ) : (
            displayList.map((act, idx) => {
              const Icon = getActivityIcon(act.type);
              const relTime = formatRelativeTime(act.createdAt);

              return (
                <div
                  key={act._id ? `act-${act._id}` : `act-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <Icon size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {act.title}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {relTime}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for View All */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-strong)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "460px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                Activity History
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "14px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {activities.map((act, idx) => {
                const Icon = getActivityIcon(act.type);
                return (
                  <div key={act._id ? `modal-act-${act._id}` : `modal-act-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <Icon size={13} style={{ color: "var(--text-muted)", marginTop: "2px", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{act.title}</p>
                      {act.description && (
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "1px 0 0 0" }}>{act.description}</p>
                      )}
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                        {formatRelativeTime(act.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
