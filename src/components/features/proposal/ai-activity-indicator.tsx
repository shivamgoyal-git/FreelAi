"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";

export type PipelineStage =
  | "idle"
  | "analyzing"
  | "matching"
  | "blueprinting"
  | "writing"
  | "humanizing"
  | "validating"
  | "copilot"
  | "done"
  | "error";

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "analyzing",    label: "Analyzing job description" },
  { key: "matching",     label: "Matching your portfolio" },
  { key: "blueprinting", label: "Building proposal blueprint" },
  { key: "writing",      label: "Writing proposal" },
  { key: "humanizing",   label: "Humanizing text" },
  { key: "validating",   label: "Validating quality" },
  { key: "copilot",      label: "Running Copilot analysis" },
  { key: "done",         label: "Complete" },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

interface AIActivityIndicatorProps {
  stage: PipelineStage;
  error?: string;
}

export function AIActivityIndicator({ stage, error }: AIActivityIndicatorProps) {
  if (stage === "idle") return null;

  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
      }}
    >
      <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>
        AI Pipeline
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {STAGES.filter((s) => s.key !== "idle").map((s, i) => {
          const stageIdx = STAGE_ORDER.indexOf(s.key);
          const isDone   = stageIdx < currentIdx || stage === "done";
          const isActive = stageIdx === currentIdx && stage !== "done" && stage !== "error";
          const isPending = stageIdx > currentIdx;

          return (
            <div
              key={s.key}
              className={`ai-step${isDone ? " done" : isActive ? " active" : ""}`}
            >
              <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isDone ? (
                  <Check size={14} />
                ) : isActive ? (
                  <div className="ai-step-dot" />
                ) : (
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--border-strong)" }} />
                )}
              </div>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <p style={{ fontSize: "12px", color: "var(--color-danger)", marginTop: "12px", padding: "8px 12px", background: "var(--color-danger-bg)", borderRadius: "var(--radius)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default AIActivityIndicator;
