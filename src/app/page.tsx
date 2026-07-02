"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  Zap,
  Palette,
  Video,
  Shield,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  ChevronRight,
  Sparkles,
  DollarSign,
  Globe,
  Award,
} from "lucide-react";

// ── HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "68px",
        background: "var(--bg-base)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div className="container-main" style={{ position: "relative", zIndex: 1, width: "100%", padding: "60px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "55fr 45fr",
            gap: "72px",
            alignItems: "center",
          }}
        >
          {/* Left: Copy */}
          <div>
            <div className="animate-fade-in-up" style={{ marginBottom: "20px" }}>
              <span className="section-label">
                <Sparkles size={11} />
                AI-Powered for Creatives
              </span>
            </div>

            <h1
              className="font-display animate-fade-in-up delay-100"
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                marginBottom: "22px",
                color: "var(--text-primary)",
              }}
            >
              Creative <span style={{ color: "var(--color-brand)" }}>Talent</span>
              <br />
              Meets Opportunity
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{
                fontSize: "17px",
                color: "var(--text-muted)",
                maxWidth: "460px",
                lineHeight: "1.8",
                marginBottom: "36px",
              }}
            >
              FreelAi uses AI to match designers, video editors, and illustrators
              with dream clients — then helps you manage projects, track time, and
              get paid on time.
            </p>

            <div
              className="animate-fade-in-up delay-300"
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "48px" }}
            >
              <Link href="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Start for Free
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg">
                  See Features
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div
              className="animate-fade-in-up delay-400"
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              <div style={{ display: "flex" }}>
                {["D", "V", "I", "P"].map((letter, i) => (
                  <div
                    key={i}
                    className="avatar"
                    style={{
                      width: "28px",
                      height: "28px",
                      fontSize: "12px",
                      marginLeft: i === 0 ? 0 : "-8px",
                      border: "2px solid var(--bg-base)",
                      background: i % 2 === 0 ? "var(--primary)" : "#374151",
                      color: i % 2 === 0 ? "var(--text-on-primary)" : "var(--text-secondary)",
                      zIndex: 4 - i,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="var(--primary)" color="var(--primary)" />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>24,000+</strong> creatives earning more
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div style={{ position: "relative" }}>
            {/* Main card */}
            <div
              style={{
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {[
                { label: "Monthly Earnings", value: "$12,840" },
                { label: "Active Jobs", value: "8" },
                { label: "Avg. Rating", value: "4.9 / 5.0" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: "20px", color: "var(--text-primary)", fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TRUST STRIP ─────────────────────────────────────────────
function TrustStrip() {
  const brands = ["Adobe", "Figma", "Dribbble", "Behance", "Notion", "Slack", "Canva", "Webflow"];
  return (
    <section
      style={{
        padding: "36px 0",
        borderTop: "1px solid var(--border-default)",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="container-main">
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-subtle)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "24px",
          }}
        >
          Trusted by creatives working with
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "28px 40px",
          }}
        >
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-heading"
              style={{
                fontSize: "16px",
                color: "var(--text-subtle)",
                letterSpacing: "-0.01em",
                transition: "color 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.target as HTMLSpanElement).style.color = "var(--text-muted)")}
              onMouseLeave={(e) => ((e.target as HTMLSpanElement).style.color = "var(--text-subtle)")}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ────────────────────────────────────────────────
const features = [
  {
    icon: Zap,
    iconColor: "var(--primary)",
    iconBg: "var(--primary-dim)",
    title: "AI-Powered Matching",
    desc: "Our smart AI analyzes your portfolio and work style to connect you with clients who are the perfect fit — not just any fit.",
    highlights: ["99% match accuracy", "Real-time job alerts", "Personalized feed"],
  },
  {
    icon: Palette,
    iconColor: "#60a5fa",
    iconBg: "rgba(96,165,250,0.08)",
    title: "Creative Portfolio Hub",
    desc: "Showcase your best work with stunning portfolio templates built specifically for designers, illustrators, and video creators.",
    highlights: ["50+ portfolio templates", "Video & reel support", "Custom domain"],
  },
  {
    icon: Shield,
    iconColor: "var(--success)",
    iconBg: "var(--success-bg)",
    title: "Secure Payments & Escrow",
    desc: "Get paid with confidence. Our escrow system holds funds securely until milestones are met. Zero disputes.",
    highlights: ["Instant bank transfers", "Milestone escrow", "0% hidden fees"],
  },
  {
    icon: TrendingUp,
    iconColor: "var(--primary)",
    iconBg: "var(--primary-dim)",
    title: "Business Analytics",
    desc: "Track your income, client retention, and project performance with clean dashboards that give you the full picture.",
    highlights: ["Income forecasting", "Tax reports", "Client insights"],
  },
  {
    icon: Clock,
    iconColor: "#60a5fa",
    iconBg: "rgba(96,165,250,0.08)",
    title: "Smart Time Tracking",
    desc: "Log hours automatically, generate professional timesheets, and create invoices in one click.",
    highlights: ["Auto time logging", "One-click invoicing", "Expense tracking"],
  },
  {
    icon: Users,
    iconColor: "var(--success)",
    iconBg: "var(--success-bg)",
    title: "Collaboration Tools",
    desc: "Share mood boards, collect feedback, and manage revisions seamlessly. Keep clients in the loop at every stage.",
    highlights: ["Live comments", "Version history", "Client portal"],
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: "100px 0", background: "var(--bg-base)" }}>
      <div className="container-main">
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-label">
              <Zap size={11} />
              Everything You Need
            </span>
          </div>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(30px, 4vw, 46px)", marginBottom: "16px" }}
          >
            Built for creative{" "}
            <span className="text-gradient">professionals</span>
          </h2>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto" }}>
            Every feature is designed with designers, video editors, and illustrators in mind.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--border-default)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              style={{
                background: "var(--bg-card)",
                padding: "32px 28px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: feature.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <feature.icon size={20} color={feature.iconColor} />
              </div>

              <h3 className="font-heading" style={{ fontSize: "16px", marginBottom: "10px", color: "var(--text-primary)" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "16px" }}>
                {feature.desc}
              </p>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                {feature.highlights.map((h) => (
                  <li
                    key={h}
                    style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}
                  >
                    <CheckCircle size={13} color="var(--success)" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ────────────────────────────────────────────
const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Build Your Creative Profile",
    desc: "Upload your portfolio, set your rates, and let our AI analyse your unique style and expertise to position you perfectly.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Get AI-Matched to Clients",
    desc: "FreelAi's matching engine scans thousands of projects daily and surfaces the ones that fit your exact skills and aesthetic.",
  },
  {
    number: "03",
    icon: DollarSign,
    title: "Deliver & Get Paid",
    desc: "Collaborate with built-in tools, get milestone approvals, and receive payment instantly through our secure escrow system.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{ padding: "100px 0", background: "var(--bg-surface)" }}
    >
      <div className="container-main">
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-label">
              <ChevronRight size={11} />
              Simple Process
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 46px)", marginBottom: "16px" }}>
            Up and running in{" "}
            <span className="text-gradient">3 steps</span>
          </h2>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto" }}>
            No complicated setup. Start winning projects within hours of joining.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="glass-card"
              style={{ padding: "36px 28px", position: "relative" }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--primary)",
                  letterSpacing: "0.08em",
                  marginBottom: "20px",
                }}
              >
                {step.number}
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--primary-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <step.icon size={20} color="var(--primary)" />
              </div>
              <h3 className="font-heading" style={{ fontSize: "17px", marginBottom: "12px" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.7" }}>
                {step.desc}
              </p>

              {/* Step connector line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: "-13px",
                    width: "24px",
                    height: "1px",
                    background: "var(--border-strong)",
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ─────────────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "Free",
    sub: "Forever",
    desc: "Perfect for getting started and testing the waters.",
    features: [
      "Up to 3 active projects",
      "Basic AI matching",
      "FreelAi portfolio page",
      "Standard payments",
      "Community support",
    ],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    sub: "per month",
    desc: "For serious creatives ready to scale their business.",
    features: [
      "Unlimited projects",
      "Priority AI matching",
      "Custom domain portfolio",
      "Instant payouts",
      "Advanced analytics",
      "Time tracking & invoicing",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/signup",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "$49",
    sub: "per month",
    desc: "For agencies and studios collaborating on multiple projects.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team workspace & dashboard",
      "White-label client portal",
      "Advanced reporting",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/signup",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: "100px 0", background: "var(--bg-base)" }}>
      <div className="container-main">
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-label">
              <DollarSign size={11} />
              Simple Pricing
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 46px)", marginBottom: "16px" }}>
            Invest in your{" "}
            <span className="text-gradient">creative career</span>
          </h2>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto" }}>
            No lock-in. Cancel anytime. All plans include our core AI matching engine.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", alignItems: "stretch" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: "relative",
                background: plan.highlighted ? "var(--bg-elevated)" : "var(--bg-card)",
                border: plan.highlighted ? "1px solid var(--primary)" : "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                boxShadow: plan.highlighted ? "var(--shadow-primary)" : "var(--shadow-sm)",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--primary)",
                    color: "var(--text-on-primary)",
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "11px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h3 className="font-heading" style={{ fontSize: "18px", marginBottom: "6px", color: "var(--text-primary)" }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                {plan.desc}
              </p>

              <div style={{ marginBottom: "24px" }}>
                <span className="font-display" style={{ fontSize: "40px", color: "var(--text-primary)" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "6px" }}>
                  {plan.sub}
                </span>
              </div>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginBottom: "28px" }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}
                  >
                    <CheckCircle size={14} color="var(--success)" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="md"
                  style={{ width: "100%", justifyContent: "center" }}
                  rightIcon={<ArrowRight size={15} />}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────
const testimonials = [
  {
    name: "Sofia Martínez",
    role: "Brand Identity Designer",
    avatar: "S",
    rating: 5,
    quote:
      "FreelAi matched me with 3 incredible clients in my first week. The AI actually understood my aesthetic — not just my listed skills. My monthly income doubled in 2 months.",
  },
  {
    name: "James Okafor",
    role: "Motion Graphics / Video Editor",
    avatar: "J",
    rating: 5,
    quote:
      "I was tired of wasting hours on proposals that never converted. FreelAi's matching means I only pitch to clients who already love my style. 80% conversion rate now.",
  },
  {
    name: "Yuki Tanaka",
    role: "Illustrator & Digital Artist",
    avatar: "Y",
    rating: 5,
    quote:
      "The payment escrow gave me peace of mind I never had on other platforms. And the portfolio tools? Finally something that actually shows illustration work beautifully.",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: "100px 0", background: "var(--bg-surface)" }}>
      <div className="container-main">
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-label">
              <Star size={11} />
              Creator Stories
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 46px)", marginBottom: "16px" }}>
            Creatives love{" "}
            <span className="text-gradient">FreelAi</span>
          </h2>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto" }}>
            Real stories from designers, illustrators, and video editors who transformed their freelance careers.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {testimonials.map((t) => (
            <div key={t.name} className="stat-card" style={{ padding: "28px", cursor: "default" }}>
              <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={13} fill="var(--primary)" color="var(--primary)" />
                ))}
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "24px" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  className="avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "14px",
                    background: "var(--primary)",
                    color: "var(--text-on-primary)",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{t.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            marginTop: "60px",
            padding: "40px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "24px",
          }}
        >
          {[
            { icon: Users, value: "24K+", label: "Creatives" },
            { icon: Globe, value: "80+", label: "Countries" },
            { icon: DollarSign, value: "$12M+", label: "Paid Out" },
            { icon: Award, value: "4.9/5", label: "Avg. Rating" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={20} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
              <p className="font-display" style={{ fontSize: "28px", color: "var(--text-primary)", marginBottom: "4px" }}>
                {value}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA BANNER ──────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ padding: "100px 0", background: "var(--bg-base)" }}>
      <div className="container-main" style={{ textAlign: "center" }}>
        <div
          className="glass-card-strong"
          style={{
            padding: "64px",
            maxWidth: "680px",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "var(--primary)",
              borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            }}
          />

          <div style={{ marginBottom: "16px" }}>
            <span className="section-label">
              <Zap size={11} />
              Limited Time Offer
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: "clamp(28px,4vw,44px)", marginBottom: "16px" }}>
            Start earning more
            <br />
            <span className="text-gradient">as a creative today</span>
          </h2>

          <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "36px", maxWidth: "440px", margin: "0 auto 36px" }}>
            Join 24,000+ designers, illustrators, and video editors already growing
            their freelance income with AI-powered matching.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                I Have an Account
              </Button>
            </Link>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "20px" }}>
            No credit card required · Free forever plan · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ── PAGE ────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
