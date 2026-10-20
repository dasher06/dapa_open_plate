import { Menu, BookOpen } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenDocs }) => {
  return (
    <header
      style={{
        height: "60px",
        borderBottom: "1px solid var(--border-default)",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "var(--glass-backdrop)",
        WebkitBackdropFilter: "var(--glass-backdrop)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: "8px",
            color: "var(--text-secondary)",
            borderRadius: "var(--radius-sm)",
            display: "none",
            backgroundColor: "var(--bg-surface-subtle)",
            border: "1px solid var(--border-subtle)",
          }}
          className="header-mobile-toggle"
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>

        <div
          className="header-mobile-brand"
          style={{
            alignItems: "center",
            gap: "8px",
            display: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="Open Plate logo"
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
            Open Plate
          </span>
        </div>

        <div
          className="header-desktop-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-teal)",
              boxShadow: "0 0 0 2px var(--accent-teal-light)",
            }}
          />
          <span style={{ fontWeight: 500 }}>Universal File Naming System</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onOpenDocs}
          style={{
            color: "var(--text-primary)",
            background: "rgba(255, 255, 255, 0.9)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          }}
          aria-label="Open documentation modal"
        >
          <BookOpen size={14} color="var(--accent-cyan)" />
          <span>Documentation</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .header-mobile-toggle {
            display: flex !important;
          }
          .header-mobile-brand {
            display: flex !important;
          }
          .header-desktop-badge {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
