"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, FolderKanban, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import GlowArc from "./GlowArc";

export default function ProductShowcase() {
  const [selectedRange, setSelectedRange] = useState("This Month");

  const recentActivities = [
    {
      id: 1,
      icon: FileText,
      text: 'Invoice #INV-024 sent to Acme Corp',
      time: '2h ago',
    },
    {
      id: 2,
      icon: FolderKanban,
      text: 'New project "Website Redesign" created',
      time: '5h ago',
    },
    {
      id: 3,
      icon: FileText,
      text: 'Proposal sent to TechNova Pvt. Ltd.',
      time: '1d ago',
    },
    {
      id: 4,
      icon: CreditCard,
      text: 'Payment received from Design Labs',
      time: '2d ago',
    },
  ];

  return (
    <section
      style={{
        paddingTop: "64px",
        paddingBottom: "130px",
        position: "relative",
        overflowX: "clip",
        overflowY: "visible",
        width: "100%",
      }}
    >
      {/* Subtle planetary horizon arc (z-index: 1) */}
      <GlowArc />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Outer Dashboard Showcase Container (z-index: 10, overlaps curve) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Top 4 KPI Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Metric 1: Total Revenue */}
            <div
              className="landing-card"
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
                Total Revenue
              </span>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                ₹2,48,500
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-brand)", fontWeight: 500 }}>
                  ↑ 12.5% this month
                </span>
                {/* Mini Sparkline */}
                <svg width="64" height="20" viewBox="0 0 64 20" fill="none">
                  <path
                    d="M2 16 Q 16 14, 28 8 T 48 10 T 62 3"
                    fill="none"
                    stroke="var(--color-brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Metric 2: Active Projects */}
            <div
              className="landing-card"
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
                Active Projects
              </span>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                12
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  ↑ 2 from last month
                </span>
                <div style={{ width: "100%", height: "4px", borderRadius: "2px", background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ width: "70%", height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                </div>
              </div>
            </div>

            {/* Metric 3: Pending Invoices */}
            <div
              className="landing-card"
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
                Pending Invoices
              </span>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                6
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  ₹ 1,25,000 pending
                </span>
                <div style={{ width: "100%", height: "4px", borderRadius: "2px", background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ width: "45%", height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                </div>
              </div>
            </div>

            {/* Metric 4: Proposals Sent */}
            <div
              className="landing-card"
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
                Proposals Sent
              </span>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                18
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  ↑ 6 this month
                </span>
                <div style={{ width: "100%", height: "4px", borderRadius: "2px", background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Wide Analytics & Activity Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: "16px",
            }}
            className="grid-responsive-2"
          >
            {/* Left: Revenue Overview Spline Chart */}
            <div
              className="landing-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Revenue Overview
                </span>
                <button
                  onClick={() => setSelectedRange(selectedRange === "This Month" ? "All Time" : "This Month")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <span>{selectedRange}</span>
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Area Spline SVG Graphic */}
              <div style={{ width: "100%", height: "180px", position: "relative" }}>
                <svg
                  viewBox="0 0 450 180"
                  style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="splineGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="var(--color-brand)" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="440" y2="20" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="30" y1="60" x2="440" y2="60" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="30" y1="100" x2="440" y2="100" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="30" y1="140" x2="440" y2="140" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />

                  {/* Y-Axis Labels */}
                  <text x="5" y="24" fill="var(--text-muted)" fontSize="9" textAnchor="start">₹80K</text>
                  <text x="5" y="64" fill="var(--text-muted)" fontSize="9" textAnchor="start">₹60K</text>
                  <text x="5" y="104" fill="var(--text-muted)" fontSize="9" textAnchor="start">₹40K</text>
                  <text x="5" y="144" fill="var(--text-muted)" fontSize="9" textAnchor="start">₹20K</text>
                  <text x="18" y="174" fill="var(--text-muted)" fontSize="9" textAnchor="start">₹0</text>

                  {/* Area Gradient Fill */}
                  <path
                    d="M 50 170 C 80 150, 100 135, 120 130 C 150 120, 170 145, 190 140 C 220 130, 240 85, 270 80 C 300 75, 330 100, 360 95 C 380 90, 400 45, 430 40 L 430 170 Z"
                    fill="url(#splineGreenGrad)"
                  />

                  {/* Spline Stroke Line */}
                  <path
                    d="M 50 170 C 80 150, 100 135, 120 130 C 150 120, 170 145, 190 140 C 220 130, 240 85, 270 80 C 300 75, 330 100, 360 95 C 380 90, 400 45, 430 40"
                    fill="none"
                    stroke="var(--color-brand)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Points / Nodes */}
                  <circle cx="120" cy="130" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                  <circle cx="190" cy="140" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                  <circle cx="270" cy="80" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                  <circle cx="360" cy="95" r="3.5" fill="var(--surface-1)" stroke="var(--color-brand)" strokeWidth="2" />
                  <circle cx="430" cy="40" r="4.5" fill="var(--color-brand)" stroke="var(--surface-1)" strokeWidth="2" />

                  {/* X-Axis Month Labels */}
                  <text x="50" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Jan</text>
                  <text x="120" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Feb</text>
                  <text x="190" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Mar</text>
                  <text x="270" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Apr</text>
                  <text x="360" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">May</text>
                  <text x="430" y="176" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Jun</text>
                </svg>
              </div>
            </div>

            {/* Right: Recent Activity Card */}
            <div
              className="landing-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Recent Activity
                </span>
                <a
                  href="/dashboard"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "var(--color-brand)",
                    textDecoration: "none",
                  }}
                >
                  View all
                </a>
              </div>

              {/* Activity Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "6px",
                          background: "rgba(139, 207, 53, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-brand)",
                          flexShrink: 0,
                        }}
                      >
                        <act.icon size={13} />
                      </div>
                      <span
                        style={{
                          fontSize: "12.5px",
                          color: "var(--text-primary)",
                          lineHeight: 1.4,
                          fontWeight: 400,
                        }}
                      >
                        {act.text}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
