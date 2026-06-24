


import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
const VITE_API_URL=import.meta.env.VITE_API_URL
// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done.current) {
        done.current = true;
        let start = 0;
        const duration = 1200;
        const step = 16;
        const inc = target / (duration / step);
        const iv = setInterval(() => {
          start = Math.min(start + inc, target);
          setVal(Math.round(start));
          if (start >= target) clearInterval(iv);
        }, step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Chat widget ──────────────────────────────────────────────────────────────
interface Message { role: "bot" | "user"; text: string; time: string }

const QUICK_REPLIES: Record<string, string> = {
  "Opening hours?":
    "We're open Monday–Saturday, 8:00 AM–8:00 PM. Emergency services run 24/7. Specialist consultations: 9:00 AM–5:00 PM weekdays.",
  "Available cardiologists":
    "We have 3 cardiologists: Dr. Sami Ben Ali (Mon/Wed/Fri), Dr. Leila Mansouri (Tue/Thu), Dr. Karim Hamdi (Mon–Fri mornings). Want to book?",
  "Book an appointment":
    "Call +216 71 000 000 or use our online portal. Which department do you need?",
};

function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm MediCare's virtual assistant. Ask me about doctors, departments, or appointments.", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggsVisible, setSuggsVisible] = useState(true);


  const bottomRef = useRef<HTMLDivElement>(null);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addMsg(text: string, role: "bot" | "user") {
    setMessages((prev) => [...prev, { role, text, time: now() }]);
  }

  async function handleSend(text: string) {
    if (!text.trim()) return;
    setSuggsVisible(false);
    addMsg(text, "user");
    setTyping(true);

    // Check quick replies first, otherwise hit the real API
    const quick = QUICK_REPLIES[text];
    if (quick) {
      setTimeout(() => { setTyping(false); addMsg(quick, "bot"); }, 1400);
      return;
    }

    try {
      const res = await axios.post(`${VITE_API_URL}/api/services-chat`, {
  query: text,
  history: [],
});
      setTyping(false);
      console.log("API response:", res.data);
      const reply = res.data.response?.answer 
  || res.data.response 
  || res.data.answer 
  || "I'll connect you with our team. Call +216 71 000 000.";

setTyping(false);
addMsg(reply, "bot");

    } catch {
      setTyping(false);
      addMsg("I'm having trouble connecting. Please call +216 71 000 000 for immediate help.", "bot");
    }
  }

 useEffect(() => {
  if (messages.length <= 1) return; // don't scroll on initial load
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, typing]);

  return (
    <div className="w-full max-w-lg mx-auto border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" fill="none" stroke="#0F6E56" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.318 2.798H4.118c-1.348 0-2.318-1.798-1.318-2.798L4.2 15.3" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">MediCare Assistant</p>
          <p className="text-xs text-teal-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
            Online now
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 flex flex-col gap-3 min-h-56 max-h-72 overflow-y-auto bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 max-w-[78%] ${m.role === "user" ? "self-end items-end" : "self-start"}`}>
            <div className={`px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-teal-600 text-white rounded-2xl rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
            }`}>
              {m.text}
            </div>
            <span className="text-[10px] text-gray-400">{m.time}</span>
          </div>
        ))}
        {typing && (
          <div className="self-start bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {suggsVisible && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {Object.keys(QUICK_REPLIES).map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { handleSend(input); setInput(""); } }}
          placeholder="Ask about departments, schedules…"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-gray-400"
        />
        <button
          onClick={() => { handleSend(input); setInput(""); }}
          className="w-9 h-9 rounded-lg bg-teal-600 hover:bg-teal-700 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Send"
        >
          <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0, dir = "up" }: {
  children: React.ReactNode; className?: string; delay?: number; dir?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hiddenStyle = {
    up:    { transform: "translateY(28px)", opacity: 0 },
    left:  { transform: "translateX(-28px)", opacity: 0 },
    right: { transform: "translateX(28px)", opacity: 0 },
    scale: { transform: "scale(0.95)", opacity: 0 },
  }[dir];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...(visible ? { opacity: 1, transform: "none" } : hiddenStyle),
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature card data ────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "📋", title: "AI note structuring", desc: "Extracts symptoms, diagnoses, and medications from free-text. Doctor reviews and confirms in seconds." },
  { icon: "📅", title: "Patient timeline", desc: "Every visit, diagnosis, and prescription in one chronological view. Full history at a glance." },
  { icon: "🔍", title: "Semantic note search", desc: '"Who reported chest pain last week?" — cited answers across all patients, instantly.' },
  { icon: "🤖", title: "Patient Q&A assistant", desc: "Ask anything about a patient's record. Vitals, medications, history — answered from structured data." },
  { icon: "🗓️", title: "Doctor scheduling", desc: "Patients ask about availability, departments, and appointments — handled by an intelligent services bot." },
  { icon: "🔒", title: "Role-based access", desc: "Doctors see only their patients. Admins manage and assign. Every action is auditable." },
];

const STEPS = [
  { n: "1", title: "Doctor writes a note", desc: "Free-text, voice, or dictation — any format. No rigid template required." },
  { n: "2", title: "AI extracts structure", desc: "Symptoms, diagnoses, and medications identified and organized automatically." },
  { n: "3", title: "Doctor reviews", desc: "Edit any field, correct extractions, then confirm. One click saves to the record." },
  { n: "4", title: "Instantly searchable", desc: "The note is indexed across all patients' semantic search in real time." },
];

const TESTIMONIALS = [
  { initials: "SB", name: "Dr. Sami Ben Ali", role: "Cardiologist, Tunis University Hospital", text: "The note structuring alone saved me 45 minutes a day. I can finally focus on the patient sitting in front of me instead of the screen.", date: "May 2025" },
  { initials: "LM", name: "Dr. Leila Mansouri", role: "General Practitioner, Sousse Clinic", text: 'The cross-patient search is a game changer. I asked "who had allergic reactions to penicillin" and had cited answers in three seconds.', date: "April 2025" },
  { initials: "KH", name: "Dr. Karim Hamdi", role: "Internist, Sfax Medical Center", text: "Finally a clinical tool that doesn't feel like it was designed in 2005. Clean, fast, and the AI actually understands medical terminology.", date: "June 2025" },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <Navbar/>
      

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Trusted by 12,000+ clinicians worldwide
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="text-5xl md:text-6xl font-medium leading-tight tracking-tight mb-6">
            Medicine moves fast.<br />
            <span className="text-teal-600">Your notes should too.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-10">
            MediCare AI listens, structures, and summarizes patient encounters in real time — so you can focus entirely on the patient, not the paperwork.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors" onClick={() => navigate("/login")}>
              Doctor Portal
            </button>
            <button className="text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Watch demo
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <Reveal>
        <div className="border-y border-gray-100 py-5 px-10 flex items-center gap-4 flex-wrap justify-center">
          <span className="text-xs text-gray-400 mr-2">Trusted by</span>
          {["Tunis University Hospital", "Sousse Clinic", "Sfax Medical Center", "Monastir CHU", "Nabeul Regional Hospital"].map((h) => (
            <span key={h} className="text-xs font-medium text-gray-500 border border-gray-200 px-4 py-1.5 rounded-full">{h}</span>
          ))}
        </div>
      </Reveal>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100">
        {[
          { target: 12, suffix: "k+", label: "Clinicians using MediCare AI" },
          { target: 98, suffix: "%",  label: "Note accuracy rate" },
          { target: 3,  suffix: "min",label: "Saved per consultation" },
          { target: 40, suffix: "+",  label: "Medical specialties" },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 100} className="border-r border-gray-100 last:border-r-0 py-10 text-center">
            <div className="text-4xl font-medium text-teal-600">
              <StatCounter target={s.target} suffix={s.suffix} />
            </div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Reveal>
        ))}
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="px-10 py-24">
        <Reveal dir="left" className="mb-12">
          <p className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-medium leading-tight tracking-tight">Everything your<br />clinical team needs</h2>
          <p className="text-gray-500 mt-3 max-w-md leading-relaxed">From AI-structured notes to semantic cross-patient search — built for hospitals that can't afford to slow down.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-gray-100 rounded-2xl overflow-hidden">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 80} className="p-7 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-5 text-lg group-hover:bg-teal-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 px-10 py-24">
        <Reveal className="mb-12">
          <p className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-medium leading-tight tracking-tight">
            From consultation to confirmed note<br />in under 2 minutes
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-medium flex items-center justify-center mb-5">{s.n}</div>
              <h3 className="text-sm font-medium mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="px-10 py-24">
        <Reveal className="mb-12">
          <p className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl font-medium leading-tight tracking-tight">Trusted by clinicians</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="border border-gray-100 rounded-2xl p-6 hover:border-teal-200 transition-colors h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-sm font-medium text-teal-700 flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="13" height="13" fill="#EF9F27" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{t.text}</p>
                <p className="text-xs text-gray-300 mt-4">{t.date}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CHAT DEMO ────────────────────────────────────────────────────── */}
      <section className="px-10 pb-24">
        <Reveal className="text-center mb-10">
          <p className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-3">Live demo</p>
          <h2 className="text-4xl font-medium tracking-tight">Talk to our assistant</h2>
          <p className="text-gray-500 mt-3 text-sm">Available 24/7 for patients and visitors.</p>
        </Reveal>
        <Reveal dir="scale">
          <ChatWidget />
        </Reveal>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <div className="mx-10 mb-24">
        <Reveal dir="scale">
          <div className="bg-teal-600 rounded-2xl px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-medium text-white mb-2">Ready to reclaim your time?</h2>
              <p className="text-teal-100 text-sm leading-relaxed">Join 12,000+ clinicians who document smarter, not harder.</p>
            </div>
            <button className="whitespace-nowrap bg-white text-teal-700 font-medium text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0" onClick={() => navigate("/login")}>
              Doctor Portal
            </button>
          </div>
        </Reveal>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
            <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <span className="text-sm font-medium">MediCare AI</span>
        </div>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact", "Docs"].map((l) => (
            <a key={l} href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-gray-300">© 2025 MediCare AI. All rights reserved.</p>
      </footer>
    </div>
  );
}