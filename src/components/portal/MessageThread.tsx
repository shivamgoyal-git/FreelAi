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
  initialMessages,
  previewClientId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      setLoading(false);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages immediately on mount and poll periodically
  useEffect(() => {
    let isMounted = true;

    const fetchLatestMessages = async (isInitial = false) => {
      try {
        if (isInitial && (!messages || messages.length === 0)) {
          setLoading(true);
        }
        const url = `/api/portal/messages?projectId=${projectId || ""}${
          previewClientId ? `&previewClientId=${previewClientId}` : ""
        }`;
        const res = await fetch(url);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestMessages(true);
    const interval = setInterval(() => fetchLatestMessages(false), 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempMessage._id ? data.message : m))
          );
        }
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
        {loading && messages.length === 0 ? (
          <div
            style={{
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-fog, #8a8f98)",
              fontSize: "12px",
            }}
          >
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
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
                  width: "100%",
                }}
              >

                <div
                  style={{
                    maxWidth: "75%",
                    minWidth: "120px",
                    padding: "10px 14px 8px 14px",
                    borderRadius: isClient
                      ? "16px 16px 3px 16px"
                      : "16px 16px 16px 3px",
                    background: isClient
                      ? "linear-gradient(135deg, #075e54 0%, #005c4b 100%)"
                      : "var(--surface-2, #202c33)",
                    color: isClient ? "#ffffff" : "#f1f5f9",
                    fontSize: "13.5px",
                    lineHeight: 1.5,
                    border: isClient
                      ? "0.5px solid rgba(74, 222, 128, 0.45)"
                      : "0.5px solid #2e353f",
                    boxShadow: isClient
                      ? "0 2px 10px rgba(0, 92, 75, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.25)",
                    wordBreak: "break-word",
                  }}
                >
                  <div style={{ marginBottom: "4px" }}>{m.content}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "4px",
                      fontSize: "10px",
                      color: isClient ? "rgba(255, 255, 255, 0.7)" : "var(--color-fog, #8a8f98)",
                    }}
                  >
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isClient && <CheckCheck size={13} color="#4ade80" />}
                  </div>
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
            style={{
              flex: 1,
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "var(--color-paper, #ffffff)",
              fontSize: "13.5px",
              outline: "none",
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || sending}
            style={{
              borderRadius: "8px",
              gap: "6px",
              padding: "10px 16px",
            }}
          >
            {sending ? (
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Send size={15} />
            )}
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
