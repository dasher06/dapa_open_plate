import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { FilenameForm } from "./components/FilenameForm";
import { ResultCard } from "./components/ResultCard";
import { FileUploader } from "./components/FileUploader";
import { DocsModal } from "./components/DocsModal";
import { createPlate, ApiError } from "./services/api";
import { SessionPlateRecord, SelectedFileItem } from "./types/plate";
import { Play, CheckCheck, AlertCircle } from "lucide-react";

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentRecords, setRecentRecords] = useState<SessionPlateRecord[]>([]);
  const [currentManualResult, setCurrentManualResult] = useState<SessionPlateRecord | null>(null);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualErrorMessage, setManualErrorMessage] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  // Selected files with individual state tracking
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [isProcessingAny, setIsProcessingAny] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Single Manual Filename Standardization
  // ---------------------------------------------------------------------------
  const handleSubmitFilename = async (fileName: string) => {
    setIsManualLoading(true);
    setManualErrorMessage(null);

    try {
      const response = await createPlate(fileName);
      const newRecord: SessionPlateRecord = {
        id: response.id,
        rawName: fileName,
        generatedName: response.generatedName,
        createdAt: new Date().toISOString(),
      };
      setCurrentManualResult(newRecord);
      setRecentRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400) {
          setManualErrorMessage(err.message || "Invalid filename. Please provide a valid file name.");
        } else if (err.statusCode === 404) {
          setManualErrorMessage("Requested resource was not found.");
        } else if (err.statusCode === 500) {
          setManualErrorMessage("Server error while standardizing filename. Please retry.");
        } else {
          setManualErrorMessage(err.message);
        }
      } else if (err instanceof Error) {
        setManualErrorMessage(err.message);
      } else {
        setManualErrorMessage("An unexpected error occurred while communicating with the server.");
      }
    } finally {
      setIsManualLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Adding Files via Selector or Drag & Drop
  // ---------------------------------------------------------------------------
  const handleAddFiles = (files: File[]) => {
    if (!files || !Array.isArray(files)) return;
    setDuplicateWarning(null);
    const duplicates: string[] = [];
    const newItems: SelectedFileItem[] = [];

    files.forEach((file) => {
      if (!file || typeof file.name !== "string") return;
      const fileName = file.name;
      const fileSize = typeof file.size === "number" ? file.size : undefined;

      // Check if file is already present
      const isDuplicate = selectedFiles.some(
        (item) => item.rawName === fileName && (fileSize === undefined || item.file?.size === fileSize)
      );

      if (isDuplicate) {
        duplicates.push(fileName);
      } else {
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          rawName: fileName,
          status: "ready",
        });
      }
    });

    if (duplicates.length > 0) {
      setDuplicateWarning(
        `Skipped ${duplicates.length} duplicate file${duplicates.length > 1 ? "s" : ""}: ${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? "..." : ""}`
      );
      setTimeout(() => setDuplicateWarning(null), 5000);
    }

    if (newItems.length > 0) {
      setSelectedFiles((prev) => [...newItems, ...prev]);
    }
  };

  const handleRemoveFile = (itemId: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== itemId));
  };

  // ---------------------------------------------------------------------------
  // Individual File Standardization
  // ---------------------------------------------------------------------------
  const processSingleFile = async (item: SelectedFileItem) => {
    // Set status to processing
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "processing", error: undefined } : f))
    );

    try {
      const response = await createPlate(item.rawName);

      const newRecord: SessionPlateRecord = {
        id: response.id,
        rawName: item.rawName,
        generatedName: response.generatedName,
        createdAt: new Date().toISOString(),
      };

      // Add to session history
      setRecentRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);

      // Update file result item
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "success",
                generatedName: response.generatedName,
                recordId: response.id,
              }
            : f
        )
      );
    } catch (err: unknown) {
      let friendlyError = "Failed to standardize file.";
      if (err instanceof ApiError) {
        if (err.statusCode === 400) {
          friendlyError = err.message || "Invalid filename.";
        } else if (err.statusCode === 500) {
          friendlyError = "Server error occurred. Please try again.";
        } else {
          friendlyError = err.message;
        }
      } else if (err instanceof Error) {
        friendlyError = err.message;
      }

      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "error",
                error: friendlyError,
              }
            : f
        )
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Optional Batch Process (Standardize All Unprocessed)
  // ---------------------------------------------------------------------------
  const handleStandardizeRemaining = async () => {
    const uncompleted = selectedFiles.filter((f) => f.status === "ready" || f.status === "error");
    if (uncompleted.length === 0) return;

    setIsProcessingAny(true);
    for (const item of uncompleted) {
      await processSingleFile(item);
    }
    setIsProcessingAny(false);
  };

  // ---------------------------------------------------------------------------
  // Select from Session History
  // ---------------------------------------------------------------------------
  const handleSelectRecord = (record: SessionPlateRecord) => {
    setCurrentManualResult(record);
    setManualErrorMessage(null);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const readyOrErrorCount = selectedFiles.filter((f) => f.status === "ready" || f.status === "error").length;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        recentRecords={recentRecords}
        onSelectRecord={handleSelectRecord}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} onOpenDocs={() => setShowDocs(true)} />

        <main className="workspace-area">
          {/* Filename Input Form */}
          <FilenameForm
            onSubmit={handleSubmitFilename}
            isLoading={isManualLoading}
            errorMessage={manualErrorMessage}
            onClearError={() => setManualErrorMessage(null)}
          />

          {/* File Selection & Drag-and-Drop Area */}
          <FileUploader onAddFiles={handleAddFiles} disabled={isProcessingAny} />

          {/* Duplicate warning notification */}
          {duplicateWarning && (
            <div
              style={{
                width: "100%",
                maxWidth: "760px",
                marginTop: "12px",
                padding: "10px 14px",
                backgroundColor: "var(--status-warning-bg)",
                border: "1px solid var(--status-warning-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--status-warning-text)",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Multiple Selected Files Header / Bulk Action Bar */}
          {selectedFiles.length > 0 && (
            <div
              style={{
                width: "100%",
                maxWidth: "760px",
                marginTop: "24px",
                padding: "12px 18px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Selected Files ({selectedFiles.length})
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Each file has its own independent standardized name &amp; download copy
                </span>
              </div>

              {readyOrErrorCount > 1 && (
                <button
                  onClick={handleStandardizeRemaining}
                  disabled={isProcessingAny}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: isProcessingAny ? "var(--text-muted)" : "var(--bg-button)",
                    color: "#FFFFFF",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: isProcessingAny ? "not-allowed" : "pointer",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Play size={12} fill="#FFFFFF" />
                  <span>Standardize All Pending ({readyOrErrorCount})</span>
                </button>
              )}
            </div>
          )}

          {/* Individual Selected File Results */}
          {selectedFiles.map((item) => (
            <ResultCard
              key={item.id}
              id={item.recordId}
              rawName={item.rawName}
              generatedName={item.generatedName}
              file={item.file}
              status={item.status}
              error={item.error}
              onClear={() => handleRemoveFile(item.id)}
              onProcess={() => processSingleFile(item)}
              onRetry={() => processSingleFile(item)}
            />
          ))}

          {/* Manual Input Single Result */}
          {currentManualResult && (
            <div style={{ width: "100%", maxWidth: "760px" }}>
              <div
                style={{
                  marginTop: "24px",
                  marginBottom: "4px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCheck size={14} color="var(--accent-teal)" />
                <span>Single Filename Result</span>
              </div>
              <ResultCard
                id={currentManualResult.id}
                rawName={currentManualResult.rawName}
                generatedName={currentManualResult.generatedName}
                onClear={() => setCurrentManualResult(null)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Documentation Modal */}
      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
    </div>
  );
};

export default App;
