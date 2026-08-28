"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, SendHorizontal } from "lucide-react";
import { toast } from "sonner";

const QUICK_PROMPTS = [
  "Invoices needing follow-up",
  "Projects at risk",
  "Top revenue clients",
];

export const AiCopilotWidget: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/dashboard/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prompt", promptText: q }),
      });
      const data = await res.json();
      if (res.ok) {
        let i = 0;
        const text = data.response || "No response received";
        const timer = setInterval(() => {
          if (i < text.length) {
            setResponse((prev) => prev + text.charAt(i));
            i += 1;
          } else {
            clearInterval(timer);
          }
        }, 6);
        setPrompt("");
      } else {
        setResponse(`Error: ${data.error || "Failed to generate response"}`);
        toast.error("AI request failed");
      }
    } catch {
      setResponse("Network error. Please try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <Sparkles size={13} style={{ color: "var(--color-brand)" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          AI Copilot
        </span>
      </div>

      {/* Suggestion Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleAsk(p)}
            style={{
              padding: "3px 8px",
              fontSize: "10.5px",
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Response Area */}
      {response ? (
        <div
          style={{
            flex: 1,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "11.5px",
            color: "var(--text-primary)",
            lineHeight: 1.45,
            marginBottom: "10px",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          {response}
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "4px 6px 4px 10px",
        }}
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask FreelAI anything..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "11.5px",
          }}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            background: prompt.trim() ? "var(--color-brand)" : "transparent",
            color: prompt.trim() ? "var(--color-on-brand)" : "var(--text-muted)",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: prompt.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <SendHorizontal size={12} />}
        </button>
      </form>
    </div>
  );
};
