"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowRight, Clock, FileCheck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AttentionItem {
  id: string;
  type: "deliverable" | "invoice" | "message" | "proposal";
  title: string;
  subtitle: string;
  actionLabel: string;
  actionLink: string;
  urgency: "high" | "medium" | "low";
}

export function AttentionCard({ items }: { items: AttentionItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
      {items.map((item) => {
        const isHigh = item.urgency === "high";
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "16px 20px",
              borderRadius: "12px",
              background: isHigh
                ? "linear-gradient(135deg, rgba(39, 166, 68, 0.12) 0%, rgba(15, 16, 17, 0.95) 100%)"
                : "var(--color-carbon, #0f1011)",
              border: isHigh
                ? "1px solid rgba(39, 166, 68, 0.35)"
                : "1px solid var(--color-graphite, #23252a)",
              boxShadow: isHigh ? "0 0 20px rgba(39, 166, 68, 0.08)" : "none",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "260px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: isHigh ? "rgba(39, 166, 68, 0.2)" : "var(--color-obsidian, #161718)",
                  border: isHigh ? "1px solid rgba(39, 166, 68, 0.4)" : "1px solid var(--color-graphite, #23252a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.type === "deliverable" && (
                  <FileCheck size={20} style={{ color: "var(--color-pulse-green, #27a644)" }} />
                )}
                {item.type === "invoice" && (
                  <Receipt size={20} style={{ color: isHigh ? "#fbbf24" : "var(--color-pulse-green, #27a644)" }} />
                )}
                {item.type === "message" && (
                  <Clock size={20} style={{ color: "var(--color-pulse-green, #27a644)" }} />
                )}
                {item.type === "proposal" && (
                  <CheckCircle2 size={20} style={{ color: "var(--color-pulse-green, #27a644)" }} />
                )}
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 600,
                    color: "var(--color-paper, #ffffff)",
                    margin: "0 0 3px 0",
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--color-fog, #8a8f98)",
                    margin: 0,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>

            <Link href={item.actionLink} style={{ textDecoration: "none" }}>
              <Button
                variant={isHigh ? "primary" : "secondary"}
                size="sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>{item.actionLabel}</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
