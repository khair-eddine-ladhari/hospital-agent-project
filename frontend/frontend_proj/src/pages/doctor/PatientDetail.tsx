



import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GlobalContext } from "../../context/AuthContext.tsx";
import DoctorLayout from "../../components/Doctorlayout";
import EditVitalsModal from "./EditVitalsModal";
const VITE_API_URL = import.meta.env.VITE_API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Patient {
  _id: string;
  fullName: string;
  age: number;
  gender: "male" | "female";
  diagnoses: string[];
  lastVisit?: string;
  notesCount?: number;
  status: "stable" | "critical" | "follow-up";
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
}

interface StructuredNote {
  symptoms: string[];
  diagnosis: string[];
  medications: string[];
  icd10: string | null;
}

interface NoteRecord {
  _id: string;
  text: string;
  structured: StructuredNote;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  stable:      { bg: "#E1F5EE", color: "#0F6E56", border: "#9FE1CB", label: "Stable" },
  critical:    { bg: "#FEF2F2", color: "#DC2626", border: "#FCA5A5", label: "Critical" },
  "follow-up": { bg: "#FEF9EC", color: "#B45309", border: "#FCD34D", label: "Follow-up" },
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  symptoms:    { bg: "#FEF9EC", text: "#B45309" },
  diagnosis:   { bg: "#EFF6FF", text: "#1D4ED8" },
  medications: { bg: "#F5F3FF", text: "#6D28D9" },
  icd10:       { bg: "#E1F5EE", text: "#0F6E56" },
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Tag({ color, children }: { color: { bg: string; text: string }; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: color.bg,
        color: color.text,
        marginRight: 6,
        marginBottom: 4,
      }}
    >
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PatientDetail() {
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext)!;
  const token = sessionStorage.getItem("token");

  // ── State ──
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");

