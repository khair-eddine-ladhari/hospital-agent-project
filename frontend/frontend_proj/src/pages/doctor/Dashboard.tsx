

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorLayout from "../../components/Doctorlayout"
const VITE_API_URL = import.meta.env.VITE_API_URL;
import { useContext } from "react";
import { GlobalContext } from "../../context/AuthContext.tsx";




interface Patient {
  _id: string;
  fullName: string;
  age: number;
  gender: "male" | "female";
  diagnoses: string[];
  lastVisit?: string;
  notesCount?: number;
  status: "stable" | "critical" | "follow-up";
  assignedDoctor?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  stable:     { bg: "#E1F5EE", color: "#0F6E56", label: "Stable" },
  critical:   { bg: "#FEF2F2", color: "#DC2626", label: "Critical" },
  "follow-up":{ bg: "#FEF9EC", color: "#B45309", label: "Follow-up" },
};

export default function Dashboard() {
const { user } = useContext(GlobalContext)!;
const token = sessionStorage.getItem("token");




  const navigate = useNavigate();
 // const { user, token } = useAuthStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stable" | "critical" | "follow-up">("all");

  const [patients, setPatients] = useState<Patient[]>([]);
const [loading, setLoading] = useState(false); // set to false so skeletons don't show

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/api/doctor/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        setPatients(res.data.patients || res.data);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

 const filtered = (Array.isArray(patients) ? patients : []).filter((p) => {
  const matchSearch =
    (p.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.diagnoses?.[0] ?? "").toLowerCase().includes(search.toLowerCase());
  const matchFilter = filter === "all" || p.status === filter;
  return matchSearch && matchFilter;
});

  const stats = {
    total: patients.length,
    critical: patients.filter((p) => p.status === "critical").length,
    followUp: patients.filter((p) => p.status === "follow-up").length,
    stable: patients.filter((p) => p.status === "stable").length,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DoctorLayout>
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", letterSpacing: "-0.4px", margin: "0 0 4px" }}>
          {greeting()}, Dr. {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
          Here's an overview of your assigned patients today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total patients", value: stats.total, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", color: "#1D9E75", bg: "#E1F5EE" },
          { label: "Stable", value: stats.stable, icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", color: "#0F6E56", bg: "#E1F5EE" },
          { label: "Follow-up", value: stats.followUp, icon: "M12 2v20M2 12h20", color: "#B45309", bg: "#FEF9EC" },
          { label: "Critical", value: stats.critical, icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", color: "#DC2626", bg: "#FEF2F2" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{
            background: "white", borderRadius: 12,
            border: "1px solid #E5E7EB", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d={icon} />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "3px 0 0", whiteSpace: "nowrap" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 18, flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <svg width="15" height="15" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search patients or conditions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 12px 9px 34px",
              border: "1.5px solid #E5E7EB", borderRadius: 9,
              fontSize: 13, color: "#111", background: "white", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#1D9E75")}
            onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>

        {/* Filter pills */}
        {(["all", "stable", "follow-up", "critical"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: filter === f ? "1.5px solid #1D9E75" : "1.5px solid #E5E7EB",
              background: filter === f ? "#E1F5EE" : "white",
              color: filter === f ? "#0F6E56" : "#6B7280",
              cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Patient list ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 78, borderRadius: 12, background: "#F3F4F6",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "white", borderRadius: 12, border: "1px solid #E5E7EB",
        }}>
          <svg width="40" height="40" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>
            {search ? "No patients match your search." : "No patients assigned yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((patient) => {
            const s = STATUS_STYLE[patient.status] || STATUS_STYLE.stable;
            return (
              <div
                key={patient._id}
                onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                style={{
                  background: "white", borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#9FE1CB";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(29,158,117,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: patient.gender === "female" ? "#FEF0F5" : "#E1F5EE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700,
                  color: patient.gender === "female" ? "#9D174D" : "#0F6E56",
                }}>
                  {(patient.fullName ?? "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {patient.fullName}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px",
                      borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap",
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
                    {patient.age} yrs · {patient.gender} · {patient.diagnoses?.[0] ?? "—"}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>
                    Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                    {patient.notesCount ?? 0} note{patient.notesCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
    </DoctorLayout>
  );
}