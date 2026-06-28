import { useState, useRef, useContext } from "react";
import axios from "axios";
import { GlobalContext } from "../../context/AuthContext.tsx";
import DoctorLayout from "../../components/Doctorlayout";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Source {
  noteId: string;
  patientId: string;
  patientName: string;
  date: string;
  doctor: string;
  snippet: string;
  score: number;
}

interface SearchResult {
  answer: string;
  sources: Source[];
}

interface HistoryEntry {
  question: string;
  result: SearchResult;
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#0F6E56" : pct >= 60 ? "#B45309" : "#6B7280";
  const bg   = pct >= 80 ? "#E1F5EE" : pct >= 60 ? "#FEF9EC" : "#F3F4F6";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: bg, color, letterSpacing: ".02em",
    }}>
      {pct}% match
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NoteSearch() {
  
  const token = sessionStorage.getItem("token");

  const [question, setQuestion]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<SearchResult | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_PROMPTS = [
    "Which patients have diabetes?",
    "Who was prescribed insulin recently?",
    "Patients with chest pain symptoms",
    "Recent pneumonia cases",
    "Who has hypertension?",
  ];

  const handleSearch = async (q?: string) => {
    const query = (q ?? question).trim();
    if (!query) return;
    setQuestion(query);
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${VITE_API_URL}/api/doctor/search-notes`,
        { question: query, topK: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: SearchResult = res.data;
      setResult(data);
      setHistory(prev => [{ question: query, result: data }, ...prev].slice(0, 10));
    } catch {
      setResult({ answer: "Failed to reach the search service. Please try again.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) handleSearch();
  };

  return (
    <DoctorLayout>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .search-input:focus { border-color: #1D9E75 !important; }
        .quick-chip:hover   { border-color: #1D9E75 !important; color: #0F6E56 !important; background: #E1F5EE !important; }
        .source-card:hover  { border-color: #9FE1CB !important; box-shadow: 0 2px 12px rgba(29,158,117,0.07); }
        .history-item:hover { background: #F9FAFB !important; }
        .send-btn:hover:not(:disabled) { background: #178a63 !important; }
        .result-enter { animation: fadeUp 0.25s ease both; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#E1F5EE",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🔍</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>Note Search</h1>
        </div>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0, paddingLeft: 46 }}>
          Search across all patient notes using AI — ask in plain language.
        </p>
      </div>

      <div className="note-search-shell" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── LEFT: Search + Results ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search bar */}
          <div style={{
            background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
            padding: 16, marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px" }}>
              Ask a question
            </p>
            <div className="note-search-form" style={{ display: "flex", gap: 10 }}>
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Which patients have high blood pressure?"
                style={{
                  flex: 1, padding: "11px 16px",
                  border: "1.5px solid #E5E7EB", borderRadius: 10,
                  fontSize: 13, color: "#111", outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                className="send-btn"
                onClick={() => handleSearch()}
                disabled={loading || !question.trim()}
                style={{
                  padding: "11px 20px", borderRadius: 10, border: "none",
                  background: question.trim() ? "#1D9E75" : "#D1D5DB",
                  color: "white", cursor: question.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 6,
                  fontWeight: 600, fontSize: 13, transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? <><Spinner /> Searching…</> : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Quick prompts */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q}
                  className="quick-chip"
                  onClick={() => handleSearch(q)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: "1.5px solid #E5E7EB", background: "white", color: "#374151",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 120, borderRadius: 12, background: "#F3F4F6", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 80,  borderRadius: 12, background: "#F3F4F6", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 80,  borderRadius: 12, background: "#F3F4F6", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="result-enter">

              {/* AI Answer */}
              <div style={{
                background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
                padding: "18px 20px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
                  }}>🤖</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>AI Answer</span>
                  {result.sources.length > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                      background: "#E1F5EE", color: "#0F6E56", marginLeft: "auto",
                    }}>
                      {result.sources.length} source{result.sources.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: 13, color: "#374151", lineHeight: 1.7,
                  margin: 0, whiteSpace: "pre-wrap",
                }}>
                  {result.answer}
                </p>
              </div>

              {/* Sources */}
              {result.sources.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px" }}>
                    Sources
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.sources.map((src) => (
                      <div
                        key={src.noteId}
                        className="source-card"
                        style={{
                          background: "white", borderRadius: 12, border: "1px solid #E5E7EB",
                          padding: "14px 18px", cursor: "pointer",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                        onClick={() => setExpandedSrc(expandedSrc === src.noteId ? null : src.noteId)}
                      >
                        {/* Source header */}
                        <div className="source-header" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          {/* Patient avatar */}
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", background: "#E1F5EE",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#0F6E56", flexShrink: 0,
                          }}>
                            {(src.patientName ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>
                              {src.patientName || "Unknown patient"}
                            </p>
                            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                              {src.date ? new Date(src.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                              {src.doctor && src.doctor !== "unknown" ? ` · Dr. ${src.doctor}` : ""}
                            </p>
                          </div>

                          <div className="source-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {src.score != null && <ScoreBadge score={src.score} />}
                            <svg
                              width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                              style={{ transition: "transform 0.2s", transform: expandedSrc === src.noteId ? "rotate(180deg)" : "none" }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {/* Snippet always visible */}
                        <p style={{
                          fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0,
                          display: "-webkit-box", WebkitLineClamp: expandedSrc === src.noteId ? "unset" : 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {src.snippet}
                        </p>

                        {/* Expanded full snippet */}
                        {expandedSrc === src.noteId && src.snippet.length > 200 && (
                          <div style={{
                            marginTop: 10, paddingTop: 10, borderTop: "1px solid #F3F4F6",
                          }}>
                            <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                              {src.snippet}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {result.sources.length === 0 && !result.answer.startsWith("Failed") && (
                <div style={{
                  textAlign: "center", padding: "30px 20px", background: "white",
                  borderRadius: 12, border: "1px solid #E5E7EB",
                }}>
                  <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>
                    No matching notes found. Try rephrasing your question.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !result && (
            <div style={{
              textAlign: "center", padding: "52px 20px", background: "white",
              borderRadius: 14, border: "1px solid #E5E7EB",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗂️</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>
                Search across all patient notes
              </p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
                Ask anything — symptoms, diagnoses, medications, or patient names.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Search history ── */}
        <div className="note-search-history" style={{ width: 240, flexShrink: 0 }}>
          <div style={{
            background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
            padding: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 12px" }}>
              Recent searches
            </p>

            {history.length === 0 ? (
              <p style={{ fontSize: 12, color: "#D1D5DB", margin: 0, textAlign: "center", padding: "20px 0" }}>
                No searches yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {history.map((h, i) => (
                  <button
                    key={i}
                    className="history-item"
                    onClick={() => handleSearch(h.question)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "8px 10px", borderRadius: 8, border: "none",
                      background: "transparent", cursor: "pointer",
                      textAlign: "left", transition: "background 0.15s", width: "100%",
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginTop: 2, flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                      {h.question}
                    </span>
                  </button>
                ))}

                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    style={{
                      marginTop: 8, padding: "6px 10px", borderRadius: 8,
                      border: "none", background: "none", cursor: "pointer",
                      fontSize: 11, color: "#9CA3AF", textAlign: "center", width: "100%",
                    }}
                  >
                    Clear history
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info card */}
          <div style={{
            background: "#E1F5EE", borderRadius: 12, padding: "14px 16px", marginTop: 12,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0F6E56", margin: "0 0 6px" }}>How it works</p>
            <p style={{ fontSize: 12, color: "#0F6E56", margin: 0, lineHeight: 1.6, opacity: 0.85 }}>
              Your question is matched against all indexed notes using semantic search, then answered by AI using only those notes as context.
            </p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
