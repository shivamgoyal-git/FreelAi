"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ClientInviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/portal/invite/verify?token=${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setInviteData(data);
          setName(data.clientName || "");
        } else {
          setError(data.error || "Invalid or expired invitation link.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify invitation");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/portal/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto sign-in
        const result = await signIn("credentials", {
          email: inviteData.email,
          password,
          redirect: false,
        });

        if (result?.error) {
          router.push("/login?callbackUrl=/portal");
        } else {
          router.push("/portal");
          router.refresh();
        }
      } else {
        setError(data.error || "Failed to activate account");
      }
    } catch (err: any) {
      setError(err.message || "Failed to activate account");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-void, #08090a)",
          color: "var(--color-bone, #e5e5e6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-pulse-green)" }} />
          <span>Verifying client invitation...</span>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-void, #08090a)",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "14px",
            padding: "36px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-paper)", marginBottom: "8px" }}>
            Invitation Expired or Invalid
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--color-fog)", lineHeight: 1.5, marginBottom: "24px" }}>
            {error}
          </p>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" style={{ width: "100%", justifyContent: "center" }}>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-void, #08090a)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #27a644 0%, #166534 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 0 16px rgba(39, 166, 68, 0.4)",
            }}
          >
            <Sparkles size={22} style={{ color: "#ffffff" }} />
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-paper)", margin: "0 0 6px 0" }}>
            Welcome to Your Client Portal
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-fog)", margin: 0 }}>
            {inviteData.freelancerName} has invited you to collaborate on FreeAI.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              value={inviteData.email}
              disabled
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-fog)",
                fontSize: "13.5px",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Create Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={{
                  width: "100%",
                  background: "var(--color-obsidian)",
                  border: "1px solid var(--color-graphite)",
                  borderRadius: "8px",
                  padding: "10px 40px 10px 14px",
                  color: "var(--color-paper)",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-fog)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          >
            {submitting ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Activating Account...</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Enter Client Portal</span>
                <ArrowRight size={16} />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
