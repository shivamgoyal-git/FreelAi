import React from "react";
import { CheckCircle2 } from "lucide-react";

export function calculateProfileCompleteness(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  let score = 0;

  const personal = (profile.personal || {}) as Record<string, unknown>;
  const professional = (profile.professional || {}) as Record<string, unknown>;
  const socialLinks = (profile.socialLinks || {}) as Record<string, unknown>;
  const pricing = (profile.pricing || {}) as Record<string, unknown>;

  // 1. Basic Info (20%): Name & Professional Title
  if (personal.fullName && personal.professionalTitle) {
    score += 20;
  }
  // 2. Skills (20%): At least one skill
  const skills = (professional.skills || []) as unknown[];
  if (skills.length > 0) {
    score += 20;
  }
  // 3. Services (20%): At least one service
  const services = (professional.services || []) as unknown[];
  if (services.length > 0) {
    score += 20;
  }
  // 4. Portfolio (20%): At least one portfolio/social link
  if (socialLinks.website || socialLinks.github || socialLinks.linkedin || socialLinks.behance || socialLinks.dribbble) {
    score += 20;
  }
  // 5. Pricing (20%): Hourly rate greater than 0 and pricing model
  if (pricing.hourlyRate && (pricing.hourlyRate as number) > 0 && pricing.pricingModel) {
    score += 20;
  }

  return score;
}

interface ProfileCompletionProps {
  percentage: number;
  showProgressLine?: boolean;
  size?: "sm" | "md";
}

export default function ProfileCompletion({ percentage, showProgressLine = true, size = "md" }: ProfileCompletionProps) {
  const isComplete = percentage === 100;

  if (isComplete) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--color-success-bg)", color: "var(--color-success)", padding: size === "sm" ? "2px 6px" : "4px 10px", borderRadius: "999px", fontSize: size === "sm" ? "10px" : "11px", fontWeight: 700, border: "0.5px solid rgba(34,134,58,0.2)" }}>
        <CheckCircle2 size={size === "sm" ? 11 : 13} />
        <span>Profile Complete</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: size === "sm" ? "10.5px" : "12px" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Profile Completion</span>
        <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>{percentage}%</span>
      </div>
      {showProgressLine && (
        <div style={{ width: "100%", height: size === "sm" ? "4px" : "6px", background: "var(--surface-3)", borderRadius: "99px", overflow: "hidden" }}>
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background: "var(--color-brand)",
              borderRadius: "99px",
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      )}
    </div>
  );
}
