"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AICopilotProps {
  onActionSubmit?: (action: "prompt" | "proposal", promptText: string) => Promise<string>;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  onActionSubmit,
  placeholder,
  style,
}) => {
  const [aiAction, setAiAction] = useState<"prompt" | "proposal">("prompt");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setResponse("");

    try {
      if (onActionSubmit) {
        const text = await onActionSubmit(aiAction, aiPrompt);
        // Typewriter Effect
        let i = 0;
        setResponse("");
        const timer = setInterval(() => {
          if (i < text.length) {
            setResponse((prev) => prev + text.charAt(i));
            i += 1;
          } else {
            clearInterval(timer);
          }
        }, 8);
        setAiPrompt("");
      } else {
        // Fallback simulated call
        const res = await fetch("/api/dashboard/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: aiAction, promptText: aiPrompt }),
        });
        const data = await res.json();
        if (res.ok) {
          let i = 0;
          const text = data.response;
          setResponse("");
          const timer = setInterval(() => {
            if (i < text.length) {
              setResponse((prev) => prev + text.charAt(i));
              i += 1;
            } else {
              clearInterval(timer);
            }
          }, 8);
          setAiPrompt("");
        } else {
          setResponse(`Error: ${data.error || "Failed to process Action"}`);
        }
      }
    } catch {
      setResponse("Network connection error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      id="ai-assistant-widget"
      style={{
        padding: "var(--spacing-20)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-12)",
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderLeft: "2.5px solid var(--color-brand)",
        borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-8)" }}>
        <Sparkles size={16} color="var(--color-brand)" />
        <h3 className="font-heading" style={{ fontSize: "var(--text-body-sm)", margin: 0 }}>
          Antigravity AI Copilot
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--spacing-16)",
          borderBottom: "1px solid var(--border)",
          marginBottom: "var(--spacing-4)",
        }}
      >
        <button
          type="button"
          onClick={() => { setAiAction("prompt"); setResponse(""); }}
          style={{
            padding: "var(--spacing-8) 0",
            background: "transparent",
            border: "none",
            borderBottom: aiAction === "prompt" ? "2px solid var(--color-brand)" : "2px solid transparent",
            color: aiAction === "prompt" ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: "var(--text-caption)",
            fontWeight: 510,
            cursor: "pointer",
            transition: "all var(--dur-fast)",
          }}
        >
          Run Prompt
        </button>
        <button
          type="button"
          onClick={() => { setAiAction("proposal"); setResponse(""); }}
          style={{
            padding: "var(--spacing-8) 0",
            background: "transparent",
            border: "none",
            borderBottom: aiAction === "proposal" ? "2px solid var(--color-brand)" : "2px solid transparent",
            color: aiAction === "proposal" ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: "var(--text-caption)",
            fontWeight: 510,
            cursor: "pointer",
            transition: "all var(--dur-fast)",
          }}
        >
          Generate Proposal
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder={
            placeholder ??
            (aiAction === "prompt"
              ? "Ask outreach tips, client strategy, formulas..."
              : "Enter project details (e.g. Website Redesign, $3500)...")
          }
          rows={2}
          required
          style={{
            width: "100%",
            padding: "var(--spacing-8) var(--spacing-12)",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius)",
            fontSize: "var(--text-caption)",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            outline: "none",
            resize: "none",
            transition: "border-color var(--dur-fast)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--text-secondary)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        <Button
          type="submit"
          disabled={aiLoading}
          variant="primary"
          size="sm"
          style={{ width: "100%", justifyContent: "center" }}
          leftIcon={aiLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={13} />}
        >
          {aiLoading ? "Consulting AI..." : (aiAction === "prompt" ? "Ask Antigravity" : "Generate Proposal")}
        </Button>
      </form>

      {response && (
        <div
          style={{
            maxHeight: "180px",
            overflowY: "auto",
            padding: "var(--spacing-8) var(--spacing-12)",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius)",
            fontSize: "var(--text-caption)",
            color: "var(--text-secondary)",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            animation: "fadeIn var(--dur-fast) ease",
          }}
        >
          {response}
        </div>
      )}
    </div>
  );
};

export default AICopilot;
