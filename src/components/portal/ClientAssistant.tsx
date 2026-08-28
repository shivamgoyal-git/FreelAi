"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function ClientAssistant({
  previewClientId,
}: {
  previewClientId?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your FreeAI Project Assistant. Ask me anything about your project progress, pending milestones, invoices, or deliverables.",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/portal/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          previewClientId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "I was unable to retrieve that information. Please try asking again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (err) {
      console.error("AI Error:", err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Sorry, I had trouble connecting. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What is my project status?",
    "Which deliverables need my review?",
    "What invoices are pending?",
    "When is my next milestone?",
  ];

  return (
    <>
      {/* Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(39, 166, 68, 0.15) 0%, rgba(22, 101, 52, 0.1) 100%)",
          border: "1px solid rgba(39, 166, 68, 0.35)",
          color: "var(--color-bone, #e5e5e6)",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <Sparkles size={14} style={{ color: "var(--color-pulse-green, #27a644)" }} />
        <span>FreeAI Assistant</span>
      </button>

      {/* Slide-out / Drawer overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              height: "100%",
              background: "var(--color-carbon, #0f1011)",
              borderLeft: "1px solid var(--color-graphite, #23252a)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-16px 0 40px rgba(0, 0, 0, 0.6)",
              animation: "slideInRight 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--color-graphite, #23252a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--color-obsidian, #161718)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(39, 166, 68, 0.15)",
                    border: "1px solid rgba(39, 166, 68, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={18} style={{ color: "var(--color-pulse-green, #27a644)" }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-bone, #e5e5e6)",
                      margin: 0,
                    }}
                  >
                    FreeAI Assistant
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--color-pulse-green, #27a644)",
                    }}
                  >
                    Scoped to your projects
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-fog, #8a8f98)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "12px 14px",
                        borderRadius: isUser
                          ? "14px 14px 2px 14px"
                          : "14px 14px 14px 2px",
                        background: isUser
                          ? "var(--color-pulse-green, #27a644)"
                          : "var(--color-obsidian, #161718)",
                        color: isUser ? "#ffffff" : "var(--color-bone, #e5e5e6)",
                        fontSize: "13.5px",
                        lineHeight: 1.5,
                        border: isUser
                          ? "none"
                          : "1px solid var(--color-graphite, #23252a)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                    <span
                      style={{
                        fontSize: "10.5px",
                        color: "var(--color-ash, #62666d)",
                        padding: "0 4px",
                      }}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 2px",
                    background: "var(--color-obsidian, #161718)",
                    border: "1px solid var(--color-graphite, #23252a)",
                    color: "var(--color-fog, #8a8f98)",
                    fontSize: "13px",
                    alignSelf: "flex-start",
                  }}
                >
                  <Loader2 size={15} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div
              style={{
                padding: "8px 16px",
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                borderTop: "1px solid var(--color-graphite, #23252a)",
                background: "var(--color-carbon, #0f1011)",
              }}
            >
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  style={{
                    flexShrink: 0,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "var(--color-obsidian, #161718)",
                    border: "1px solid var(--color-graphite, #23252a)",
                    color: "var(--color-fog, #8a8f98)",
                    fontSize: "11px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: "16px",
                borderTop: "1px solid var(--color-graphite, #23252a)",
                background: "var(--color-obsidian, #161718)",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your projects..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "var(--color-carbon, #0f1011)",
                    border: "1px solid var(--color-graphite, #23252a)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "13.5px",
                    color: "var(--color-paper, #ffffff)",
                    outline: "none",
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading || !input.trim()}
                  style={{ borderRadius: "8px", padding: "0 14px" }}
                >
                  <Send size={15} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
