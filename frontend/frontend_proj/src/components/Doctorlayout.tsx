


import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { GlobalContext } from "../context/AuthContext.tsx";

const NAV = [
  {
    to: "/doctor/dashboard",
    label: "My Patients",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/doctor/notesresearch",
    label: "Note Search",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];


export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useContext(GlobalContext)!;

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useContext(GlobalContext)!;

  const handleLogout = () => {
    
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DR";

  const SIDEBAR_W = collapsed ? 64 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#F5F6FA" }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            zIndex: 40, display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`doctor-layout-sidebar ${mobileOpen ? "is-open" : ""}`}
        style={{
          width: SIDEBAR_W,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #085041 0%, #0F6E56 60%, #1D9E75 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          zIndex: 50,
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          boxShadow: "4px 0 24px rgba(8,80,65,0.18)",
        }}
      >
        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "20px 0" : "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          minHeight: 64,
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM12 8v8M8 12h8" />
                </svg>
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", whiteSpace: "nowrap" }} onClick={() => navigate("/")}>
                MedAssist
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="desktop-collapse-button"
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6,
              width: 28, height: 28, cursor: "pointer", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              {collapsed
                ? <path d="M9 18l6-6-6-6" />
                : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>

        {/* New encounter button */}
        {!collapsed && (
          <div style={{ padding: "12px 12px 0" }}>
            <button
              onClick={() => navigate("/home")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
            
              Back to Home
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "10px 12px",
                  borderRadius: 8,
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.7)",
                  textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = active ? "white" : "rgba(255,255,255,0.7)";
                }}
              >
                {icon}
                {!collapsed && label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom – user card */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: collapsed ? "12px 0" : "12px",
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 12, fontWeight: 700, color: "white",
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Dr. {user?.name}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.specialty || user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.6)", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          )}
          {collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.6)", padding: 0,
                display: "flex", alignItems: "center", marginTop: 8,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main style={{
        marginLeft: SIDEBAR_W,
        flex: 1,
        minHeight: "100vh",
        transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)",
        display: "flex",
        flexDirection: "column",
      }} className="doctor-layout-main">
        {/* Top bar */}
        <header className="doctor-layout-header" style={{
          height: 56,
          background: "white",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              display: "none",
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "white",
              color: "#374151",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="doctor-layout-date" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#E1F5EE", borderRadius: 20, padding: "4px 10px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
              <span style={{ color: "#0F6E56", fontSize: 12, fontWeight: 500 }}>AI Active</span>
            </div>
          </div>
        </header>

        {/* Page content */}
       <div className="doctor-layout-content" style={{ flex: 1, padding: "28px 28px" }}>
  {children}
</div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
