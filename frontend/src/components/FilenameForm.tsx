import React, { useState, useRef } from "react";
import { ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface FilenameFormProps {
  onSubmit: (fileName: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

const EXAMPLE_FILENAMES = [
  "train_ticket.pdf",
  "bus_ticket.pdf",
  "flight_ticket.pdf",
  "bank_statement.pdf",
  "cinema_ticket.png",
  "project_notes",
  "google chrome passwords.csv",
];

export const FilenameForm: React.FC<FilenameFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setValidationError("Please enter a filename to standardize.");
      inputRef.current?.focus();
      return;
    }

    // Check for obviously invalid filename characters that filesystem APIs reject
    if (/[/\\?%*:|"<>]/g.test(trimmed)) {
      setValidationError("Filename contains invalid characters (/ \\ ? % * : | \" < >). Please remove them.");
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    onClearError();
    await onSubmit(trimmed);
  };

  const handleChipClick = (example: string) => {
    setInputVal(example);
    setValidationError(null);
    onClearError();
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
    if (errorMessage) {
      onClearError();
    }
  };

  const activeError = validationError || errorMessage;

  return (
    <div style={{ width: "100%", maxWidth: "760px" }}>
      {/* Workspace Headline */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            backgroundColor: "var(--accent-cyan-light)",
            borderRadius: "16px",
            color: "var(--accent-cyan)",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          <Sparkles size={13} />
          <span>Precision Universal Naming Standard</span>
        </div>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            marginBottom: "8px",
          }}
        >
          Standardize File Names Deterministically
        </h1>
        <p
          style={{
            fontSize: "14.5px",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: "1.5",
          }}
        >
          Generate standardized, collision-free names using place, persona, purpose, and DDMMYY date encoding.
        </p>
      </div>

      {/* Main Input Form Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "var(--glass-backdrop)",
          WebkitBackdropFilter: "var(--glass-backdrop)",
          border: `1px solid ${activeError ? "var(--status-error-border)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "8px 8px 8px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: activeError ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : "var(--shadow-md)",
          transition: "all 0.2s ease",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          placeholder="Enter a filename, e.g. bank_statement.pdf"
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            fontSize: "15px",
            fontFamily: "var(--font-sans)",
            color: "var(--text-primary)",
          }}
          aria-label="Filename to standardize"
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 18px",
            backgroundColor: isLoading ? "var(--text-muted)" : "var(--bg-button)",
            color: "#FFFFFF",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "13.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "var(--bg-button-hover)";
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "var(--bg-button)";
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Standardizing...</span>
            </>
          ) : (
            <>
              <span>Standardize filename</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Error Message Display */}
      {activeError && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 14px",
            backgroundColor: "var(--status-error-bg)",
            border: "1px solid var(--status-error-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--status-error-text)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{activeError}</span>
        </div>
      )}

      {/* Example Chips */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: 500,
            marginRight: "4px",
          }}
        >
          Examples:
        </span>
        {EXAMPLE_FILENAMES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleChipClick(ex)}
            style={{
              padding: "4px 10px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid var(--border-default)",
              borderRadius: "14px",
              fontSize: "12px",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-focus)";
              e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilenameForm;
