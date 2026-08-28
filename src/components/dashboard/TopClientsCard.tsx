"use client";

import React from "react";
import Link from "next/link";

interface ClientItem {
  clientId?: string;
  name: string;
  avatar?: string;
  company?: string;
  billed?: number;
  revenue?: number;
  status?: string;
}

interface TopClientsCardProps {
  clients: ClientItem[];
  currencySymbol: string;
}

export const TopClientsCard: React.FC<TopClientsCardProps> = ({
  clients,
  currencySymbol = "$",
}) => {
  const displayClients = clients && clients.length > 0 ? clients.slice(0, 3) : [];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
          Top Clients
        </span>

        <Link
          href="/dashboard/clients"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>

      {/* Client List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {displayClients.length === 0 ? (
          <div style={{ padding: "8px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
            No clients added yet.
          </div>
        ) : (
          displayClients.map((client, idx) => {
            const initial = client.name ? client.name.charAt(0).toUpperCase() : "C";
            const amount = client.revenue ?? client.billed ?? 0;

            return (
              <div
                key={client.clientId ? `client-${client.clientId}` : `client-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "var(--surface-3)",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {initial}
                  </div>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 450,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {client.name}
                  </span>
                </div>

                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currencySymbol}{Number(amount).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
