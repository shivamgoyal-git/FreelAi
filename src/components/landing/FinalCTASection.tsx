"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTASection() {
  return (
    <section
      id="pricing"
      style={{
        paddingTop: "40px",
        paddingBottom: "130px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="landing-card"
          style={{
            position: "relative",
            padding: "48px 44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "32px",
            overflow: "hidden",
            borderRadius: "20px",
          }}
        >
          {/* Subtle Curved Bottom Arc Glow */}
          <div className="cta-arc-glow" />

          {/* Left Column: Heading & Subtitle */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 750,
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                color: "var(--text-primary)",
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              Ready to Take Your Freelance Business to the{" "}
              <span style={{ color: "var(--color-brand)" }}>Next Level?</span>
            </h2>
            <p
              style={{
                fontSize: "14.5px",
                lineHeight: 1.55,
                color: "var(--text-secondary)",
                marginTop: "12px",
                margin: "12px 0 0 0",
              }}
            >
              Join thousands of freelancers who are already growing their business with FreeLAI.
            </p>
          </div>

          {/* Right Column: CTA Button + Note */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--color-brand)",
                color: "var(--color-on-brand)",
                padding: "12px 28px",
                borderRadius: "10px",
                fontSize: "14.5px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s ease",
                boxShadow: "0 4px 14px rgba(139, 207, 53, 0.3)",
                whiteSpace: "nowrap",
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
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              No credit card required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
