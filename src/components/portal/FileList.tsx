"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Plus,
  Upload,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProjectFile } from "@/types/portal";

interface FileListProps {
  files: ProjectFile[];
  projectId?: string;
  onFileUploaded?: () => void;
  previewClientId?: string | null;
}

export function FileList({
  files,
  projectId,
  onFileUploaded,
  previewClientId,
}: FileListProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState<string>("asset");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("image") || type.includes("png") || type.includes("jpg")) {
      return <ImageIcon size={18} style={{ color: "#38bdf8" }} />;
    }
    if (type.includes("pdf") || type.includes("doc")) {
      return <FileText size={18} style={{ color: "#f87171" }} />;
    }
    if (type.includes("figma") || type.includes("design")) {
      return <FileCode size={18} style={{ color: "#a78bfa" }} />;
    }
    return <FileText size={18} style={{ color: "var(--color-pulse-green, #27a644)" }} />;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !fileName.trim() || !fileUrl.trim()) {
      setError("Please provide a file name and URL/link.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const res = await fetch("/api/portal/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: fileName.trim(),
          url: fileUrl.trim(),
          category,
          previewClientId,
        }),
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setFileName("");
        setFileUrl("");
        if (onFileUploaded) onFileUploaded();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload file");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {projectId && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} />
              <span>Share File with Freelancer</span>
            </Button>
          </div>
        )}

        {files.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--color-carbon, #0f1011)",
              border: "1px dashed var(--color-graphite, #23252a)",
              borderRadius: "12px",
              color: "var(--color-fog, #8a8f98)",
              fontSize: "13.5px",
            }}
          >
            No files available for this project yet.
          </div>
        ) : (
          <div
            style={{
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--color-graphite, #23252a)",
                      background: "var(--color-obsidian, #161718)",
                    }}
                  >
                    <th style={{ padding: "12px 16px", fontSize: "11.5px", fontWeight: 600, color: "var(--color-fog)" }}>
                      File Name
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11.5px", fontWeight: 600, color: "var(--color-fog)" }}>
                      Category
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11.5px", fontWeight: 600, color: "var(--color-fog)" }}>
                      Uploaded By
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11.5px", fontWeight: 600, color: "var(--color-fog)" }}>
                      Date
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11.5px", fontWeight: 600, color: "var(--color-fog)", textAlign: "right" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file._id}
                      style={{
                        borderBottom: "1px solid var(--color-graphite, #23252a)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              background: "var(--color-obsidian, #161718)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {getFileIcon(file.fileType || file.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--color-bone, #e5e5e6)" }}>
                              {file.name}
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--color-fog, #8a8f98)" }}>
                              {file.size || "1.2 MB"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "var(--color-obsidian, #161718)",
                            color: "var(--color-fog, #8a8f98)",
                            textTransform: "capitalize",
                          }}
                        >
                          {file.category}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", fontSize: "12.5px", color: "var(--color-bone, #e5e5e6)" }}>
                        {file.uploadedBy === "freelancer" ? "Freelancer" : file.uploaderName || "You"}
                      </td>

                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--color-fog, #8a8f98)" }}>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          <Button variant="secondary" size="sm" style={{ padding: "4px 10px", fontSize: "12px" }}>
                            <Download size={13} style={{ marginRight: "4px" }} />
                            <span>Download</span>
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {uploadModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "var(--color-carbon, #0f1011)",
              border: "1px solid var(--color-graphite, #23252a)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }}>
                Share File / Asset
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--color-fog)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "6px", fontSize: "12.5px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "var(--color-bone)", marginBottom: "6px" }}>
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Brand Guidelines.pdf"
                  required
                  style={{
                    width: "100%",
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-graphite)",
                    borderRadius: "6px",
                    padding: "9px 12px",
                    color: "var(--color-paper)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "var(--color-bone)", marginBottom: "6px" }}>
                  File URL or Cloud Link (Google Drive, Dropbox, Figma)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                  style={{
                    width: "100%",
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-graphite)",
                    borderRadius: "6px",
                    padding: "9px 12px",
                    color: "var(--color-paper)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "var(--color-bone)", marginBottom: "6px" }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-graphite)",
                    borderRadius: "6px",
                    padding: "9px 12px",
                    color: "var(--color-paper)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                >
                  <option value="asset">Asset / Resource</option>
                  <option value="guidelines">Brand Guidelines</option>
                  <option value="contract">Contract / Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={uploading}>
                  {uploading ? "Sharing..." : "Share File"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
