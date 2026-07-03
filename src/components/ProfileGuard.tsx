"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProfileGuardProps {
  feature: string;
  children: React.ReactNode;
}

export default function ProfileGuard({ feature, children }: ProfileGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          setHasProfile(true);
        } else if (res.status === 404 || res.status === 403) {
          setHasProfile(false);
          setShowModal(true);
        }
      } catch (err) {
        console.error("Profile guard validation error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [pathname]);

  const handleCompleteProfile = () => {
    // Navigate to setup with current path as redirect query param
    router.push(`/dashboard/profile/setup?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleMaybeLater = () => {
    setShowModal(false);
    // Show toast message
    setToastMessage("You can complete your Freelancer Profile anytime from the dashboard to unlock AI-powered features.");
    
    // Auto clear toast and redirect back after a small delay
    setTimeout(() => {
      setToastMessage(null);
      // Return to previous page or landing dashboard
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/dashboard");
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <Loader2 size={24} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 500 }}>Verifying credentials...</span>
      </div>
    );
  }

  // Render Toast message overlay
  if (toastMessage) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <ShieldAlert size={20} color="var(--color-brand)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5", fontWeight: 500 }}>
            {toastMessage}
          </span>
        </div>
      </div>
    );
  }

  // If no profile, show the modal backdrop and value modal
  if (!hasProfile && showModal) {
    const isProposals = feature === "proposal-generator";
    const title = isProposals ? "Unlock Personalized AI Proposals" : "Complete Your Freelancer Profile";
    const description = isProposals
      ? "FreelAI uses your skills, services, experience, and portfolio to generate highly personalized proposals. This setup only takes about 3 minutes and only needs to be completed once."
      : "FreelAI uses your professional skills, services, and preferences to power AI-assisted features. This setup only takes about 3 minutes and only needs to be completed once.";

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
      }}>
        <div style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "28px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={14} color="var(--color-brand)" />
            </div>
            <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>{title}</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {description}
          </p>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase" }}>Estimated setup time</span>
            <span style={{ fontSize: "11.5px", color: "var(--color-brand)", fontWeight: "bold" }}>3–5 minutes</span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <Button variant="primary" onClick={handleCompleteProfile} style={{ flex: 1 }}>
              Complete Profile
            </Button>
            <Button variant="secondary" onClick={handleMaybeLater} style={{ flex: 1 }}>
              Maybe Later
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // Render children if profile exists
  return <>{children}</>;
}
