"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, Bot, CheckCheck, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/portal";

interface MessageThreadProps {
  projectId: string;
  projectName?: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  clientName?: string;
  clientAvatar?: string;
  initialMessages?: Message[];
  previewClientId?: string | null;
}

export function MessageThread({
  projectId,
  projectName = "Project",
  freelancerName = "Freelancer",
  freelancerAvatar,
  clientName = "Client",
  clientAvatar,
  initialMessages = [],
  previewClientId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic polling for new messages
  useEffect(() => {
    const fetchLatestMessages = async () => {
      try {
        const url = `/api/portal/messages?projectId=${projectId}${
          previewClientId ? `&previewClientId=${previewClientId}` : ""
        }`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    };

    const interval = setInterval(fetchLatestMessages, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [projectId, previewClientId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);

    // Optimistic message
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      projectId,
      clientId: "",
      userId: "",
      senderRole: "client",
      senderId: "me",
      senderName: clientName,
      senderAvatar: clientAvatar,
      content: messageText,
      readByClient: true,
      readByFreelancer: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          content: messageText,
          previewClientId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMessage._id ? data.message : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "560px",
        background: "var(--color-carbon, #0f1011)",
        border: "1px solid var(--color-graphite, #23252a)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          padding: "14px 20px",
          background: "var(--color-obsidian, #161718)",
          borderBottom: "1px solid var(--color-graphite, #23252a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #27a644 0%, #166534 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {freelancerName[0]?.toUpperCase() || "F"}
          </div>
          <div>
            <h4
              style={{
                fontSize: "13.5px",
                fontWeight: 600,
                color: "var(--color-bone, #e5e5e6)",
                margin: 0,
              }}
            >
              {freelancerName}
            </h4>
            <span style={{ fontSize: "11px", color: "var(--color-fog, #8a8f98)" }}>
              {projectName}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              color: "var(--color-fog, #8a8f98)",
              fontSize: "13px",
            }}
          >
            No messages yet. Send a message to get in touch with {freelancerName}.
          </div>
        ) : (
          messages.map((m) => {
            const isClient = m.senderRole === "client";
            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isClient ? "flex-end" : "flex-start",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "var(--color-fog, #8a8f98)",
                    padding: "0 4px",
                  }}
                >
                  <span>{isClient ? "You" : m.senderName || freelancerName}</span>
                  <span>•</span>
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: isClient
                      ? "12px 12px 2px 12px"
                      : "12px 12px 12px 2px",
                    background: isClient
                      ? "var(--color-pulse-green, #27a644)"
                      : "var(--color-obsidian, #161718)",
                    color: isClient ? "#ffffff" : "var(--color-bone, #e5e5e6)",
                    fontSize: "13.5px",
                    lineHeight: 1.45,
                    border: isClient
                      ? "none"
                      : "1px solid var(--color-graphite, #23252a)",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--color-graphite, #23252a)",
          background: "var(--color-obsidian, #161718)",
        }}
      >
        <form
          onSubmit={handleSend}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to your freelancer..."
            disabled={sending}
            style={{
              flex: 1,
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13.5px",
              color: "var(--color-paper, #ffffff)",
              outline: "none",
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={sending || !input.trim()}
            style={{ borderRadius: "8px", padding: "0 16px" }}
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Send</span>
                <Send size={13} />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
