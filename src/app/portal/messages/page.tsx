"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FolderGit2, MessageSquare, Sparkles } from "lucide-react";
import { MessageThread } from "@/components/portal/MessageThread";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";

function ClientMessagesContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const initialProjectId = searchParams.get("project");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const [loading, setLoading] = useState(true);
  const [freelancerInfo, setFreelancerInfo] = useState<{ name: string; avatar?: string }>({
    name: "Freelancer",
  });
  const [clientInfo, setClientInfo] = useState<{ name: string; avatar?: string }>({
    name: "Client",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projRes, setRes] = await Promise.all([
          fetch(
            `/api/portal/projects${
              previewClientId ? `?previewClientId=${previewClientId}` : ""
            }`
          ),
          fetch(
            `/api/portal/settings${
              previewClientId ? `?previewClientId=${previewClientId}` : ""
            }`
          ),
        ]);

        const projData = projRes.ok ? await projRes.json() : { projects: [] };
        const setData = setRes.ok ? await setRes.json() : {};

        const projectList = projData.projects || [];
        setProjects(projectList);

        if (!selectedProjectId && projectList.length > 0) {
          setSelectedProjectId(projectList[0]._id);
        }

        if (setData.client) {
          setClientInfo({ name: setData.client.name, avatar: setData.client.avatar });
        }
        if (setData.freelancer) {
          setFreelancerInfo({ name: setData.freelancer.name, avatar: setData.freelancer.avatar });
        }
      } catch (err) {
        console.error("Failed to load messages hub:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [previewClientId]);

  const selectedProject = projects.find((p) => p._id === selectedProjectId) || projects[0] || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-paper, #ffffff)",
            letterSpacing: "-0.5px",
            margin: "0 0 4px 0",
          }}
        >
          Messages
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          Direct project communication with your freelancer.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton height="500px" borderRadius="12px" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: projects.length > 0 ? "280px 1fr" : "1fr",
            gap: "20px",
            minHeight: "560px",
          }}
          className="portal-messages-layout"
        >
          {/* Projects Channel List (when projects exist) */}
          {projects.length > 0 && (
            <div
              style={{
                background: "var(--color-carbon, #0f1011)",
                border: "1px solid var(--color-graphite, #23252a)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-ash, #62666d)",
                  textTransform: "uppercase",
                  padding: "4px 8px",
                }}
              >
                Project Threads
              </div>

              {projects.map((p) => {
                const isSelected = selectedProject?._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedProjectId(p._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: isSelected
                        ? "var(--color-obsidian, #161718)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid var(--color-graphite, #23252a)"
                        : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <FolderGit2
                      size={16}
                      style={{
                        color: isSelected
                          ? "var(--color-pulse-green, #27a644)"
                          : "var(--color-fog, #8a8f98)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? "#ffffff" : "var(--color-bone, #e5e5e6)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.title}
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-fog, #8a8f98)",
                          textTransform: "capitalize",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Chat Thread */}
          <div>
            <MessageThread
              key={`${selectedProject?._id || "direct"}-${previewClientId || ""}`}
              projectId={selectedProject?._id || ""}
              projectName={selectedProject?.title || "Direct Communication"}
              freelancerName={freelancerInfo.name}
              freelancerAvatar={freelancerInfo.avatar}
              clientName={clientInfo.name}
              clientAvatar={clientInfo.avatar}
              previewClientId={previewClientId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="500px" borderRadius="12px" />}>
      <ClientMessagesContent />
    </Suspense>
  );
}
