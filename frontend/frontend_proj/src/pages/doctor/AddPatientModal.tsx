


import { useState, useEffect, useRef } from "react";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (patient: { firstName: string; lastName: string }) => Promise<void>;
}

export default function AddPatientModal({ open, onClose, onAdd }: AddPatientModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setError("");
      setTimeout(() => firstRef.current?.focus(), 60);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    const f = firstName.trim();
    const l = lastName.trim();
    if (!f || !l) {
      setError("Both first name and last name are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onAdd({ firstName: f, lastName: l });
      onClose();
    } catch {
      setError("Failed to add patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(17,24,39,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 50,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div
        className="responsive-modal"
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 51,
          width: "100%", maxWidth: 440,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)",
          fontFamily: "'Inter', sans-serif",
          animation: "slideUp 0.18s ease",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header accent strip */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #1D9E75 0%, #34D399 100%)",
        }} />

        {/* Body */}
        <div style={{ padding: "28px 28px 24px" }}>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 4px", letterSpacing: "-0.3px" }}>
                New patient
              </h2>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                Add a patient to your list
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1px solid #E5E7EB",
                background: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#9CA3AF", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: initials ? "#E1F5EE" : "#F3F4F6",
              border: "2px solid",
              borderColor: initials ? "#9FE1CB" : "#E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700,
              color: initials ? "#0F6E56" : "#D1D5DB",
              transition: "all 0.2s",
              letterSpacing: "-0.5px",
            }}>
              {initials || (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: "0.02em" }}>
                FIRST NAME
              </label>
              <input
                ref={firstRef}
                type="text"
                placeholder="e.g. Fatma"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px",
                  border: "1.5px solid #E5E7EB", borderRadius: 9,
                  fontSize: 14, color: "#111",
                  background: "white", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: "0.02em" }}>
                LAST NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Ben Ali"
                value={lastName}
                onChange={e => { setLastName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px",
                  border: "1.5px solid #E5E7EB", borderRadius: 9,
                  fontSize: 14, color: "#111",
                  background: "white", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12,
              padding: "9px 12px",
              background: "#FEF2F2", borderRadius: 8,
              border: "1px solid #FECACA",
              fontSize: 13, color: "#DC2626",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "10px 0",
                borderRadius: 9, fontSize: 14, fontWeight: 500,
                border: "1.5px solid #E5E7EB",
                background: "white", color: "#374151",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2, padding: "10px 0",
                borderRadius: 9, fontSize: 14, fontWeight: 600,
                border: "none",
                background: loading || (!firstName.trim() && !lastName.trim())
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #1D9E75 0%, #17876A 100%)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Adding…
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add patient
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
