import React, { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FolderPlus } from "lucide-react";

interface FileUploaderProps {
  onAddFiles: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onAddFiles, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Prevent browser window from navigating away on dropped files
  useEffect(() => {
    const preventWindowDrop = (e: globalThis.DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", preventWindowDrop);
    window.addEventListener("drop", preventWindowDrop);
    return () => {
      window.removeEventListener("dragover", preventWindowDrop);
      window.removeEventListener("drop", preventWindowDrop);
    };
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return;
    try {
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        onAddFiles(fileArray);
      }
    } catch {
      // ignore
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Hidden file input placed outside the clickable container to prevent event bubbling loops */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleInputChange}
        onClick={(e) => e.stopPropagation()}
        disabled={disabled}
        aria-hidden="true"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFileDialog();
          }
        }}
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "18px auto 0 auto",
          border: `2px dashed ${isDragging ? "var(--accent-cyan)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "32px 24px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: isDragging ? "var(--accent-cyan-light)" : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "var(--glass-backdrop)",
          WebkitBackdropFilter: "var(--glass-backdrop)",
          boxShadow: isDragging ? "var(--shadow-glow)" : "var(--shadow-sm)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: isDragging ? "var(--accent-cyan)" : "var(--bg-highlight)",
            color: isDragging ? "#FFFFFF" : "var(--accent-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <UploadCloud size={24} />
        </div>

        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>
            {isDragging ? "Release to add files" : "Drop files here, or click to choose"}
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            Select one or multiple files from your computer to standardize and export
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--accent-teal)",
            fontWeight: 500,
            backgroundColor: "var(--accent-teal-light)",
            padding: "4px 10px",
            borderRadius: "12px",
            marginTop: "4px",
          }}
        >
          <FolderPlus size={13} />
          <span>Individual processing &amp; renamed copies for each file</span>
        </div>
      </div>
    </>
  );
};

export default FileUploader;
