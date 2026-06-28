"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Globe,
  Code2,
  CheckCircle,
  Palette,
  Video,
  Pen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const updateForm = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#6366f1", "#10b981"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Account created! Please sign in.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Account created! Please sign in.");
      router.push("/login");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      {/* Left Panel — Visual */}
      <div
        style={{
          flex: "0 0 40%",
          width: "40%",
          background: "var(--surface-1)",
          borderLeft: "3px solid var(--color-brand)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="signup-left-panel"
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "0.5px solid var(--border)",
            }}
          >
            <Zap size={20} color="var(--primary)" fill="var(--primary)" />
          </div>
          <span
            className="font-heading"
            style={{ fontSize: "22px", color: "var(--text-primary)" }}
          >
            FreelAi
          </span>
        </Link>

        <div style={{ marginBottom: "40px" }}>
          <h2
            className="font-display"
            style={{ fontSize: "36px", color: "var(--text-primary)", marginBottom: "16px", lineHeight: "1.2" }}
          >
            Join 24,000+
            <br />
            creative freelancers
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
            Designers, video editors, and illustrators use FreelAi to find
            better clients, earn more, and manage everything in one place.
          </p>
        </div>

        {/* Benefits */}
        {[
          "AI-powered client matching",
          "Secure escrow payments",
          "Beautiful portfolio showcase",
          "Analytics & invoicing",
        ].map((benefit) => (
          <div
            key={benefit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <CheckCircle size={18} color="var(--color-brand)" />
            <span style={{ fontSize: "15px", color: "var(--text-secondary)" }}>{benefit}</span>
          </div>
        ))}

        {/* Bottom testimonial snippet */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-lg)",
            border: "0.5px solid var(--border)",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.6", fontStyle: "italic" }}>
            &ldquo;I went from $2k/month to $8k/month in just 3 months with FreelAi.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="avatar"
              style={{
                width: "36px",
                height: "36px",
                background: "var(--surface-3)",
                fontSize: "14px",
                color: "var(--text-primary)",
              }}
            >
              S
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Sofia Martínez</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Brand Identity Designer</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .signup-left-panel { display: none !important; }
          }
        `}</style>
      </div>

      {/* Right Panel — Form */}
      <div
        style={{
          flex: "0 0 60%",
          width: "60%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
          background: "var(--surface-0)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 className="font-heading" style={{ fontSize: "28px", marginBottom: "8px" }}>
              Create your account
            </h1>
            <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
              Start your creative freelancing journey
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                fontSize: "14px",
                color: "var(--error)",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Social Sign Up */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <Button
                type="button"
                id="signup-google"
                variant="secondary"
                onClick={handleGoogle}
                disabled={googleLoading}
                style={{ flex: 1, justifyContent: "center" }}
                leftIcon={googleLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin-slow 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <Globe size={16} />
                )}
              >
                Google
              </Button>
              <Button
                type="button"
                id="signup-github"
                variant="secondary"
                style={{ flex: 1, justifyContent: "center" }}
                leftIcon={<Code2 size={16} />}
              >
                GitHub
              </Button>
            </div>

            <div className="divider" style={{ marginBottom: "24px" }}>
              or sign up with email
            </div>

            {/* Name */}
            <div className="form-group-redesign" style={{ marginBottom: "16px" }}>
              <label className="label-redesign" htmlFor="signup-name">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", bottom: "12px", left: "14px", color: "var(--text-muted)" }} />
                <input
                  id="signup-name"
                  type="text"
                  className="input-redesign has-icon"
                  placeholder="Sofia Martínez"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group-redesign" style={{ marginBottom: "16px" }}>
              <label className="label-redesign" htmlFor="signup-email">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", bottom: "12px", left: "14px", color: "var(--text-muted)" }} />
                <input
                  id="signup-email"
                  type="email"
                  className="input-redesign has-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group-redesign" style={{ marginBottom: "8px" }}>
              <label className="label-redesign" htmlFor="signup-password">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", bottom: "12px", left: "14px", color: "var(--text-muted)" }} />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  className="input-redesign has-icon"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", bottom: "10px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", display: "flex" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {form.password && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "var(--radius-full)",
                        background: i <= passwordStrength ? strengthColor : "var(--border-default)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className="form-group-redesign" style={{ marginBottom: "20px" }}>
              <label className="label-redesign" htmlFor="signup-confirm">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", bottom: "12px", left: "14px", color: "var(--text-muted)" }} />
                <input
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="input-redesign has-icon"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => updateForm("confirm", e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    paddingRight: "44px",
                    borderColor:
                      form.confirm && form.confirm !== form.password
                        ? "var(--error)"
                        : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "14px", bottom: "10px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", display: "flex" }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ accentColor: "var(--primary)", width: "15px", height: "15px", marginTop: "2px", flexShrink: 0 }}
                required
              />
              I agree to the{" "}
              <a href="#" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                Privacy Policy
              </a>
            </label>

            <Button
              id="signup-submit"
              type="submit"
              variant="primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
              }}
              rightIcon={!loading ? <ArrowRight size={16} /> : undefined}
              leftIcon={loading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin-slow 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : undefined}
            >
              {loading ? "Creating your account..." : "Create Account"}
            </Button>
          </form>

          {/* Login Link */}
          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