  // Note flow
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [rawNote, setRawNote] = useState("");
  const [structuring, setStructuring] = useState(false);
  const [structured, setStructured] = useState<StructuredNote | null>(null);
  const [editableStructured, setEditableStructured] = useState<StructuredNote | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteStep, setNoteStep] = useState<"write" | "review">("write");

  // AI Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch patient ──
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/api/doctor/patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPatient(res.data.patient || res.data);
      } catch {
        // handle error
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [id, token]);

  // ── Fetch notes ──
  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const res = await axios.get(`${VITE_API_URL}/api/doctor/patient/${id}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data.notes || res.data || []);
      } catch {
        // keep empty
      } finally {
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [id, token]);

  // ── Scroll chat to bottom ──
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ── Step 1: Structure the note via AI ──
  const handleStructureNote = async () => {
    if (!rawNote.trim()) return;
    setStructuring(true);
    try {
      const res = await axios.post(
        `${VITE_API_URL}/api/doctor/structure-note`,
        { note: rawNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: StructuredNote = res.data.response || res.data;
      setStructured(data);
      setEditableStructured(JSON.parse(JSON.stringify(data))); // deep clone for editing
      setNoteStep("review");
    } catch {
      alert("Failed to structure note. Please try again.");
    } finally {
      setStructuring(false);
    }
  };

  // ── Step 2: Save confirmed note ──
  const handleSaveNote = async () => {
    if (!editableStructured) return;
    setSavingNote(true);
    try {
     await axios.post(
  `${VITE_API_URL}/api/confirm-note`,
  {
    patientId: id,           // the _id from useParams
    rawNote,
    structured: editableStructured,
  },
  { headers: { Authorization: `Bearer ${token}` } }
);
      // reload notes
      const res = await axios.get(`${VITE_API_URL}/api/doctor/patient/${id}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data.notes || res.data || []);
      setRawNote("");
      setStructured(null);
      setEditableStructured(null);
      setNoteStep("write");
    } catch {
      alert("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  // ── AI Chat ──

  // ── Load chat history on mount ──
useEffect(() => {
  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(
        `${VITE_API_URL}/api/doctor/patient/${id}/chat`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // map DB messages to ChatMessage shape
      setChatHistory(
        (res.data.messages ?? []).map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
    } catch {
      // keep empty on error
    }
  };
  fetchChatHistory();
}, [id, token]);


  const handleChat = async () => {
    if (!chatInput.trim() || !patient) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await axios.post(
        `${VITE_API_URL}/api/doctor/patient/${id}/chat`,
        { query: chatInput, patientData: patient },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const parsed = res.data.response;
      const answer = typeof parsed === "string"
        ? parsed
        : `${parsed.answer ?? ""}${parsed.opinion ? `\n\n🩺 *${parsed.opinion}*` : ""}`;
      setChatHistory([...newHistory, { role: "assistant", content: answer }]);
    } catch {
      setChatHistory([...newHistory, { role: "assistant", content: "Failed to get a response. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Editable tag helpers ──
  const updateTagItem = (field: keyof Pick<StructuredNote, "symptoms" | "diagnosis" | "medications">, idx: number, val: string) => {
    if (!editableStructured) return;
    const updated = { ...editableStructured, [field]: editableStructured[field].map((v, i) => i === idx ? val : v) };
    setEditableStructured(updated);
  };

  const removeTagItem = (field: keyof Pick<StructuredNote, "symptoms" | "diagnosis" | "medications">, idx: number) => {
    if (!editableStructured) return;
    setEditableStructured({ ...editableStructured, [field]: editableStructured[field].filter((_, i) => i !== idx) });
  };

  const addTagItem = (field: keyof Pick<StructuredNote, "symptoms" | "diagnosis" | "medications">) => {
    if (!editableStructured) return;
    setEditableStructured({ ...editableStructured, [field]: [...editableStructured[field], ""] });
  };

  // ── Loading skeleton ──
  if (loadingPatient) {
    return (
      <DoctorLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 12, background: "#F3F4F6", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      </DoctorLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Patient not found.</div>
      </DoctorLayout>
    );
  }

  const s = STATUS_STYLE[patient.status] || STATUS_STYLE.stable;
  const initials = (patient.fullName ?? "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const handleSaveVitals = async (vitals: { bloodPressure: string; heartRate: number | string; temperature: number | string; status: "stable" | "critical" | "follow-up" }) => {
  await axios.put(
    `${VITE_API_URL}/api/doctor/patients/${id}`,  // 👈 id not patientId
    vitals,
    { headers: { Authorization: `Bearer ${token}` } }
  );
   setPatient(prev => prev ? { ...prev, ...vitals } : prev);
};
  return (
    <DoctorLayout>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        .tab-btn { transition: all 0.15s; }
        .tab-btn:hover { background: #F9FAFB; }
        .chat-bubble-user  { background: #E1F5EE; color: #0F6E56; border-radius: 14px 14px 4px 14px; }
        .chat-bubble-ai    { background: white; border: 1px solid #E5E7EB; border-radius: 14px 14px 14px 4px; color: #111; }
        .editable-tag input { border: none; outline: none; background: transparent; font-size: 12px; font-weight: 500; width: 100%; }
        .note-card:hover { border-color: #9FE1CB !important; box-shadow: 0 2px 12px rgba(29,158,117,0.07); }
        .back-btn:hover { background: #F3F4F6; }
      `}</style>

      {/* ── Back ── */}
      <button
        className="back-btn"
        onClick={() => navigate("/doctor/dashboard")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: "#6B7280", fontSize: 13, fontWeight: 500,
          padding: "6px 10px 6px 6px", borderRadius: 8, marginBottom: 20,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to dashboard
      </button>

      {/* ── Patient header card ── */}
      <div style={{
        background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
        padding: "20px 24px", marginBottom: 22,
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
      }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
          background: patient.gender === "female" ? "#FEF0F5" : "#E1F5EE",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700,
          color: patient.gender === "female" ? "#9D174D" : "#0F6E56",
        }}>
          {initials}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>{patient.fullName}</h1>
            <span style={{
              fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
              background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            }}>
              {s.label}
            </span>
          </div>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
            {patient.age} yrs · {patient.gender} · Last visit: {patient.lastVisit
              ? new Date(patient.lastVisit).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>

     {/* Vitals chips */}
<div
  onClick={() => setShowVitalsModal(true)}
  title="Click to edit vitals"
  style={{ display: "flex", gap: 10, flexWrap: "wrap", cursor: "pointer" }}
>
          {[
            { label: "BP", value: patient.bloodPressure ?? "—", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
            { label: "HR", value: patient.heartRate ? `${patient.heartRate} bpm` : "—", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
            { label: "Temp", value: patient.temperature ? `${patient.temperature}°C` : "—", icon: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              padding: "8px 14px", borderRadius: 10, background: "#F9FAFB",
              border: "1px solid #E5E7EB", textAlign: "center",
            }}>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Diagnoses ── */}
      {patient.diagnoses?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 8px" }}>
            Diagnoses
          </p>
          <div>
            {patient.diagnoses.map((d, i) => (
              <Tag key={i} color={TAG_COLORS.diagnosis}>{d}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "#F3F4F6", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["notes", "chat"] as const).map(tab => (
          <button
            key={tab}
            className="tab-btn"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#111" : "#6B7280",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab === "notes" ? "📝 Notes" : "🤖 AI Chat"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: NOTES
      ══════════════════════════════════════ */}
      {activeTab === "notes" && (
        <div>
          {/* ── Write note card ── */}
          <div style={{
            background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
            padding: 20, marginBottom: 20,
          }}>
            {noteStep === "write" ? (
              <>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: "0 0 10px" }}>New Clinical Note</p>
                <textarea
                  value={rawNote}
                  onChange={e => setRawNote(e.target.value)}
                  placeholder="Write the clinical note in plain text… e.g. 'Patient presents with chest pain and shortness of breath. Prescribed aspirin 100mg.'"
                  rows={5}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #E5E7EB", borderRadius: 10,
                    padding: "12px 14px", fontSize: 13, color: "#111",
                    resize: "vertical", outline: "none", fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    onClick={handleStructureNote}
                    disabled={structuring || !rawNote.trim()}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 20px", borderRadius: 9, border: "none",
                      background: rawNote.trim() ? "#1D9E75" : "#D1D5DB",
                      color: "white", fontWeight: 600, fontSize: 13,
                      cursor: rawNote.trim() ? "pointer" : "not-allowed", transition: "background 0.15s",
                    }}
                  >
                    {structuring ? <><Spinner /> Structuring…</> : "✨ Structure with AI"}
                  </button>
                </div>
              </>
            ) : (
              /* ── Review & edit structured output ── */
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>Review & Edit Structured Note</p>
                  <button
                    onClick={() => { setNoteStep("write"); setStructured(null); setEditableStructured(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                  >
                    ← Edit raw note
                  </button>
                </div>

                {/* Original note preview */}
                <div style={{
                  background: "#F9FAFB", borderRadius: 9, padding: "10px 14px",
                  marginBottom: 16, fontSize: 13, color: "#6B7280", lineHeight: 1.6,
                  borderLeft: "3px solid #1D9E75",
                }}>
                  {rawNote}
                </div>

                {editableStructured && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* ICD-10 */}
                    {editableStructured.icd10 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 6px" }}>ICD-10 Code</p>
                        <Tag color={TAG_COLORS.icd10}>{editableStructured.icd10}</Tag>
                      </div>
                    )}

                    {/* Each editable field */}
                    {(["symptoms", "diagnosis", "medications"] as const).map(field => (
                      <div key={field}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 6px" }}>
                          {field}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                          {editableStructured[field].map((item, idx) => (
                            <div
                              key={idx}
                              className="editable-tag"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "4px 10px", borderRadius: 20,
                                background: TAG_COLORS[field].bg, border: `1px solid ${TAG_COLORS[field].text}33`,
                              }}
                            >
                              <input
                                value={item}
                                onChange={e => updateTagItem(field, idx, e.target.value)}
                                style={{ color: TAG_COLORS[field].text, minWidth: 60, maxWidth: 160 }}
                              />
                              <button
                                onClick={() => removeTagItem(field, idx)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: TAG_COLORS[field].text, padding: 0, lineHeight: 1, fontSize: 13, opacity: 0.6 }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addTagItem(field)}
                            style={{
                              padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                              border: `1.5px dashed ${TAG_COLORS[field].text}66`,
                              background: "transparent", color: TAG_COLORS[field].text, cursor: "pointer",
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
                  <button
                    onClick={() => { setNoteStep("write"); setStructured(null); setEditableStructured(null); }}
                    style={{
                      padding: "9px 18px", borderRadius: 9, border: "1.5px solid #E5E7EB",
                      background: "white", color: "#6B7280", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 20px", borderRadius: 9, border: "none",
                      background: "#1D9E75", color: "white", fontWeight: 600, fontSize: 13,
                      cursor: savingNote ? "not-allowed" : "pointer",
                    }}
                  >
                    {savingNote ? <><Spinner /> Saving…</> : "✓ Confirm & Save"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Past notes ── */}
          <p style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px" }}>
            Past Notes
          </p>

          {loadingNotes ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2].map(i => <div key={i} style={{ height: 90, borderRadius: 12, background: "#F3F4F6", animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB" }}>
              <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>No notes yet. Write the first one above.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notes.map(note => (
                <div
                  key={note._id}
                  className="note-card"
                  style={{
                    background: "white", borderRadius: 12, border: "1px solid #E5E7EB",
                    padding: "16px 20px", transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Date */}
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 8px", fontWeight: 500 }}>
                    {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>

                  {/* Raw text */}
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 12px" }}>
                    {note.text}
                  </p>

                  {/* Structured data */}
                  {note.structured && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid #F3F4F6" }}>
                      {note.structured.icd10 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", minWidth: 80, textTransform: "uppercase", letterSpacing: ".05em" }}>ICD-10</span>
                          <Tag color={TAG_COLORS.icd10}>{note.structured.icd10}</Tag>
                        </div>
                      )}
                      {note.structured.diagnosis?.length > 0 && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", minWidth: 80, textTransform: "uppercase", letterSpacing: ".05em", paddingTop: 3 }}>Diagnosis</span>
                          <div>{note.structured.diagnosis.map((d, i) => <Tag key={i} color={TAG_COLORS.diagnosis}>{d}</Tag>)}</div>
                        </div>
                      )}
                      {note.structured.symptoms?.length > 0 && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", minWidth: 80, textTransform: "uppercase", letterSpacing: ".05em", paddingTop: 3 }}>Symptoms</span>
                          <div>{note.structured.symptoms.map((sym, i) => <Tag key={i} color={TAG_COLORS.symptoms}>{sym}</Tag>)}</div>
                        </div>
                      )}
                      {note.structured.medications?.length > 0 && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", minWidth: 80, textTransform: "uppercase", letterSpacing: ".05em", paddingTop: 3 }}>Meds</span>
                          <div>{note.structured.medications.map((m, i) => <Tag key={i} color={TAG_COLORS.medications}>{m}</Tag>)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: AI CHAT
      ══════════════════════════════════════ */}
      {activeTab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Info banner */}
          <div style={{
            background: "#E1F5EE", borderRadius: 10, padding: "10px 16px", marginBottom: 16,
            fontSize: 13, color: "#0F6E56", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🤖</span>
            <span>Ask MedAI about this patient's status, vitals, or history. Responses are based only on available patient data.</span>
          </div>

          {/* Chat messages */}
          <div style={{
            background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
            padding: 16, minHeight: 360, maxHeight: 460, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 12, marginBottom: 12,
          }}>
            {chatHistory.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#D1D5DB" }}>
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p style={{ fontSize: 13, margin: 0 }}>Start a conversation about this patient</p>
                {/* Quick prompts */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" }}>
                  {[
                    "What is the patient's current status?",
                    "Are there any concerning vitals?",
                    "Summarise the patient's diagnoses",
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                        border: "1.5px solid #E5E7EB", background: "white", color: "#374151",
                        cursor: "pointer", transition: "border-color 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#1D9E75")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginRight: 8, fontSize: 14,
                  }}>🤖</div>
                )}
                <div
                  className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                  style={{
                    padding: "10px 14px", maxWidth: "75%",
                    fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                <div className="chat-bubble-ai" style={{ padding: "10px 14px", fontSize: 13, color: "#9CA3AF" }}>
                  <Spinner /> Thinking…
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChat()}
              placeholder="Ask about this patient…"
              style={{
                flex: 1, padding: "11px 16px",
                border: "1.5px solid #E5E7EB", borderRadius: 10,
                fontSize: 13, color: "#111", outline: "none", fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#1D9E75")}
              onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
            />
            <button
              onClick={handleChat}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: "11px 18px", borderRadius: 10, border: "none",
                background: chatInput.trim() ? "#1D9E75" : "#D1D5DB",
                color: "white", cursor: chatInput.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13,
                transition: "background 0.15s",
              }}
            >
              {chatLoading ? <Spinner /> : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
      )}

      <EditVitalsModal
        open={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        onSave={handleSaveVitals}
        current={{
          bloodPressure: patient.bloodPressure ?? "",
          heartRate: patient.heartRate ?? "",
          temperature: patient.temperature ?? "",
          status: patient.status,
        }}
      />
    </DoctorLayout>
  );
}