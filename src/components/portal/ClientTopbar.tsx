"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  FolderGit2,
  Receipt,
  Files,
  X,
  Eye,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { ClientAssistant } from "./ClientAssistant";

interface ClientTopbarProps {
  onMenuClick: () => void;
  clientName?: string;
  clientCompany?: string;
  clientAvatar?: string;
  isPreview?: boolean;
  previewClientId?: string | null;
}

export function ClientTopbar({
  onMenuClick,
  clientName = "Client",
  clientCompany = "",
  clientAvatar,
  isPreview = false,
  previewClientId,
}: ClientTopbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    projects: any[];
    invoices: any[];
    files: any[];
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults(null);
      return;
    }

    try {
      setSearching(true);
      const [projRes, invRes, filesRes] = await Promise.all([
        fetch(`/api/portal/projects?q=${encodeURIComponent(query)}${previewClientId ? `&previewClientId=${previewClientId}` : ""}`),
        fetch(`/api/portal/invoices?q=${encodeURIComponent(query)}${previewClientId ? `&previewClientId=${previewClientId}` : ""}`),
        fetch(`/api/portal/files?q=${encodeURIComponent(query)}${previewClientId ? `&previewClientId=${previewClientId}` : ""}`),
      ]);

      const [projectsData, invoicesData, filesData] = await Promise.all([
        projRes.ok ? projRes.json() : { projects: [] },
        invRes.ok ? invRes.json() : { invoices: [] },
        filesRes.ok ? filesRes.json() : { files: [] },
      ]);

      setSearchResults({
        projects: (projectsData.projects || []).slice(0, 3),
        invoices: (invoicesData.invoices || []).slice(0, 3),
        files: (filesData.files || []).slice(0, 3),
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      style={{
        height: "64px",
        background: "var(--color-carbon, #0f1011)",
        borderBottom: "1px solid var(--color-graphite, #23252a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile Menu & Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, maxWidth: "500px" }}>
        <button
          onClick={onMenuClick}
          className="portal-mobile-toggle"
          aria-label="Open sidebar"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-fog, #8a8f98)",
            cursor: "pointer",
            display: "none",
            padding: "4px",
          }}
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div style={{ position: "relative", width: "100%" }} ref={searchRef}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--color-obsidian, #161718)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "8px",
              padding: "7px 12px",
              width: "100%",
            }}
          >
            <Search size={15} style={{ color: "var(--color-fog, #8a8f98)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects, files, invoices..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-paper, #ffffff)",
                fontSize: "13px",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                style={{ background: "transparent", border: "none", color: "var(--color-fog)", cursor: "pointer" }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "10px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
                padding: "8px",
                zIndex: 50,
                maxHeight: "360px",
                overflowY: "auto",
              }}
            >
              {searchResults.projects.length === 0 &&
              searchResults.invoices.length === 0 &&
              searchResults.files.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--color-fog)", fontSize: "12.5px" }}>
                  No matches found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--color-ash)", textTransform: "uppercase", padding: "4px 8px" }}>
                        Projects
                      </div>
                      {searchResults.projects.map((p) => (
                        <Link
                          key={p._id}
                          href={`/portal/projects/${p._id}`}
                          onClick={() => setSearchResults(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            color: "var(--color-bone)",
                            fontSize: "13px",
                            background: "transparent",
                          }}
                        >
                          <FolderGit2 size={14} style={{ color: "var(--color-pulse-green)" }} />
                          <span>{p.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.invoices.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--color-ash)", textTransform: "uppercase", padding: "4px 8px" }}>
                        Invoices
                      </div>
                      {searchResults.invoices.map((inv) => (
                        <Link
                          key={inv._id}
                          href={`/portal/invoices/${inv._id}`}
                          onClick={() => setSearchResults(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            color: "var(--color-bone)",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Receipt size={14} style={{ color: "var(--color-pulse-green)" }} />
                            <span>Invoice #{inv.invoiceNumber}</span>
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--color-fog)" }}>
                            {inv.currency || "INR"} {(inv.remainingAmount || inv.total).toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.files.length > 0 && (
                    <div>
                      <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--color-ash)", textTransform: "uppercase", padding: "4px 8px" }}>
                        Files
                      </div>
                      {searchResults.files.map((f) => (
                        <Link
                          key={f._id}
                          href="/portal/files"
                          onClick={() => setSearchResults(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            color: "var(--color-bone)",
                            fontSize: "13px",
                          }}
                        >
                          <Files size={14} style={{ color: "var(--color-pulse-green)" }} />
                          <span>{f.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, AI, Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Preview Banner if freelancer preview mode */}
        {isPreview && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              color: "#fbbf24",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <Eye size={12} />
            <span>PREVIEW MODE</span>
            <Link
              href="/dashboard"
              style={{
                marginLeft: "4px",
                color: "#fbbf24",
                textDecoration: "underline",
              }}
            >
              Exit
            </Link>
          </div>
        )}

        <ClientAssistant previewClientId={previewClientId} />

        <NotificationCenter previewClientId={previewClientId} />

        {/* Account Menu */}
        <div style={{ position: "relative" }} ref={accountRef}>
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #27a644 0%, #166534 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                overflow: "hidden",
              }}
            >
              {clientAvatar ? (
                <img
                  src={clientAvatar}
                  alt={clientName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials(clientName)
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
              }}
              className="portal-user-meta"
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-bone, #e5e5e6)",
                  lineHeight: 1.2,
                }}
              >
                {clientName}
              </span>
              {clientCompany && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-fog, #8a8f98)",
                    lineHeight: 1.2,
                  }}
                >
                  {clientCompany}
                </span>
              )}
            </div>
            <ChevronDown size={14} style={{ color: "var(--color-fog)" }} />
          </button>

          {/* Account Dropdown */}
          {accountMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "200px",
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "10px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
                padding: "6px",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--color-graphite, #23252a)",
                  marginBottom: "4px",
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-bone)" }}>
                  {clientName}
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-fog)", wordBreak: "break-all" }}>
                  {session?.user?.email}
                </div>
              </div>

              <Link
                href="/portal/settings"
                onClick={() => setAccountMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  color: "var(--color-bone)",
                  textDecoration: "none",
                }}
              >
                <Settings size={14} style={{ color: "var(--color-fog)" }} />
                <span>Account Settings</span>
              </Link>

              {session?.user?.role === "freelancer" && (
                <Link
                  href="/dashboard"
                  onClick={() => setAccountMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "var(--color-pulse-green, #27a644)",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Freelancer Dashboard</span>
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  color: "#ef4444",
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
