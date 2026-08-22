"use client";

import Link from "next/link";
import {
  Sparkles,
  FileCheck2,
  BarChart3,
  Users2,
  FolderKanban,
  Bot,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: "AI Proposal Generator",
    description: "Create winning proposals in seconds with AI that understands your expertise and client needs.",
  },
  {
    icon: FileCheck2,
    title: "Smart Invoicing",
    description: "Send professional invoices, track payments, and get paid faster with automated reminders.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Get real-time insights and make data-driven decisions to grow your business.",
  },
  {
    icon: Users2,
    title: "Client Management",
    description: "Organize all your clients and conversations in one centralized place.",
  },
  {
    icon: FolderKanban,
    title: "Project Tracking",
    description: "Plan, track, and deliver projects on time and within budget.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Your smart business partner that works 24/7 to help you grow.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
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
          gridTemplateColumns: "1fr 1.6fr",
          gap: "48px",
          alignItems: "start",
        }}
        className="grid-responsive-2"
      >
        {/* Left Column: Heading + Copy + Action */}
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
            <span>All-in-One Platform</span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: 0,
              fontFamily: "var(--font-inter-variable), sans-serif",
            }}
          >
            Everything You Need to Run Your Business in{" "}
            <span style={{ color: "var(--color-brand)" }}>One Place</span>
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            FreelAI combines powerful tools with AI intelligence to help you save time, close more deals, and get paid faster.
          </p>

          {/* Action Button */}
          <div style={{ marginTop: "8px" }}>
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--color-brand)",
                color: "var(--color-on-brand)",
                padding: "11px 22px",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s ease",
                boxShadow: "0 3px 10px rgba(139, 207, 53, 0.25)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand)";
              }}
            >
              <span>Explore All Features</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right Column: 6 Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
          className="grid-responsive-2"
        >
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="landing-card"
              style={{
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Icon in green light frame */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--color-brand-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-brand)",
                }}
              >
                <feat.icon size={18} />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: "15.5px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {feat.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.55,
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
