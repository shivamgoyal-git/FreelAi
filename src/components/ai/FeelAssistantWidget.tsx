"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  SendHorizontal,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  DollarSign,
  AlertCircle,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ────────────────────────────────────────────── */
interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: "Invoices needing follow-up", icon: DollarSign },
  { label: "Projects at risk", icon: AlertCircle },
  { label: "Top revenue clients", icon: TrendingUp },
  { label: "Draft proposal outline", icon: FileText },
  { label: "Optimize hourly rates", icon: Zap },
];

/* ══════════════════════════════════════════════════════════
   3D ORB MASCOT (CSS-only, no Three.js dependency)
   ══════════════════════════════════════════════════════════ */
function OrbMascot({
  isOpen,
  listening,
}: {
  isOpen: boolean;
  listening: boolean;
}) {
  return (
    <div
      className="feel-orb-root"
      style={{
        width: "56px",
        height: "56px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {/* ── Ambient halo glow ── */}
      <div
        className="feel-orb-halo"
        style={{
          position: "absolute",
          inset: "-14px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.08) 45%, transparent 70%)",
          animation: "orbPulseHalo 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Shadow below orb ── */}
      <div
        className="feel-orb-shadow"
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "32px",
          height: "8px",
          borderRadius: "50%",
          background: "rgba(34,197,94,0.2)",
          filter: "blur(4px)",
          animation: "orbShadowPulse 3s ease-in-out infinite",
          pointerEvents: "none",
          transition: "width 0.3s ease, background 0.3s ease, filter 0.3s ease",
        }}
      />

      {/* ── Orbital ring 1 ── */}
      <div
        className="feel-orb-ring1"
        style={{
          position: "absolute",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "1px solid rgba(34,197,94,0.18)",
          transform: "rotateX(65deg) rotateZ(0deg)",
          animation: "orbRingSpin 8s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Orbital ring 2 ── */}
      <div
        className="feel-orb-ring2"
        style={{
          position: "absolute",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          border: "1px solid rgba(99,102,241,0.14)",
          transform: "rotateX(70deg) rotateZ(60deg)",
          animation: "orbRingSpin2 12s linear infinite reverse",
          pointerEvents: "none",
        }}
      />

      {/* ── Main sphere body ── */}
      <div
        className="feel-orb-sphere"
        style={{
          position: "relative",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: `
            radial-gradient(ellipse 55% 50% at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 80% 80% at 50% 50%, rgba(34,197,94,0.65) 0%, rgba(16,185,129,0.45) 40%, rgba(99,102,241,0.2) 75%, rgba(30,30,50,0.6) 100%)
          `,
          boxShadow: `
            inset 0 -6px 14px rgba(0,0,0,0.35),
            inset 0 4px 10px rgba(34,197,94,0.2),
            0 0 20px rgba(34,197,94,0.3),
            0 4px 16px rgba(0,0,0,0.5)
          `,
          animation: listening
            ? "orbFloat 2s ease-in-out infinite, orbListening 1.2s ease-in-out infinite"
            : "orbFloat 3s ease-in-out infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "transform 0.3s cubic-bezier(0.2,0,0,1)",
        }}
      >
        {/* Glass highlight overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Inner volumetric glow */}
        <div
          className="feel-orb-core"
          style={{
            position: "absolute",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)",
            filter: "blur(4px)",
            animation: "orbCoreGlow 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* ── Face ── */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            transform: "translateY(-1px)",
          }}
        >
          {/* Eyes */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              className="feel-orb-eye"
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow:
                  "0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(34,197,94,0.5)",
                animation: isOpen
                  ? "orbBlink 4s ease-in-out infinite"
                  : "orbBlink 5s ease-in-out infinite",
              }}
            />
            <div
              className="feel-orb-eye"
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow:
                  "0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(34,197,94,0.5)",
                animation: isOpen
                  ? "orbBlink 4s ease-in-out infinite"
                  : "orbBlink 5s ease-in-out infinite",
              }}
            />
          </div>
          {/* Smile */}
          <div
            style={{
              width: "8px",
              height: "4px",
              borderBottom: "1.5px solid rgba(255,255,255,0.7)",
              borderRadius: "0 0 50% 50%",
              marginTop: "-1px",
            }}
          />
        </div>
      </div>

      {/* ── Floating particles ── */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`feel-orb-particle-${i}`}
          style={{
            position: "absolute",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(34,197,94,0.6)",
            boxShadow: "0 0 4px rgba(34,197,94,0.4)",
            animation: `orbParticle${i} ${4 + i * 1.5}s ease-in-out infinite`,
            pointerEvents: "none",
            transition: "width 0.2s ease, height 0.2s ease, background 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN WIDGET
   ══════════════════════════════════════════════════════════ */
export default function FeelAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "👋 Hi! I'm your **Feel Assistant**.\n\nI can analyze your projects, track overdue invoices, draft proposals, and help optimize your client workflows. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  // Listen for global open event (e.g. from sidebar)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-feel-assistant", handleOpen);
    return () => window.removeEventListener("open-feel-assistant", handleOpen);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || prompt).trim();
    if (!q || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prompt", promptText: q }),
      });
      const data = await res.json();

      if (res.ok && data.response) {
        const fullText = data.response;
        const assistantMsgId = `assistant-${Date.now()}`;

        // Initial empty message for streaming effect
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            sender: "assistant",
            text: "",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        let i = 0;
        const timer = setInterval(() => {
          if (i < fullText.length) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, text: fullText.slice(0, i + 1) }
                  : msg
              )
            );
            i += 2; // smooth stream chunks
          } else {
            clearInterval(timer);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, text: fullText } : msg
              )
            );
          }
        }, 8);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${Date.now()}`,
            sender: "assistant",
            text: `⚠️ ${data.error || "I could not complete that request. Please try again."}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: "assistant",
          text: "⚠️ Network connection interrupted. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: "👋 Chat reset! How can **Feel Assistant** help you with your projects today?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <>
      {/* ── ORB KEYFRAME ANIMATIONS (injected once) ── */}
      <style>{`
        /* ── Base Animations ── */
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes orbListening {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.06); }
        }
        @keyframes orbPulseHalo {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes orbShadowPulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
          50% { opacity: 0.3; transform: translateX(-50%) scaleX(0.85); }
        }
        @keyframes orbRingSpin {
          from { transform: rotateX(65deg) rotateZ(0deg); }
          to { transform: rotateX(65deg) rotateZ(360deg); }
        }
        @keyframes orbRingSpin2 {
          from { transform: rotateX(70deg) rotateZ(60deg); }
          to { transform: rotateX(70deg) rotateZ(420deg); }
        }
        @keyframes orbCoreGlow {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes orbBlink {
          0%, 42%, 46%, 100% { transform: scaleY(1); }
          44% { transform: scaleY(0.1); }
        }
        @keyframes orbParticle0 {
          0%, 100% { transform: translate(18px, -8px); opacity: 0; }
          20% { opacity: 0.8; }
          50% { transform: translate(24px, -18px); opacity: 0.4; }
          80% { opacity: 0; }
        }
        @keyframes orbParticle1 {
          0%, 100% { transform: translate(-16px, -12px); opacity: 0; }
          30% { opacity: 0.7; }
          60% { transform: translate(-22px, -22px); opacity: 0.3; }
          90% { opacity: 0; }
        }
        @keyframes orbParticle2 {
          0%, 100% { transform: translate(6px, 18px); opacity: 0; }
          25% { opacity: 0.6; }
          55% { transform: translate(10px, 24px); opacity: 0.2; }
          85% { opacity: 0; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── CRAZY HOVER ANIMATIONS ── */

        /* Jelly bounce: squish + stretch + energetic float without rotation */
        @keyframes orbJellyBounce {
          0%   { transform: translateY(-2px) scale(1.08) scaleX(1) scaleY(1); }
          10%  { transform: translateY(-8px) scale(1.14) scaleX(0.92) scaleY(1.12); }
          20%  { transform: translateY(-3px) scale(1.06) scaleX(1.08) scaleY(0.94); }
          30%  { transform: translateY(-10px) scale(1.16) scaleX(0.94) scaleY(1.1); }
          40%  { transform: translateY(-2px) scale(1.04) scaleX(1.06) scaleY(0.96); }
          50%  { transform: translateY(-9px) scale(1.15) scaleX(0.93) scaleY(1.08); }
          60%  { transform: translateY(-4px) scale(1.08) scaleX(1.04) scaleY(0.97); }
          70%  { transform: translateY(-7px) scale(1.12) scaleX(0.95) scaleY(1.06); }
          80%  { transform: translateY(-2px) scale(1.06) scaleX(1.03) scaleY(0.98); }
          90%  { transform: translateY(-6px) scale(1.1) scaleX(0.96) scaleY(1.04); }
          100% { transform: translateY(-2px) scale(1.08) scaleX(1) scaleY(1); }
        }

        /* Eyes go wide + sparkle on hover */
        @keyframes orbEyeExcited {
          0%, 100% { transform: scale(1); box-shadow: 0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(34,197,94,0.5); }
          20% { transform: scale(1.5); box-shadow: 0 0 10px rgba(255,255,255,1), 0 0 20px rgba(34,197,94,0.8), 0 0 30px rgba(99,102,241,0.4); }
          40% { transform: scale(1.2); }
          60% { transform: scale(1.6); box-shadow: 0 0 12px rgba(255,255,255,1), 0 0 24px rgba(34,197,94,0.9), 0 0 36px rgba(168,85,247,0.4); }
          80% { transform: scale(1.3); }
        }

        /* Halo does a shockwave ripple outward */
        @keyframes orbHaloShockwave {
          0% { transform: scale(1); opacity: 0.6; }
          20% { transform: scale(1.4); opacity: 1; }
          40% { transform: scale(1.1); opacity: 0.8; }
          60% { transform: scale(1.5); opacity: 0.9; }
          80% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1.3); opacity: 0.8; }
        }

        /* Particle explosion — each particle flies outward fast */
        @keyframes orbParticleExplode0 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          30% { transform: translate(28px, -22px) scale(1.5); opacity: 1; }
          60% { transform: translate(36px, -30px) scale(1); opacity: 0.7; }
          100% { transform: translate(22px, -16px) scale(0.8); opacity: 0.4; }
        }
        @keyframes orbParticleExplode1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(-30px, -18px) scale(1.6); opacity: 1; }
          55% { transform: translate(-38px, -28px) scale(1.1); opacity: 0.6; }
          100% { transform: translate(-24px, -14px) scale(0.7); opacity: 0.3; }
        }
        @keyframes orbParticleExplode2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          35% { transform: translate(14px, 28px) scale(1.4); opacity: 1; }
          65% { transform: translate(20px, 36px) scale(0.9); opacity: 0.5; }
          100% { transform: translate(10px, 22px) scale(0.6); opacity: 0.2; }
        }

        /* Core glow goes supernova on hover */
        @keyframes orbCoreSupernova {
          0%, 100% { opacity: 0.6; transform: scale(1); filter: hue-rotate(0deg); }
          25% { opacity: 1; transform: scale(1.6); filter: hue-rotate(30deg); }
          50% { opacity: 0.8; transform: scale(1.3); filter: hue-rotate(-20deg); }
          75% { opacity: 1; transform: scale(1.8); filter: hue-rotate(15deg); }
        }

        /* ── Hover state application ── */

        .feel-orb-root:hover .feel-orb-sphere {
          animation: orbJellyBounce 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
          box-shadow:
            inset 0 -6px 14px rgba(0,0,0,0.35),
            inset 0 4px 10px rgba(34,197,94,0.4),
            0 0 40px rgba(34,197,94,0.55),
            0 0 60px rgba(99,102,241,0.15),
            0 8px 24px rgba(0,0,0,0.5) !important;
          filter: saturate(1.3) brightness(1.1);
        }

        .feel-orb-root:hover .feel-orb-eye {
          animation: orbEyeExcited 1.2s ease-in-out infinite !important;
        }

        .feel-orb-root:hover .feel-orb-halo {
          animation: orbHaloShockwave 1.5s ease-in-out infinite !important;
          background: radial-gradient(circle,
            rgba(34,197,94,0.4) 0%,
            rgba(99,102,241,0.12) 40%,
            transparent 70%) !important;
        }

        /* Rings speed up 4x + glow brighter + tilt differently */
        .feel-orb-root:hover .feel-orb-ring1 {
          animation-duration: 2s !important;
          border-color: rgba(34,197,94,0.5) !important;
          box-shadow: 0 0 8px rgba(34,197,94,0.3);
          border-width: 1.5px;
        }
        .feel-orb-root:hover .feel-orb-ring2 {
          animation-duration: 3s !important;
          border-color: rgba(168,85,247,0.4) !important;
          box-shadow: 0 0 8px rgba(168,85,247,0.25);
          border-width: 1.5px;
        }

        /* Particles explode outward */
        .feel-orb-root:hover .feel-orb-particle-0 {
          animation: orbParticleExplode0 1.4s ease-in-out infinite !important;
          background: rgba(34,197,94,0.9) !important;
          width: 4px !important;
          height: 4px !important;
          box-shadow: 0 0 8px rgba(34,197,94,0.7) !important;
        }
        .feel-orb-root:hover .feel-orb-particle-1 {
          animation: orbParticleExplode1 1.6s ease-in-out infinite !important;
          background: rgba(99,102,241,0.9) !important;
          width: 4px !important;
          height: 4px !important;
          box-shadow: 0 0 8px rgba(99,102,241,0.7) !important;
        }
        .feel-orb-root:hover .feel-orb-particle-2 {
          animation: orbParticleExplode2 1.8s ease-in-out infinite !important;
          background: rgba(168,85,247,0.9) !important;
          width: 4px !important;
          height: 4px !important;
          box-shadow: 0 0 8px rgba(168,85,247,0.7) !important;
        }

        /* Inner core goes supernova */
        .feel-orb-root:hover .feel-orb-core {
          animation: orbCoreSupernova 1.5s ease-in-out infinite !important;
        }

        /* Shadow stretches on hover */
        .feel-orb-root:hover .feel-orb-shadow {
          width: 38px !important;
          background: rgba(34,197,94,0.35) !important;
          filter: blur(6px) !important;
        }

        .feel-orb-root:active .feel-orb-sphere {
          animation: none !important;
          transform: translateY(0) scale(0.9) !important;
          transition: transform 0.1s ease !important;
        }

        /* Tooltip label */
        .feel-orb-root::after {
          content: "Feel Assistant";
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) translateX(6px);
          background: var(--surface-2, #181b26);
          border: 1px solid var(--border, rgba(255,255,255,0.1));
          color: var(--text-primary, #fff);
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .feel-orb-root:hover::after {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>

      {/* ── FLOATING 3D ORB TRIGGER (BOTTOM RIGHT) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Feel Assistant"
        style={{
          position: "fixed",
          bottom: "22px",
          right: "22px",
          zIndex: 150,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OrbMascot isOpen={isOpen} listening={loading} />
      </button>

      {/* ── FLOATING POP-UP CHAT WINDOW ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "22px",
            width: "390px",
            maxWidth: "calc(100vw - 32px)",
            height: "540px",
            maxHeight: "calc(100vh - 120px)",
            background: "var(--surface-1, #0f1117)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow:
              "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 40px rgba(34,197,94,0.08)",
            zIndex: 151,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2, #141722)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Mini orb in header */}
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: `
                    radial-gradient(ellipse 55% 50% at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    radial-gradient(ellipse 80% 80% at 50% 50%, rgba(34,197,94,0.6) 0%, rgba(16,185,129,0.4) 40%, rgba(99,102,241,0.15) 80%, rgba(30,30,50,0.5) 100%)
                  `,
                  boxShadow:
                    "inset 0 -3px 8px rgba(0,0,0,0.3), 0 0 10px rgba(34,197,94,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* Mini face */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    transform: "translateY(-0.5px)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "5px", alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: "3px",
                        height: "3px",
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                      }}
                    />
                    <div
                      style={{
                        width: "3px",
                        height: "3px",
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "5px",
                      height: "2.5px",
                      borderBottom: "1px solid rgba(255,255,255,0.6)",
                      borderRadius: "0 0 50% 50%",
                    }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <h3
                    className="font-heading"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Feel Assistant
                  </h3>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--color-brand, #22c55e)",
                      display: "inline-block",
                      boxShadow: "0 0 6px var(--color-brand, #22c55e)",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    margin: "1px 0 0",
                  }}
                >
                  Autonomous Freelance Copilot
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                onClick={handleClear}
                title="Reset conversation"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  padding: "6px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  padding: "6px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.02)",
              borderBottom:
                "1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              flexShrink: 0,
            }}
          >
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => handleSend(qp.label)}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 9px",
                  fontSize: "11px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  borderRadius: "6px",
                  background: "var(--surface-2, #181b26)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  cursor: loading ? "default" : "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor =
                      "var(--color-brand, #22c55e)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <qp.icon
                  size={11}
                  style={{ color: "var(--color-brand, #22c55e)" }}
                />
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: "14px 14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "10px 12px",
                    borderRadius:
                      m.sender === "user"
                        ? "14px 14px 2px 14px"
                        : "14px 14px 14px 2px",
                    background:
                      m.sender === "user"
                        ? "var(--color-brand, #22c55e)"
                        : "var(--surface-2, #161924)",
                    color:
                      m.sender === "user" ? "#000000" : "var(--text-primary)",
                    border:
                      m.sender === "user"
                        ? "none"
                        : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                    fontSize: "12.5px",
                    lineHeight: 1.48,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    position: "relative",
                  }}
                >
                  {m.text}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 4px",
                  }}
                >
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    {m.timestamp}
                  </span>
                  {m.sender === "assistant" && m.text && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.text, m.id)}
                      title="Copy response"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "1px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {copiedId === m.id ? (
                        <Check
                          size={11}
                          style={{ color: "var(--color-brand)" }}
                        />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                }}
              >
                <Loader2
                  size={14}
                  className="animate-spin"
                  style={{ color: "var(--color-brand, #22c55e)" }}
                />
                <span
                  style={{ fontSize: "11.5px", color: "var(--text-muted)" }}
                >
                  Feel Assistant is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--border)",
              background: "var(--surface-2, #141722)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Feel Assistant anything..."
              disabled={loading}
              style={{
                flex: 1,
                background: "var(--surface-1, #0f1117)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12.5px",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-brand, #22c55e)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border)")
              }
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: prompt.trim()
                  ? "var(--color-brand, #22c55e)"
                  : "var(--surface-3, #222634)",
                color: prompt.trim() ? "#000000" : "var(--text-muted)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: prompt.trim() ? "pointer" : "default",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <SendHorizontal size={15} />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
