"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Files, Search, Filter } from "lucide-react";
import { FileList } from "@/components/portal/FileList";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";
import type { ProjectFile } from "@/types/portal";

function ClientFilesContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const url = `/api/portal/files?category=${category}&q=${encodeURIComponent(search)}${
        previewClientId ? `&previewClientId=${previewClientId}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [category, search, previewClientId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
          Project Files & Assets
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          Access all brand guidelines, deliverables, design files, and documents shared with you.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {[
            { id: "all", label: "All Files" },
            { id: "deliverable", label: "Deliverables" },
            { id: "asset", label: "Assets" },
            { id: "guidelines", label: "Guidelines" },
            { id: "contract", label: "Contracts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: category === tab.id ? 600 : 500,
                background:
                  category === tab.id
                    ? "var(--color-obsidian, #161718)"
                    : "transparent",
                border:
                  category === tab.id
                    ? "1px solid var(--color-graphite, #23252a)"
                    : "1px solid transparent",
                color:
                  category === tab.id
                    ? "var(--color-pulse-green, #27a644)"
                    : "var(--color-fog, #8a8f98)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--color-obsidian, #161718)",
            border: "1px solid var(--color-graphite, #23252a)",
            borderRadius: "8px",
            padding: "7px 12px",
            minWidth: "240px",
          }}
        >
          <Search size={14} style={{ color: "var(--color-fog, #8a8f98)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-paper, #ffffff)",
              fontSize: "13px",
              width: "100%",
            }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="280px" borderRadius="12px" />
      ) : (
        <FileList files={files} onFileUploaded={fetchFiles} previewClientId={previewClientId} />
      )}
    </div>
  );
}

export default function ClientFilesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="280px" borderRadius="12px" />}>
      <ClientFilesContent />
    </Suspense>
  );
}
