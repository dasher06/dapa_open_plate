import React, { useState } from "react";
import {
  Check,
  Copy,
  Hash,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  FileCheck,
  Loader2,
} from "lucide-react";
import { ProcessingStatus } from "../types/plate";

interface ResultCardProps {
  id?: string;
  rawName: string;
  generatedName?: string;
  file?: File;
  status?: ProcessingStatus;
  error?: string;
  onClear?: () => void;
  onRetry?: () => void;
  onProcess?: () => void;
  onDownload?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  id,
  rawName,
  generatedName = "",
  file,
  status = "success",
  error,
  onClear,
  onRetry,
  onProcess,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!generatedName) return;
    try {
      await navigator.clipboard.writeText(generatedName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback using textarea
      try {
        const textArea = document.createElement("textarea");
        textArea.value = generatedName;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // failed
      }
    }
  };

  const handleCopyUuid = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    } catch {
      // fallback
    }
  };

  const triggerDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    if (!file) {
      setDownloadError("Original file contents not in session memory. Re-select the file to download a copy.");
      setTimeout(() => setDownloadError(null), 4000);
      return;
    }

    if (!generatedName) return;

    try {
      const blob = new Blob([file], { type: file.type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = generatedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setDownloadError(null);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed. Please try again.";
      setDownloadError(msg);
      setTimeout(() => setDownloadError(null), 4000);
    }
  };

  // Extract base and extension for structured inspection safely
  const safeGeneratedName = typeof generatedName === "string" ? generatedName : "";
  const dotIndex = safeGeneratedName.lastIndexOf(".");
  const baseName = dotIndex >= 0 ? safeGeneratedName.substring(0, dotIndex) : safeGeneratedName;
  const extension = dotIndex >= 0 ? safeGeneratedName.substring(dotIndex + 1) : "";
  const segments = baseName ? baseName.split("_") : [];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "760px",
        marginTop: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "var(--glass-backdrop)",
        WebkitBackdropFilter: "var(--glass-backdrop)",
        border: `1px solid ${status === "error" ? "var(--status-error-border)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "20px 22px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header with status badge & controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {status === "success" && (
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--status-success-bg)",
                border: "1px solid var(--status-success-border)",
                borderRadius: "14px",
                color: "var(--status-success-text)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FileCheck size={13} />
              <span>Standardized</span>
            </div>
          )}

          {status === "processing" && (
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--status-info-bg)",
                border: "1px solid var(--status-info-border)",
                borderRadius: "14px",
                color: "var(--status-info-text)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Loader2 size={13} className="animate-spin" />
              <span>Processing...</span>
            </div>
          )}

          {status === "ready" && (
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--bg-surface-subtle)",
                border: "1px solid var(--border-default)",
                borderRadius: "14px",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FileText size={13} />
              <span>Ready to standardize</span>
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--status-error-bg)",
                border: "1px solid var(--status-error-border)",
                borderRadius: "14px",
                color: "var(--status-error-text)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <AlertCircle size={13} />
              <span>Standardization Failed</span>
            </div>
          )}

          {id && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Saved in SQLite
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {status === "ready" && onProcess && (
            <button
              onClick={onProcess}
              style={{
                padding: "5px 12px",
                backgroundColor: "var(--bg-button)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-sm)",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Standardize
            </button>
          )}

          {status === "error" && onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: "5px 12px",
                backgroundColor: "var(--status-error-bg)",
                border: "1px solid var(--status-error-border)",
                color: "var(--status-error-text)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              style={{
                padding: "4px 6px",
                color: "var(--text-muted)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title="Remove from list"
              aria-label="Remove item"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Filename Display / Actions */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
            {status === "success" ? "Standardized filename:" : "Original filename:"}
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            Input: <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{rawName}</code>
          </span>
        </div>

        {status === "success" && generatedName ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "var(--bg-surface-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "15.5px",
                fontWeight: 600,
                color: "var(--text-primary)",
                wordBreak: "break-all",
                letterSpacing: "-0.01em",
              }}
            >
              {generatedName}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: "7px 12px",
                  backgroundColor: copied ? "var(--status-success-bg)" : "#FFFFFF",
                  border: copied ? "1px solid var(--status-success-border)" : "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  color: copied ? "var(--status-success-text)" : "var(--text-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                aria-label="Copy standardized filename"
              >
                {copied ? (
                  <>
                    <Check size={13} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={triggerDownload}
                style={{
                  padding: "7px 12px",
                  backgroundColor: downloadSuccess ? "var(--status-success-bg)" : "var(--bg-button)",
                  border: downloadSuccess ? "1px solid var(--status-success-border)" : "1px solid var(--bg-button)",
                  borderRadius: "var(--radius-sm)",
                  color: downloadSuccess ? "var(--status-success-text)" : "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                title={file ? "Download renamed copy" : "Download file copy"}
                aria-label="Download renamed file"
              >
                {downloadSuccess ? (
                  <>
                    <Check size={13} />
                    <span>Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--bg-surface-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              color: status === "error" ? "var(--status-error-text)" : "var(--text-secondary)",
            }}
          >
            {status === "error" ? error || "Error occurred during filename standardization" : rawName}
          </div>
        )}

        {/* Download notification / errors */}
        {downloadError && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              backgroundColor: "var(--status-error-bg)",
              border: "1px solid var(--status-error-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--status-error-text)",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            <span>{downloadError}</span>
          </div>
        )}
      </div>

      {/* Segment Breakdown - Updated for DDMMYY and NO dapa prefix */}
      {status === "success" && segments.length >= 2 && (
        <div
          style={{
            backgroundColor: "rgba(248, 250, 252, 0.8)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            Decoded Standard Segments
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            {segments.slice(0, -2).map((seg, idx) => (
              <span
                key={idx}
                style={{
                  padding: "3px 8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-default)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
                title={`Normalized token ${idx + 1}`}
              >
                token: <strong>{seg}</strong>
              </span>
            ))}

            <span
              style={{
                padding: "3px 8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
                color: "var(--accent-blue)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
              title="Language code"
            >
              lang: <strong>{segments[segments.length - 2]}</strong>
            </span>

            <span
              style={{
                padding: "3px 8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
                color: "var(--accent-teal)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
              title="Date code (DDMMYY format)"
            >
              date: <strong>{segments[segments.length - 1]}</strong>
            </span>

            <span
              style={{
                padding: "3px 8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
              title={extension === "NAKF" ? "NAKF fallback for extensionless file" : `Preserved .${extension}`}
            >
              ext: <strong>.{extension}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Details Footer: Clarification on copies & UUID */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          paddingTop: "6px",
          fontSize: "11.5px",
          color: "var(--text-secondary)",
        }}
      >
        <div>
          <span>Downloads create a renamed copy; original files on disk remain unchanged.</span>
        </div>

        {id && typeof id === "string" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>Record ID:</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
              title={id}
            >
              {id.length > 12 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id}
            </span>
            <button
              onClick={handleCopyUuid}
              style={{
                padding: "2px 4px",
                color: copiedUuid ? "var(--status-success-text)" : "var(--text-muted)",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              title="Copy Record UUID"
              aria-label="Copy Record UUID"
            >
              {copiedUuid ? <Check size={12} /> : <Hash size={12} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
