"use client";

/* A real device shell: rounded body, thin bezel, dynamic island, status
   bar and — critically — a natively scrollable viewport. The children
   scroll inside `.phone-viewport`; the page behind it stays put because
   `overscroll-behavior: contain` stops scroll chaining. */
export default function PhoneFrame({
  width = 300,
  height = 620,
  statusColor,
  statusBg = "transparent",
  children,
  onClick,
  viewportRef,
  label,
  interactive = true,
}) {
  return (
    <div
      className="phone-shell"
      style={{ width, flexShrink: 0 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(e); } : undefined}
    >
      {/* side buttons */}
      <span className="phone-btn" style={{ left: -2, top: 96, width: 2.5, height: 26 }} />
      <span className="phone-btn" style={{ left: -2, top: 136, width: 2.5, height: 44 }} />
      <span className="phone-btn" style={{ left: -2, top: 192, width: 2.5, height: 44 }} />
      <span className="phone-btn" style={{ right: -2, top: 140, width: 2.5, height: 62 }} />

      <div className="phone-inner">
        <div className="phone-screen" style={{ height }}>
          <span className="phone-island" aria-hidden="true" />

          <div className="phone-status" style={{ color: statusColor, background: statusBg }} aria-hidden="true">
            <span>9:41</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* signal */}
              <svg viewBox="0 0 18 12" width="13" height="9" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.9" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" opacity="0.9" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" opacity="0.9" />
                <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.45" />
              </svg>
              {/* wifi */}
              <svg viewBox="0 0 16 12" width="11" height="8" fill="currentColor">
                <path d="M8 11.4a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM4.6 7.5a4.6 4.6 0 016.8 0l1-1.1a6 6 0 00-8.8 0l1 1.1zM1.5 4.4a9 9 0 0113 0l1-1.1a10.4 10.4 0 00-15 0l1 1.1z" />
              </svg>
              {/* battery */}
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center", width: 21, height: 10, border: "1px solid currentColor", borderRadius: 3, opacity: 0.85, padding: 1.5 }}>
                <span style={{ height: "100%", width: "72%", background: "currentColor", borderRadius: 1 }} />
                <span style={{ position: "absolute", right: -3.5, top: "50%", transform: "translateY(-50%)", width: 1.6, height: 4, background: "currentColor", borderRadius: "0 1px 1px 0" }} />
              </span>
            </span>
          </div>

          <div
            className="phone-viewport"
            ref={viewportRef}
            style={{ pointerEvents: interactive ? "auto" : "none" }}
          >
            {children}
          </div>

          <span className="phone-home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
