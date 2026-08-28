"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Sparkles, CheckCheck, Clock } from "lucide-react";
import Link from "next/link";
import type { PortalNotification } from "@/types/portal";

export function NotificationCenter({
  previewClientId,
}: {
  previewClientId?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = previewClientId
        ? `/api/portal/notifications?previewClientId=${previewClientId}`
        : `/api/portal/notifications`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // 45s polling
    return () => clearInterval(interval);
  }, [previewClientId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/portal/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, previewClientId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/portal/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, previewClientId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "var(--color-obsidian, #161718)",
          border: "1px solid var(--color-graphite, #23252a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-fog, #8a8f98)",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.15s ease",
        }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-3px",
              right: "-3px",
              background: "var(--color-pulse-green, #27a644)",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: 700,
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px rgba(39, 166, 68, 0.6)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "340px",
            maxHeight: "440px",
            background: "var(--color-carbon, #0f1011)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-graphite, #23252a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--color-bone, #e5e5e6)",
                }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-pulse-green, #27a644)",
                    background: "rgba(39, 166, 68, 0.12)",
                    padding: "1px 6px",
                    borderRadius: "999px",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "11.5px",
                  color: "var(--color-fog, #8a8f98)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              maxHeight: "360px",
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  color: "var(--color-fog, #8a8f98)",
                  fontSize: "13px",
                }}
              >
                <Clock size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--color-graphite, #23252a)",
                    background: n.read ? "transparent" : "rgba(39, 166, 68, 0.04)",
                    transition: "background 0.15s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: n.read ? 500 : 600,
                        color: n.read
                          ? "var(--color-bone, #e5e5e6)"
                          : "#ffffff",
                      }}
                    >
                      {n.title}
                    </div>
                    {!n.read && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--color-pulse-green, #27a644)",
                          flexShrink: 0,
                          marginTop: "6px",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-fog, #8a8f98)",
                      lineHeight: 1.4,
                      marginBottom: "6px",
                    }}
                  >
                    {n.message}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "10.5px",
                      color: "var(--color-ash, #62666d)",
                    }}
                  >
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          color: "var(--color-pulse-green, #27a644)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
