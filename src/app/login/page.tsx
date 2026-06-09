"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg-base)",
      }}
    >
      {/* Left panel — branding */}
      <div
        style={{
          flex: 1,
          display: "none",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
        }}
        className="login-left-panel"
      >
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "48px" }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="var(--text-on-primary)" />
            </svg>
          </div>
          <span className="font-heading" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
            Freel<span style={{ color: "var(--primary)" }}>Ai</span>
          </span>
        </Link>

        <h2 className="font-display" style={{ fontSize: "36px", color: "var(--text-primary)", marginBottom: "16px" }}>
          Where creative<br />talent thrives
        </h2>
        <p style={{ fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "360px" }}>
          Join 24,000+ designers, illustrators, and video editors earning more with AI-powered client matching.
        </p>

        <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            "AI matches you with the perfect clients",
            "Secure escrow payments, every time",
            "Professional portfolio tools built for creatives",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "var(--primary-dim)",
                  border: "1px solid var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          className="animate-scale-in"
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {/* Mobile logo */}
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "36px" }}
            className="mobile-logo"
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="var(--text-on-primary)" />
              </svg>
            </div>
            <span className="font-heading" style={{ fontSize: "17px", color: "var(--text-primary)" }}>
              Freel<span style={{ color: "var(--primary)" }}>Ai</span>
            </span>
          </Link>

          <h1 className="font-heading" style={{ fontSize: "24px", marginBottom: "6px", color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px" }}>
            Sign in to your FreelAi account
          </p>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                background: "var(--error-bg)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                fontSize: "13px",
                color: "var(--error)",
              }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: googleLoading ? "not-allowed" : "pointer",
              opacity: googleLoading ? 0.7 : 1,
              transition: "border-color 0.2s, background 0.2s",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.borderColor = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
          >
            {googleLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin-slow 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="divider" style={{ marginBottom: "20px" }}>
            or
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  className="input-icon"
                  size={15}
                />
                <input
                  id="login-email"
                  type="email"
                  className="input-field has-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="input-label" htmlFor="login-password">
                  Password
                </label>
                <a
                  href="#"
                  style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}
                >
                  Forgot?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="input-field has-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    padding: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <input
                id="login-remember"
                type="checkbox"
                style={{ accentColor: "var(--primary)", width: "14px", height: "14px" }}
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                fontSize: "15px",
                borderRadius: "var(--radius-md)",
                marginTop: "4px",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin-slow 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="font-heading" style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
