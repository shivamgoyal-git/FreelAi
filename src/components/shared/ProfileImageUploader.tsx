"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import { Pencil, Loader2, AlertCircle, User } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ─────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────── */
interface ProfileImageUploaderProps {
  /** Current stored photo URL (from the profile). Can be "" or undefined. */
  currentUrl?: string;
  /** Called with the new publicly accessible URL after a successful upload. */
  onUploadComplete: (url: string) => void;
  /** Called when the user removes the photo. */
  onRemove?: () => void;
  size?: number;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function ProfileImageUploader({
  currentUrl,
  onUploadComplete,
  onRemove,
  size = 110,
}: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewSrc, setPreviewSrc] = useState<string>(currentUrl || "");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync preview when parent passes a new URL
  useEffect(() => {
    if (currentUrl !== undefined) {
      setPreviewSrc(currentUrl);
    }
  }, [currentUrl]);

  /* ── Validation ───────────────────────────────────────────── */
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Please upload a PNG, JPG, or WEBP image.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `File is too large (${mb} MB). Max allowed size is 5 MB.`;
    }
    return null;
  }

  /* ── Upload handler ───────────────────────────────────────── */
  async function handleFile(file: File) {
    setValidationError("");

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setUploadStatus("error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 12, 85));
    }, 100);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      const data = await res.json();
      setUploadProgress(100);
      setUploadStatus("success");

      URL.revokeObjectURL(objectUrl);
      setPreviewSrc(data.url);
      onUploadComplete(data.url);
    } catch (err) {
      clearInterval(progressInterval);
      URL.revokeObjectURL(objectUrl);
      setPreviewSrc(currentUrl || "");
      setUploadStatus("error");
      setValidationError(err instanceof Error ? err.message : "Upload failed.");
      setUploadProgress(0);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUrl]
  );

  const hasImage = !!previewSrc && uploadStatus !== "error";
  const isUploading = uploadStatus === "uploading";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      {/* ── Circular Profile Photo with Hover Pencil Overlay ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Change profile picture"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          position: "relative",
          cursor: isUploading ? "wait" : "pointer",
          overflow: "hidden",
          border: isDragging
            ? "2.5px dashed var(--color-brand, #22c55e)"
            : hasImage
            ? "2.5px solid var(--border-strong, #3f3f46)"
            : "2px dashed var(--border-strong, #3f3f46)",
          background: "var(--surface-2, #18181b)",
          boxShadow: hasImage ? "0 4px 20px rgba(0, 0, 0, 0.35)" : "none",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Photo preview */}
        {hasImage ? (
          <img
            src={previewSrc}
            alt="Profile photo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={() => setPreviewSrc("")}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted, #71717a)",
              gap: "4px",
            }}
          >
            <User size={size * 0.4} strokeWidth={1.5} />
          </div>
        )}

        {/* Hover Pencil Overlay */}
        {!isUploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: isHovered || isDragging ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              }}
            >
              <Pencil size={18} strokeWidth={2.2} />
            </div>
          </div>
        )}

        {/* Uploading progress spinner overlay */}
        {isUploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Loader2
              size={24}
              color="var(--color-brand, #22c55e)"
              style={{ animation: "spin 0.85s linear infinite" }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--color-brand, #22c55e)",
                letterSpacing: "0.05em",
              }}
            >
              {uploadProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Validation / error message */}
      {validationError && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--color-danger, #ef4444)",
            fontSize: "11px",
            maxWidth: "160px",
            textAlign: "center",
          }}
        >
          <AlertCircle size={12} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
