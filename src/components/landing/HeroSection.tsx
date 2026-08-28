"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      style={{
        paddingTop: "90px",
        paddingBottom: "40px",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        overflowX: "clip",
        overflowY: "visible",
      }}
    >
      {/* Background Star Field (subtle atmospheric depth) */}
      <div className="star-point" style={{ top: "16%", left: "10%", width: "2px", height: "2px", opacity: 0.6 }} />
      <div className="star-point" style={{ top: "14%", right: "12%", width: "2px", height: "2px", animationDelay: "1.1s", opacity: 0.7 }} />
      <div className="star-point" style={{ top: "8%", left: "26%", width: "1.5px", height: "1.5px", animationDelay: "2.3s", opacity: 0.5 }} />
      <div className="star-point" style={{ top: "28%", right: "22%", width: "2px", height: "2px", animationDelay: "0.8s", opacity: 0.6 }} />
      <div className="star-point" style={{ top: "52%", left: "7%", width: "2.5px", height: "2.5px", animationDelay: "1.5s", opacity: 0.75 }} />
      <div className="star-point" style={{ top: "46%", right: "8%", width: "2px", height: "2px", animationDelay: "2.7s", opacity: 0.6 }} />
      <div className="star-point" style={{ top: "75%", left: "14%", width: "2px", height: "2px", animationDelay: "1.9s", opacity: 0.65 }} />
      <div className="star-point" style={{ top: "82%", right: "16%", width: "2.5px", height: "2.5px", animationDelay: "0.4s", opacity: 0.7 }} />

      <div
        style={{
          maxWidth: "840px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontSize: "clamp(36px, 5.5vw, 58px)",
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            margin: 0,
            maxWidth: "800px",
            fontFamily: "var(--font-heading)",
          }}
        >
          Run Your Freelance Business{" "}
          <span style={{ color: "var(--color-brand)" }}>Smarter, Faster</span>, with AI
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontSize: "clamp(15.5px, 2vw, 17.5px)",
            lineHeight: 1.62,
            letterSpacing: "-0.008em",
            color: "var(--text-secondary)",
            maxWidth: "640px",
            margin: 0,
            fontWeight: 400,
            fontFamily: "var(--font-body)",
          }}
        >
          Manage clients, projects, proposals, invoices, and more — all in one intelligent workspace built for freelancers.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "6px",
          }}
        >
          <Link
            href="/signup"
            style={{
              background: "var(--color-brand)",
              color: "var(--color-on-brand)",
              padding: "12px 28px",
              borderRadius: "10px",
              fontSize: "14.5px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
              boxShadow: "0 4px 14px rgba(139, 207, 53, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1.5px)";
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand)";
            }}
          >
            Start Free Today
          </Link>

          <Link
            href="/login"
            style={{
              background: "var(--surface-1)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "14.5px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-1)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
            }}
          >
            Book a Demo
          </Link>
        </motion.div>

        {/* Feature Checkmarks Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "4px",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={15} color="var(--color-brand)" />
            <span>No credit card required</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={15} color="var(--color-brand)" />
            <span>Free forever plan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={15} color="var(--color-brand)" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
