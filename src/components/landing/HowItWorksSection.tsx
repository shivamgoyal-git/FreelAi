"use client";

import {
  Sparkles,
  User,
  FolderKanban,
  Wand2,
  TrendingUp,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Sign Up",
    desc: "Create your free account in minutes.",
    icon: User,
  },
  {
    num: "02",
    title: "Add Clients & Projects",
    desc: "Organize your clients and projects in one workspace.",
    icon: FolderKanban,
  },
  {
    num: "03",
    title: "Use AI to Work Smarter",
    desc: "Generate proposals, draft emails, and automate tasks.",
    icon: Wand2,
  },
  {
    num: "04",
    title: "Send & Track",
    desc: "Send proposals and invoices, track progress in real-time.",
    icon: TrendingUp,
  },
  {
    num: "05",
    title: "Get Paid & Grow",
    desc: "Get paid faster, grow your revenue, and scale your business.",
    icon: Rocket,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
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
          display: "flex",
          flexDirection: "column",
          gap: "36px",
        }}
      >
        {/* Section Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
            <span>Simple Process</span>
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
            Begin Your Journey with{" "}
            <span style={{ color: "var(--color-brand)" }}>FreeLAI</span>
          </h2>
        </div>

        {/* 2-Column Content: Left Workflow Steps, Right Testimonial & Mascot */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "36px",
            alignItems: "stretch",
          }}
          className="grid-responsive-2"
        >
          {/* Left: 5-Step Process Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
            {/* Connected Vertical Timeline Line */}
            <div
              style={{
                position: "absolute",
                top: "28px",
                bottom: "28px",
                left: "17px",
                width: "1px",
                background: "var(--border)",
                zIndex: 0,
              }}
            />

            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  position: "relative",
                  zIndex: 1,
                  gap: "14px",
                }}
              >
                {/* Left: Number circle + Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      flexShrink: 0,
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "14.5px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--text-muted)",
                        margin: "3px 0 0 0",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Right: Step Icon */}
                <div
                  style={{
                    color: "var(--color-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <step.icon size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Testimonial & Animated Planet Mascot Card */}
          <div
            id="testimonials"
            className="landing-card"
            style={{
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated Planet / Mascot SVG */}
            <div
              className="planet-float"
              style={{
                width: "160px",
                height: "160px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 0 20px 0",
              }}
            >
              <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                <defs>
                  <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.85" />
                    <stop offset="65%" stopColor="var(--color-brand)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.05" />
                  </radialGradient>
                  <filter id="planetBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                  </filter>
                </defs>

                {/* Soft ambient halo */}
                <circle cx="75" cy="75" r="48" fill="var(--color-brand)" opacity="0.25" filter="url(#planetBlur)" />

                {/* Main Sphere */}
                <circle cx="75" cy="75" r="42" fill="url(#planetGlow)" />

                {/* Orbit Ring */}
                <ellipse
                  cx="75"
                  cy="75"
                  rx="62"
                  ry="24"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  transform="rotate(-25 75 75)"
                />

                {/* Planet Face - Peaceful Eyes */}
                {/* Left Eye Curve */}
                <path
                  d="M 64 74 Q 68 70 72 74"
                  stroke="#08090a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Right Eye Curve */}
                <path
                  d="M 78 74 Q 82 70 86 74"
                  stroke="#08090a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Tiny orbiting sparkle star */}
                <circle cx="125" cy="52" r="2.5" fill="var(--color-brand)" />
                <circle cx="28" cy="98" r="2" fill="var(--color-brand)" opacity="0.7" />
              </svg>
            </div>

            {/* Testimonial Quote */}
            <blockquote
              style={{
                fontSize: "15.5px",
                lineHeight: 1.55,
                fontWeight: 500,
                color: "var(--text-primary)",
                margin: "0 0 24px 0",
                maxWidth: "380px",
              }}
            >
              &ldquo;FreelAI has completely transformed the way I run my freelance business. I save hours every week!&rdquo;
            </blockquote>

            {/* Author Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-brand)",
                  fontWeight: 700,
                  fontSize: "14px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  AM
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Arjun Mehta
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  UI/UX Designer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
