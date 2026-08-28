"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, Loader2, CheckCheck, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface IMessageItem {
  _id: string;
  projectId: string;
  senderRole: "client" | "freelancer";
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  readByFreelancer?: boolean;
}

interface Props {
  projectId: string;
  clientName?: string;
}

export function ProjectMessagesManager({ projectId, clientName }: Props) {
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load project messages", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "440px",
        overflow: "hidden",
        borderRadius: "var(--radius-cards)",
        border: "0.5px solid var(--border)",
        background: "var(--surface-1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(39, 166, 68, 0.15)",
              color: "var(--color-pulse-green, #27a644)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquare size={16} />
          </div>
          <div>
            <h3
              className="font-heading"
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Client Communication
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Direct messages with {clientName || "Client"} from the Client Portal
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--color-pulse-green, #27a644)",
              boxShadow: "0 0 6px rgba(39, 166, 68, 0.6)",
            }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Portal Connected</span>
        </div>
      </div>

      {/* Message Stream */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--surface-1)",
        }}
      >
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
              color: "var(--text-muted)",
            }}
          >
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "12px" }}>Loading client messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <MessageSquare size={20} />
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              No messages yet
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                maxWidth: "340px",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              When your client writes to you from their Client Portal, their messages will appear here in real time.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isFreelancer = m.senderRole === "freelancer";
            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isFreelancer ? "flex-end" : "flex-start",
                }}
              >

                <div
                  style={{
                    maxWidth: "80%",
                    minWidth: "110px",
                    padding: "9px 14px 7px 14px",
                    borderRadius: isFreelancer
                      ? "16px 16px 3px 16px"
                      : "16px 16px 16px 3px",
                    background: isFreelancer
                      ? "linear-gradient(135deg, #075e54 0%, #005c4b 100%)"
                      : "var(--surface-2, #202c33)",
                    border: isFreelancer
                      ? "0.5px solid rgba(74, 222, 128, 0.4)"
                      : "0.5px solid var(--border-strong, #2e353f)",
                    color: isFreelancer ? "#ffffff" : "#f1f5f9",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                    boxShadow: isFreelancer
                      ? "0 2px 8px rgba(0, 92, 75, 0.3)"
                      : "0 2px 6px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={{ marginBottom: "3px" }}>{m.content}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "4px",
                      fontSize: "10px",
                      color: isFreelancer ? "rgba(255, 255, 255, 0.7)" : "var(--text-muted)",
                    }}
                  >
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isFreelancer && <CheckCheck size={12} color="#4ade80" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "12px 16px",
          borderTop: "0.5px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply directly to client portal..."
          style={{
            flex: 1,
            background: "var(--surface-1)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-inputs)",
            padding: "9px 14px",
            fontSize: "13px",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || sending}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
          }}
        >
          {sending ? (
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={13} />
          )}
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
