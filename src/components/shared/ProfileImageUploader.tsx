"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  DragEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { Camera, Upload, Trash2, RefreshCw, Loader2, AlertCircle, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_LABEL = "PNG, JPG or WEBP • Max 5MB";

/* ─────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────── */
interface ProfileImageUploaderProps {
  /** Current stored photo URL (from the profile). Can be "" or undefined. */
  currentUrl?: string;
  /** Called with the new publicly accessible URL after a successful upload. */
  onUploadComplete: (url: string) => void;
  /** Called when the user removes the photo. */
  onRemove: () => void;
}

/* ─────────────────────────────────────────────────────────────────
   Upload state machine
───────────────────────────────────────────────────────────────── */
type UploadStatus = "idle" | "uploading" | "success" | "error";

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export default function ProfileImageUploader({
  currentUrl,
  onUploadComplete,
  onRemove,
}: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewSrc, setPreviewSrc] = useState<string>(currentUrl || "");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync preview when parent passes a new URL (e.g. after profile load)
  useEffect(() => {
    if (currentUrl !== undefined) {
      setPreviewSrc(currentUrl);
    }
  }, [currentUrl]);

  /* ── Validation ───────────────────────────────────────────── */
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type "${file.type.split("/")[1].toUpperCase()}". Please upload a PNG, JPG, or WEBP image.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `File is too large (${mb} MB). Maximum allowed size is 5 MB.`;
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

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Simulate progress ticks while uploading
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

      // Revoke local object URL — we now have a real URL
      URL.revokeObjectURL(objectUrl);
      setPreviewSrc(data.url);
      onUploadComplete(data.url);
    } catch (err) {
      clearInterval(progressInterval);
      URL.revokeObjectURL(objectUrl);
      setPreviewSrc(currentUrl || "");
      setUploadStatus("error");
      setValidationError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploadProgress(0);
    }
  }

  /* ── Input change ─────────────────────────────────────────── */
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  }

  /* ── Drag & Drop ──────────────────────────────────────────── */
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

  /* ── Keyboard accessibility on drop zone ─────────────────── */
  function handleDropZoneKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }

  /* ── Remove ───────────────────────────────────────────────── */
  function handleRemove() {
    setPreviewSrc("");
    setUploadStatus("idle");
    setValidationError("");
    setUploadProgress(0);
    onRemove();
  }

  /* ── Derived state ────────────────────────────────────────── */
  const hasImage = !!previewSrc && uploadStatus !== "error";
  const isUploading = uploadStatus === "uploading";
  const isError = uploadStatus === "error";

  /* ────────────────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Label ───────────────────────────────────────────── */}
      <label
        style={{
          fontSize: "11.5px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Profile Photo
      </label>

      {/* ── Main uploader card ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* ── Avatar circle ─────────────────────────────────── */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              overflow: "hidden",
              border: hasImage
                ? "2px solid var(--color-brand)"
                : "2px dashed var(--border-strong)",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "border-color 180ms ease",
              boxShadow: hasImage
                ? "0 0 0 4px var(--color-brand-subtle)"
                : "none",
            }}
          >
            {/* Preview image */}
            {hasImage && (
              <img
                src={previewSrc}
                alt="Profile photo preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={() => {
                  setPreviewSrc("");
                }}
              />
            )}

            {/* Empty state icon */}
            {!hasImage && !isUploading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-muted)",
                }}
              >
                <ImageOff size={24} strokeWidth={1.5} />
              </div>
            )}

            {/* Upload spinner overlay */}
            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  borderRadius: "50%",
                }}
              >
                <Loader2
                  size={22}
                  color="var(--color-brand)"
                  style={{ animation: "spin 0.85s linear infinite" }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Camera badge — quick upload trigger */}
          {!isUploading && (
            <button
              type="button"
              aria-label="Upload profile photo"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--surface-1)",
                border: "1.5px solid var(--border-strong)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--color-brand)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-on-brand)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-brand)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-1)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
              }}
            >
              <Camera size={13} />
            </button>
          )}
        </div>

        {/* ── Right panel: Drop zone + actions ──────────────── */}
        <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag and drop an image here, or press Enter to browse files"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={handleDropZoneKeyDown}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${isDragging ? "var(--color-brand)" : isError ? "var(--color-coral-red)" : "var(--border-strong)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              background: isDragging
                ? "var(--color-brand-subtle)"
                : isError
                ? "rgba(235, 87, 87, 0.04)"
                : "var(--surface-2)",
              cursor: isUploading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              textAlign: "center",
              transition: "border-color 150ms ease, background 150ms ease",
              outline: "none",
            }}
          >
            {isError ? (
              <AlertCircle size={18} color="var(--color-coral-red)" />
            ) : isUploading ? (
              <Loader2
                size={18}
                color="var(--color-brand)"
                style={{ animation: "spin 0.85s linear infinite" }}
              />
            ) : (
              <Upload
                size={18}
                color={isDragging ? "var(--color-brand)" : "var(--text-muted)"}
                strokeWidth={1.5}
              />
            )}

            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isError
                  ? "var(--color-coral-red)"
                  : isDragging
                  ? "var(--color-brand)"
                  : isUploading
                  ? "var(--text-secondary)"
                  : "var(--text-secondary)",
              }}
            >
              {isUploading
                ? "Uploading..."
                : isDragging
                ? "Drop to upload"
                : hasImage
                ? "Drop a new image to replace"
                : "Drag & drop or click to upload"}
            </span>

            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {ALLOWED_LABEL}
            </span>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div
              style={{
                height: "3px",
                background: "var(--border)",
                borderRadius: "99px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${uploadProgress}%`,
                  background: "var(--color-brand)",
                  borderRadius: "99px",
                  transition: "width 150ms ease",
                }}
              />
            </div>
          )}

          {/* Validation / error message */}
          {validationError && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
                background: "rgba(235, 87, 87, 0.08)",
                border: "1px solid rgba(235, 87, 87, 0.25)",
                borderRadius: "var(--radius)",
                padding: "8px 10px",
              }}
            >
              <AlertCircle
                size={13}
                color="var(--color-coral-red)"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <span
                style={{
                  fontSize: "11.5px",
                  color: "var(--color-coral-red)",
                  lineHeight: "1.5",
                }}
              >
                {validationError}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!hasImage ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={12} />}
              >
                Upload Photo
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<RefreshCw size={12} />}
                >
                  Replace Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={handleRemove}
                  leftIcon={<Trash2 size={12} />}
                  style={{ color: "var(--color-coral-red)" }}
                >
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

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
