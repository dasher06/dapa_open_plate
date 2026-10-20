import React from "react";
import {
  FileText,
  Clock,
  Copy,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { SessionPlateRecord } from "../types/plate";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  recentRecords: SessionPlateRecord[];
  onSelectRecord?: (record: SessionPlateRecord) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  recentRecords,
  onSelectRecord,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 36, 58, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: "290px",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-default)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "var(--shadow-sm)",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isOpen ? "translateX(0)" : undefined,
        }}
        className={isOpen ? "sidebar-mobile-open" : "sidebar-desktop"}
      >
        {/* Brand Header with Official Logo */}
        <div
          style={{
            padding: "20px 20px 18px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Open Plate
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Universal Standard
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "6px",
              color: "var(--text-secondary)",
              borderRadius: "var(--radius-sm)",
              display: "none",
            }}
            className="sidebar-close-button"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Standard Info Banner - Fixed Overflow */}
        <div
          style={{
            margin: "16px 16px 8px 16px",
            padding: "10px 12px",
            backgroundColor: "var(--bg-highlight)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "11.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.45,
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <Sparkles size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>Filename Format:</span>
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                fontWeight: 600,
                color: "var(--text-primary)",
                wordBreak: "break-all",
                overflowWrap: "anywhere",
                display: "block",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "3px 6px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              place_persona_purpose_usen_DDMMYY.ext
            </code>
          </div>
        </div>

        {/* Session History Header */}
        <div
          style={{
            padding: "14px 20px 8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Clock size={12} color="var(--accent-teal)" />
            <span>Session History</span>
          </div>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 7px",
              borderRadius: "10px",
              backgroundColor: "var(--bg-surface-subtle)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              border: "1px solid var(--border-subtle)",
            }}
          >
            {recentRecords.length}
          </span>
        </div>

        {/* Records List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 12px 20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {recentRecords.length === 0 ? (
            <div
              style={{
                padding: "36px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              <FileText size={24} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
              <div>No standardized files yet in this session.</div>
            </div>
          ) : (
            recentRecords.map((record) => {
              const isCopied = copiedId === record.id;
              return (
                <div
                  key={record.id}
                  onClick={() => onSelectRecord?.(record)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={record.generatedName}
                    >
                      {record.generatedName}
                    </span>

                    <button
                      onClick={(e) => handleCopy(e, record.generatedName, record.id)}
                      style={{
                        padding: "3px 6px",
                        color: isCopied ? "var(--status-success-text)" : "var(--text-secondary)",
                        borderRadius: "var(--radius-xs)",
                        flexShrink: 0,
                        backgroundColor: isCopied ? "var(--status-success-bg)" : "transparent",
                      }}
                      title="Copy standardized name"
                      aria-label="Copy standardized name"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={record.rawName}
                  >
                    from: {record.rawName}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>SQLite Persistent</span>
          <span>v1.0</span>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .sidebar-desktop {
              position: fixed !important;
              left: 0;
              top: 0;
              bottom: 0;
              transform: translateX(-100%);
            }
            .sidebar-mobile-open {
              transform: translateX(0) !important;
            }
            .sidebar-close-button {
              display: block !important;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
