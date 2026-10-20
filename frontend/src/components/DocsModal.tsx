import { X } from "lucide-react";

interface DocsModalProps {
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(16, 36, 58, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          color: "var(--text-primary)",
          width: "100%",
          maxWidth: "780px",
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          border: "1px solid var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "var(--bg-surface-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "6px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close docs modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <img
            src="/logo.png"
            alt="Open Plate logo"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
              Open Plate Documentation
            </h2>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Universal File Naming Specification &amp; Workflow Guide
            </div>
          </div>
        </div>

        {/* Section: Standard Filename Format */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            Standard Filename Format
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>
            Open Plate creates standardized, human-readable, and machine-parsable filenames for documents, images, and data files. Newly generated filenames omit legacy platform prefixes:
          </p>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--bg-surface-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "13.5px",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            <code>{"<place>_<persona>[_<purpose>][_extras...]_<language>_<date>.<extension>"}</code>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Example: <code>bank_statement.pdf</code> → <strong><code>bank_sttm_usen_201026.pdf</code></strong>
          </div>
        </section>

        {/* Section: Date Code (DDMMYY) */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            Deterministic DDMMYY Date Coding
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>
            The timestamp segment uses the standardized <strong>DDMMYY</strong> format:
          </p>
          <ul style={{ paddingLeft: "20px", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <li><strong>DD</strong>: 2-digit day of the month (e.g. <code>20</code> for 20th, <code>05</code> for 5th).</li>
            <li><strong>MM</strong>: 2-digit month (e.g. <code>10</code> for October, <code>01</code> for January).</li>
            <li><strong>YY</strong>: 2-digit year (e.g. <code>26</code> for 2026).</li>
            <li>For 20 October 2026, the generated date code is <strong><code>201026</code></strong>.</li>
          </ul>
        </section>

        {/* Section: Prefix Removal & Extension Fallback */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            No Platform Prefix &amp; NAKF Extension Fallback
          </h3>
          <ul style={{ paddingLeft: "20px", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <li>
              <strong>No `dapa` prefix</strong>: Newly generated filenames start immediately with the normalized content tokens (e.g. <code>unit_2_usen_201026.pdf</code>).
            </li>
            <li>
              <strong>Extension preservation</strong>: File extensions like <code>.pdf</code>, <code>.png</code>, <code>.jpg</code>, <code>.csv</code>, and <code>.xlsx</code> are converted to lowercase and preserved.
            </li>
            <li>
              <strong>NAKF fallback</strong>: Files without an extension fallback to the standard <code>.NAKF</code> extension (e.g. <code>notes</code> → <code>nts_usen_201026.NAKF</code>).
            </li>
          </ul>
        </section>

        {/* Section: File Selection, Drag-and-Drop, and Individual Downloads */}
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            File Selection &amp; Individual File Downloads
          </h3>
          <ul style={{ paddingLeft: "20px", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <li>
              <strong>Choose or drag-and-drop</strong>: Select actual files from your computer. You can process them individually or together.
            </li>
            <li>
              <strong>Independent results &amp; export</strong>: Every file maintains its own card, status, copy action, and download action.
            </li>
            <li>
              <strong>Real browser downloads</strong>: Clicking "Download" exports a renamed copy with the standardized name and original file contents preserved.
            </li>
            <li>
              <strong>Original files remain unchanged</strong>: Browser downloads create copies in your download folder. Your original files on disk are never altered or deleted.
            </li>
          </ul>
        </section>

        {/* Section: Common Errors & Troubleshooting */}
        <section style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            Common Errors &amp; Troubleshooting
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--bg-surface-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>
                Empty or whitespace-only filename (HTTP 400)
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                Filename input cannot be blank or contain only whitespace. Provide a valid name or file.
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--bg-surface-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>
                Backend connection error
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                Occurs if the Open Plate API server is not running on port 3000. Check the backend process and retry.
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--bg-surface-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>
                Missing file contents during download
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                If a filename was manually entered without choosing a file from disk, the browser cannot download contents. Re-select the physical file to download a renamed copy.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocsModal;
