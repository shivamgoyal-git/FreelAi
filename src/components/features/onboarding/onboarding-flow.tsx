"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, User, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function OnboardingFlow() {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    setMounted(true);

    if (!userId) return; // Wait until the user is authenticated

    const storageKey = `onboarding-completed-${userId}`;

    // 1. Fast check local storage for this specific user
    const localStatus = localStorage.getItem(storageKey);
    if (localStatus === "done" || localStatus === "dismissed") {
      return; // Already completed or dismissed in this browser session
    }

    // 2. Fallback check from DB
    const checkDbStatus = async () => {
      try {
        const res = await fetch("/api/auth/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingCompleted) {
            localStorage.setItem(storageKey, "done");
          } else {
            setOpen(true);
          }
        } else {
          if (!localStatus) setOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch onboarding status:", err);
        if (!localStatus) setOpen(true);
      }
    };

    checkDbStatus();
  }, [userId]);

  const markOnboardingCompleted = async () => {
    try {
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Failed to save onboarding completion status:", err);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
    if (userId) {
      localStorage.setItem(`onboarding-completed-${userId}`, "dismissed");
    }
    markOnboardingCompleted();
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      setOpen(false);
      if (userId) {
        localStorage.setItem(`onboarding-completed-${userId}`, "done");
      }
      markOnboardingCompleted();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          animation: "scaleIn 0.2s var(--ease-spring)",
        }}
      >
        {/* Progress steps bar */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", alignItems: "center" }}>
          {[1, 2, 3, 4].map((i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "4px",
                  background: isDone ? "var(--color-success)" : isActive ? "var(--color-brand)" : "var(--surface-3)",
                  borderRadius: "2px",
                  transition: "background var(--dur-fast)",
                }}
              />
            );
          })}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)", margin: "0 auto" }}>
              <Sparkles size={20} />
            </div>
            <h2 className="font-heading" style={{ fontSize: "20px", margin: "8px 0 0" }}>Welcome to FreelAI!</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Let&apos;s get you set up to win high-paying freelance jobs. We&apos;ll configure your profile, set up your portfolio, and generate your first proposal.
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
                <User size={16} />
              </div>
              <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>Create your profile</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              A complete profile feeds matching keywords, skills, and bio context into our AI engine.
            </p>
            <Button variant="outline" size="sm" onClick={() => { router.push("/dashboard/profile"); handleDismiss(); }}>
              Go to Profile page
            </Button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
                <Plus size={16} />
              </div>
              <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>Add portfolio items</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Match past design, writing, or dev projects automatically to client job posts.
            </p>
            <Button variant="outline" size="sm" onClick={() => { router.push("/dashboard/portfolio"); handleDismiss(); }}>
              Configure Portfolio
            </Button>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-success-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", margin: "0 auto" }}>
              <Check size={20} />
            </div>
            <h2 className="font-heading" style={{ fontSize: "18px", margin: "8px 0 0" }}>All set!</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              You are ready to start winning jobs. Let&apos;s head over to the proposal builder to generate your first draft.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "8px" }}>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Skip onboarding
          </Button>
          <Button variant="primary" size="sm" onClick={handleNext} rightIcon={<ArrowRight size={14} />}>
            {step === 1 ? "Get Started" : step === 4 ? "Done" : "Next Step"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OnboardingFlow;
