


import { useState, useEffect, useRef } from "react";

interface Vitals {
  bloodPressure: string;
  heartRate: number | string;
  temperature: number | string;
  status: "stable" | "critical" | "follow-up";
}

interface EditVitalsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (vitals: Vitals) => Promise<void>;
  current: Vitals;
}

const STATUS_OPTIONS = [
  { value: "stable",     label: "Stable",    bg: "#E1F5EE", color: "#0F6E56", dot: "#1D9E75" },
  { value: "follow-up",  label: "Follow-up", bg: "#FEF9EC", color: "#B45309", dot: "#F59E0B" },
  { value: "critical",   label: "Critical",  bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
];

export default function EditVitalsModal({ open, onClose, onSave, current }: EditVitalsModalProps) {
  const [bp, setBp]         = useState(current.bloodPressure || "");
  const [hr, setHr]         = useState(String(current.heartRate || ""));
  const [temp, setTemp]     = useState(String(current.temperature || ""));
  const [status, setStatus] = useState<Vitals["status"]>(current.status || "stable");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  // Sync when current changes (patient data loaded)
  useEffect(() => {
    setBp(current.bloodPressure || "");
    setHr(String(current.heartRate || ""));
    setTemp(String(current.temperature || ""));
    setStatus(current.status || "stable");
  }, [current, open]);

  useEffect(() => {
    if (open) {
      setError("");
      setTimeout(() => firstInput.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await onSave({
        bloodPressure: bp.trim(),
        heartRate: hr ? Number(hr) : "",
        temperature: temp ? Number(temp) : "",
        status,
      });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = STATUS_OPTIONS.find(s => s.value === status)!;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 16,
          width: "100%", maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1D9E75 0%, #16896A 100%)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: 0 }}>Update Vitals</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0 }}>Edit patient measurements & status</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            borderRadius: 8, width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "white",
          }}>
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>

          {/* Vitals row */}
          <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Vitals
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {/* Blood Pressure */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Blood Pressure
              </label>
              <div style={{ position: "relative" }}>
                <input
                  ref={firstInput}
                  type="text"
                  placeholder="120/80"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 10px 10px 10px",
                    border: "1.5px solid #E5E7EB", borderRadius: 9,
                    fontSize: 13, color: "#111", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>mmHg</span>
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Heart Rate
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="72"
                  value={hr}
                  onChange={e => setHr(e.target.value)}
                  min={0} max={300}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 10px",
                    border: "1.5px solid #E5E7EB", borderRadius: 9,
                    fontSize: 13, color: "#111", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>bpm</span>
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 6 }}>
                Temperature
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="37.0"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  step={0.1} min={30} max={45}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 10px",
                    border: "1.5px solid #E5E7EB", borderRadius: 9,
                    fontSize: 13, color: "#111", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>°C</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Patient Status
          </p>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value as Vitals["status"])}
                style={{
                  flex: 1, padding: "10px 8px",
                  borderRadius: 10, cursor: "pointer",
                  border: status === opt.value ? `2px solid ${opt.dot}` : "2px solid #E5E7EB",
                  background: status === opt.value ? opt.bg : "white",
                  transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: status === opt.value ? opt.dot : "#D1D5DB",
                  transition: "background 0.15s",
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: status === opt.value ? opt.color : "#9CA3AF",
                  transition: "color 0.15s",
                }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{
            background: "#F9FAFB", borderRadius: 10, padding: "12px 14px",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: selectedStatus.dot,
            }} />
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              Status will be set to{" "}
              <strong style={{ color: selectedStatus.color }}>{selectedStatus.label}</strong>
              {bp && <> · BP <strong style={{ color: "#111" }}>{bp}</strong></>}
              {hr && <> · HR <strong style={{ color: "#111" }}>{hr} bpm</strong></>}
              {temp && <> · Temp <strong style={{ color: "#111" }}>{temp}°C</strong></>}
            </span>
          </div>

          {error && (
            <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 16px", textAlign: "center" }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "11px", borderRadius: 9,
                border: "1.5px solid #E5E7EB", background: "white",
                fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 2, padding: "11px", borderRadius: 9,
                border: "none",
                background: loading ? "#9FE1CB" : "linear-gradient(135deg, #1D9E75, #16896A)",
                fontSize: 13, fontWeight: 600, color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  Saving…
                </>
              ) : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}