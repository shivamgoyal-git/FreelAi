"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AIIntelligenceSection() {
  const barHeights = [40, 60, 48, 85, 68, 95];

  const topClients = [
    { name: "Acme Corp", amount: "₹85,000", bg: "#f97316", initial: "A" },
    { name: "TechNova Pvt. Ltd.", amount: "₹62,000", bg: "#06b6d4", initial: "T" },
    { name: "Design Labs", amount: "₹45,000", bg: "#3b82f6", initial: "D" },
    { name: "Studio Pro", amount: "₹28,000", bg: "#8b5cf6", initial: "S" },
  ];

  return (
    <section
      style={{
        paddingTop: "70px",
        paddingBottom: "130px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 2.2fr",
          gap: "48px",
          alignItems: "center",
        }}
        className="grid-responsive-2"
      >
        {/* Left Column: Heading + Copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "var(--color-brand-subtle)",
              border: "1px solid rgba(139, 207, 53, 0.3)",
              color: "var(--color-brand)",
              fontSize: "12px",
              fontWeight: 500,
              width: "fit-content",
            }}
          >
            <Sparkles size={12} />
            <span>Data-Driven Growth</span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(28px, 3.8vw, 40px)",
              fontWeight: 750,
              lineHeight: 1.18,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              margin: 0,
              fontFamily: "var(--font-heading)",
            }}
          >
            Your Business, Backed by{" "}
            <span style={{ color: "var(--color-brand)" }}>Intelligence</span>
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.62,
              letterSpacing: "-0.008em",
              color: "var(--text-secondary)",
              margin: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            Powerful analytics and AI insights to help you make smarter decisions and achieve more.
          </p>
        </div>

        {/* Right Column: 3 Analytics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
          className="grid-responsive-3"
        >
          {/* Card 1: Earnings Overview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="landing-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                Earnings Overview
              </span>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.025em", marginTop: "4px", fontFamily: "var(--font-heading)" }}>
                ₹2,48,500
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--color-brand)", fontWeight: 500, display: "inline-block", marginTop: "2px", fontFamily: "var(--font-body)" }}>
                ↑ 12.5% this month
              </span>
            </div>

            {/* Vertical Bars Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "90px", gap: "6px", paddingTop: "10px" }}>
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === 5 ? "var(--color-brand)" : "rgba(139, 207, 53, 0.4)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Card 2: Top Clients */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="landing-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
              Top Clients
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topClients.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: c.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {c.initial}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {c.amount}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Invoice Status Donut */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="landing-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)" }}>
              Invoice Status
            </span>

            {/* Donut Chart SVG */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80px" }}>
              <svg width="80" height="80" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--surface-3)" strokeWidth="12" />
                {/* Paid 62% segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="12"
                  strokeDasharray="148 238"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                />
                {/* Pending 28% segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="rgba(139, 207, 53, 0.4)"
                  strokeWidth="12"
                  strokeDasharray="66 238"
                  strokeDashoffset="-88"
                  strokeLinecap="round"
                />
                {/* Overdue 10% segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#eb5757"
                  strokeWidth="12"
                  strokeDasharray="24 238"
                  strokeDashoffset="-154"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-brand)" }} />
                  <span style={{ color: "var(--text-muted)" }}>Paid</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>62%</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(139, 207, 53, 0.5)" }} />
                  <span style={{ color: "var(--text-muted)" }}>Pending</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>28%</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#eb5757" }} />
                  <span style={{ color: "var(--text-muted)" }}>Overdue</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>10%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
