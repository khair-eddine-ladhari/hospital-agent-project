import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { GlobalContext } from "../../context/AuthContext.tsx";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login } = useContext(GlobalContext)!;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${VITE_API_URL}/api/auth/login`, form);
      sessionStorage.setItem("token", res.data.token);
      login(res.data);
      if (res.data.role === "doctor") navigate("/doctor/dashboard");
      else if (res.data.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel – branding ── */}
      <div
        style={{
          width: "45%",
          background: "linear-gradient(135deg, #085041 0%, #0F6E56 40%, #1D9E75 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.5rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden-mobile"
      >
        {/* decorative blobs */}
        <div style={{
          position: "absolute", width: 320, height: 320, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", top: -80, right: -80,
        }} />
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", bottom: 120, left: -60,
        }} />
        <div style={{
          position: "absolute", width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", bottom: 280, right: 40,
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: 18, letterSpacing: "-0.3px" }}>MedAssist</span>
        </div>

        {/* Center content */}
        <div style={{ zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.12)", borderRadius: 20,
            padding: "4px 12px", marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#9FE1CB" }} />
            <span style={{ color: "#9FE1CB", fontSize: 13, fontWeight: 500 }}>AI-Powered Clinical Platform</span>
          </div>

          <h1 style={{
            color: "white", fontSize: 36, fontWeight: 700,
            lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 16,
          }}>
            Clinical intelligence,<br />built for doctors.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
            Structured AI notes, semantic patient search, and real-time clinical insights — all in one platform.
          </p>

          {/* Feature bullets */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2", label: "AI-structured clinical notes" },
              { icon: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z", label: "Semantic patient search with citations" },
              { icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2Zm0 0V9a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2Z", label: "Full patient timeline & history" },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={icon} />
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div style={{
          zIndex: 1,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "16px 20px",
          borderLeft: "3px solid rgba(255,255,255,0.3)",
        }}>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            "MedAssist cut my documentation time in half. The AI notes are surprisingly accurate."
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 8, margin: "8px 0 0" }}>
            Dr. Sami Ben Salah · Cardiologist, Clinique Hannibal
          </p>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        background: "#FAFAFA",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }} className="show-mobile">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#1D9E75",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM12 8v8M8 12h8" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#0F6E56" }}>MedAssist</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: "-0.4px", margin: "0 0 6px" }}>
              Welcome back
            </h2>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
              Sign in to your doctor account
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 10, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 20,
            }}>
              <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <span style={{ color: "#DC2626", fontSize: 13 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}>
                  <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@clinic.com"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 12px 11px 38px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10, fontSize: 14,
                    background: "white", color: "#111",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "#1D9E75", textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}>
                  <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 40px 11px 38px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10, fontSize: 14,
                    background: "white", color: "#111",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1D9E75")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF",
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
          

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#9FE1CB" : "#1D9E75",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = "#0F6E56"); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = "#1D9E75"); }}
              onMouseDown={e => { if (!loading) (e.currentTarget.style.transform = "scale(0.99)"); }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                    </path>
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>

         

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 28 }}>
            Having trouble?{" "}
            <a href="mailto:support@medassist.tn" style={{ color: "#1D9E75", textDecoration: "none" }}>
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Responsive helpers */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}