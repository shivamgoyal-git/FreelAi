"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Send,
  MessageSquare,
  Loader2,
  ExternalLink,
  Users,
  Building2,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface IConversationClient {
  _id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
  status: string;
}

interface IConversation {
  client: IConversationClient;
  lastMessage: {
    _id: string;
    content: string;
    senderRole: "client" | "freelancer";
    senderName: string;
    createdAt: string;
    readByFreelancer: boolean;
  } | null;
  unreadCount: number;
  projectCount: number;
  lastActivity: string;
}

interface IMessage {
  _id: string;
  projectId?: string;
  clientId?: string;
  senderRole: "client" | "freelancer";
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  readByFreelancer?: boolean;
}

interface IProject {
  _id: string;
  title: string;
  status: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId");

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeClientId, setActiveClientId] = useState<string | null>(initialClientId);
  const [activeClient, setActiveClient] = useState<IConversationClient | null>(null);
  const [clientProjects, setClientProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingConversations(true);
      const res = await fetch("/api/dashboard/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);

        if (!activeClientId && data.conversations?.length > 0) {
          setActiveClientId(data.conversations[0].client._id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [activeClientId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(true), 12000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // 2. Fetch messages for active client
  const fetchMessages = useCallback(
    async (clientId: string, silent = false) => {
      try {
        if (!silent) setLoadingMessages(true);
        const url = selectedProjectId && selectedProjectId !== "all"
          ? `/api/dashboard/messages?clientId=${clientId}&projectId=${selectedProjectId}`
          : `/api/dashboard/messages?clientId=${clientId}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setActiveClient(data.client || null);
          setClientProjects(data.projects || []);

          setConversations((prev) =>
            prev.map((c) =>
              c.client._id === clientId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error("Failed to load client messages:", err);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [selectedProjectId]
  );

  useEffect(() => {
    if (activeClientId) {
      fetchMessages(activeClientId);
      const interval = setInterval(() => fetchMessages(activeClientId, true), 5000);
      return () => clearInterval(interval);
    }
  }, [activeClientId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeClientId || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: activeClientId,
          projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
          content: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);

          setConversations((prev) =>
            prev.map((c) =>
              c.client._id === activeClientId
                ? {
                    ...c,
                    lastMessage: data.message,
                    lastActivity: data.message.createdAt,
                  }
                : c
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
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

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.client.name.toLowerCase().includes(q) ||
      c.client.email.toLowerCase().includes(q) ||
      (c.client.company && c.client.company.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.content.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "calc(100vh - var(--topnav-height) - 48px)",
        minHeight: "600px",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            className="font-heading"
            style={{
              fontSize: "22px",
              fontWeight: 650,
              color: "var(--text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>Client Messages</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(39, 166, 68, 0.15)",
                color: "var(--color-pulse-green, #27a644)",
                border: "0.5px solid rgba(39, 166, 68, 0.3)",
              }}
            >
              Live Portal Sync
            </span>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
            Chat with your clients in real-time as they browse their Client Portal.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchConversations()}
            leftIcon={<RefreshCw size={13} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* WhatsApp Dual-Pane Layout Container */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          borderRadius: "var(--radius-cards, 14px)",
          border: "0.5px solid var(--border)",
          background: "var(--surface-1)",
        }}
      >
        {/* ── LEFT PANE: Conversations List (WhatsApp Client List) ── */}
        <div
          style={{
            width: "340px",
            borderRight: "0.5px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            background: "var(--surface-1)",
            flexShrink: 0,
          }}
        >
          {/* Search box */}
          <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border)" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search clients or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {loadingConversations ? (
              <div
                style={{
                  padding: "30px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "var(--text-muted)",
                }}
              >
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "12px" }}>Loading clients...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Users size={24} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>No clients found</p>
                <p style={{ fontSize: "11.5px", margin: "4px 0 0 0" }}>
                  {searchQuery ? "Try a different search query." : "Add a client to start chatting."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeClientId === conv.client._id;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <div
                    key={conv.client._id}
                    onClick={() => {
                      setActiveClientId(conv.client._id);
                      setSelectedProjectId("all");
                    }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: isSelected
                        ? "var(--surface-2)"
                        : "transparent",
                      border: isSelected
                        ? "0.5px solid rgba(39, 166, 68, 0.4)"
                        : "0.5px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--surface-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: isSelected
                            ? "linear-gradient(135deg, rgba(39, 166, 68, 0.3), rgba(39, 166, 68, 0.1))"
                            : "var(--surface-3, #1e2024)",
                          border: isSelected
                            ? "1px solid var(--color-pulse-green, #27a644)"
                            : "0.5px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isSelected
                            ? "var(--color-pulse-green, #27a644)"
                            : "var(--text-primary)",
                        }}
                      >
                        {getInitials(conv.client.name)}
                      </div>

                      {/* Active dot indicator */}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "var(--color-pulse-green, #27a644)",
                          border: "2px solid var(--surface-1)",
                        }}
                      />
                    </div>

                    {/* Middle: Name & Last message preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "6px",
                          marginBottom: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13.5px",
                            fontWeight: hasUnread ? 700 : 550,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conv.client.name}
                        </span>

                        <span
                          style={{
                            fontSize: "11px",
                            color: hasUnread
                              ? "var(--color-pulse-green, #27a644)"
                              : "var(--text-muted)",
                            flexShrink: 0,
                            fontWeight: hasUnread ? 600 : 400,
                          }}
                        >
                          {conv.lastMessage
                            ? formatRelativeTime(conv.lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            color: hasUnread
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: hasUnread ? 600 : 400,
                          }}
                        >
                          {conv.lastMessage
                            ? (conv.lastMessage.senderRole === "freelancer" ? "You: " : "") +
                              conv.lastMessage.content
                            : conv.client.company || "No messages yet"}
                        </p>

                        {/* Unread badge counter */}
                        {hasUnread && (
                          <span
                            style={{
                              minWidth: "18px",
                              height: "18px",
                              padding: "0 5px",
                              borderRadius: "9px",
                              background: "var(--color-pulse-green, #27a644)",
                              color: "#000",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: WhatsApp-style Active Chat Window ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "var(--surface-1)",
            overflow: "hidden",
          }}
        >
          {activeClientId && activeClient ? (
            <>
              {/* Chat Top Header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "0.5px solid var(--border)",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(39, 166, 68, 0.15)",
                      border: "1px solid rgba(39, 166, 68, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-pulse-green, #27a644)",
                    }}
                  >
                    {getInitials(activeClient.name)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h2
                        className="font-heading"
                        style={{
                          fontSize: "15px",
                          fontWeight: 650,
                          color: "var(--text-primary)",
                          margin: 0,
                        }}
                      >
                        {activeClient.name}
                      </h2>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: "rgba(39, 166, 68, 0.12)",
                          color: "var(--color-pulse-green, #27a644)",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "var(--color-pulse-green, #27a644)",
                          }}
                        />
                        Portal Connected
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        margin: "2px 0 0 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {activeClient.company && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Building2 size={11} />
                          <span>{activeClient.company}</span>
                        </span>
                      )}
                      <span>{activeClient.email}</span>
                    </p>
                  </div>
                </div>

                {/* Quick actions for this client */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link
                    href={`/dashboard/clients/${activeClient._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="outline" size="sm" style={{ fontSize: "12px", padding: "5px 10px" }}>
                      <span>Client Details</span>
                      <ExternalLink size={11} style={{ marginLeft: "4px" }} />
                    </Button>
                  </Link>
                  <Link
                    href={`/portal?previewClientId=${activeClient._id}`}
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="secondary" size="sm" style={{ fontSize: "12px", padding: "5px 10px" }}>
                      <span>Preview Portal</span>
                      <ExternalLink size={11} style={{ marginLeft: "4px" }} />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Project Filter Tab Strip (if client has projects) */}
              {clientProjects.length > 0 && (
                <div
                  style={{
                    padding: "8px 20px",
                    borderBottom: "0.5px solid var(--border)",
                    background: "var(--surface-1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    overflowX: "auto",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "4px" }}>
                    Project:
                  </span>
                  <button
                    onClick={() => setSelectedProjectId("all")}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "11.5px",
                      fontWeight: 500,
                      background: selectedProjectId === "all" ? "var(--surface-3)" : "transparent",
                      color: selectedProjectId === "all" ? "var(--color-pulse-green, #27a644)" : "var(--text-muted)",
                      border: selectedProjectId === "all" ? "0.5px solid var(--border-strong)" : "none",
                      cursor: "pointer",
                    }}
                  >
                    All Conversations
                  </button>
                  {clientProjects.map((proj) => (
                    <button
                      key={proj._id}
                      onClick={() => setSelectedProjectId(proj._id)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11.5px",
                        fontWeight: 500,
                        background: selectedProjectId === proj._id ? "var(--surface-3)" : "transparent",
                        color: selectedProjectId === proj._id ? "var(--color-pulse-green, #27a644)" : "var(--text-muted)",
                        border: selectedProjectId === proj._id ? "0.5px solid var(--border-strong)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      {proj.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages Stream Pane */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  background: "var(--surface-1)",
                }}
              >
                {loadingMessages ? (
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
                    <span style={{ fontSize: "12.5px" }}>Loading message thread...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "12px",
                      textAlign: "center",
                      padding: "40px 20px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "var(--surface-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          margin: "0 0 4px 0",
                        }}
                      >
                        No messages with {activeClient.name} yet
                      </h3>
                      <p
                        style={{
                          fontSize: "12.5px",
                          color: "var(--text-muted)",
                          maxWidth: "380px",
                          margin: 0,
                          lineHeight: "1.5",
                        }}
                      >
                        Send a message below to start the conversation. Your message will instantly appear on their Client Portal.
                      </p>
                    </div>
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
                          width: "100%",
                        }}
                      >

                        {/* Message Bubble */}
                        <div
                          style={{
                            maxWidth: "75%",
                            minWidth: "120px",
                            padding: "10px 14px 8px 14px",
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
                            fontSize: "13.5px",
                            lineHeight: "1.55",
                            wordBreak: "break-word",
                            boxShadow: isFreelancer
                              ? "0 2px 10px rgba(0, 92, 75, 0.3)"
                              : "0 2px 8px rgba(0, 0, 0, 0.25)",
                          }}
                        >
                          <div style={{ marginBottom: "4px" }}>{m.content}</div>

                          {/* Time & Read status at bottom right */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "4px",
                              fontSize: "10px",
                              color: isFreelancer ? "rgba(255, 255, 255, 0.7)" : "var(--text-muted)",
                              marginTop: "2px",
                            }}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isFreelancer && (
                              <CheckCheck size={13} color="#4ade80" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "14px 20px",
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
                  placeholder={`Type a message to ${activeClient.name}...`}
                  style={{
                    flex: 1,
                    background: "var(--surface-1)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "13.5px",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputText.trim() || sending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 20px",
                    borderRadius: "10px",
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
            </>
          ) : (
            /* Empty State: No conversation selected */
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "16px",
                textAlign: "center",
                padding: "40px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                }}
              >
                <MessageSquare size={30} color="var(--color-pulse-green, #27a644)" />
              </div>
              <div>
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 6px 0",
                  }}
                >
                  Select a Client Conversation
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-muted)",
                    maxWidth: "380px",
                    margin: 0,
                    lineHeight: "1.55",
                  }}
                >
                  Pick a client from the left panel to view their incoming messages and chat directly with them in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "70vh",
            gap: "10px",
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading messages hub...</span>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
