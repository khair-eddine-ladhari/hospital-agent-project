


import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ScheduleEntry { day: string; startTime: string; endTime: string }

export default function DoctorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({
    name: "", email: "", password: "", specialty: "",
  });
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    axios.get(`${API_URL}/api/admin/doctors`, { headers })
      .then(res => {
        const doc = res.data.find((d: any) => d._id === id);
        if (doc) {
          setForm({ name: doc.name, email: doc.email, password: "", specialty: doc.specialty || "" });
          setSchedule(doc.schedule || []);
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  const addSchedule = () => {
    setSchedule(prev => [...prev, { day: "Monday", startTime: "08:00", endTime: "17:00" }]);
  };

  const removeSchedule = (i: number) => {
    setSchedule(prev => prev.filter((_, j) => j !== i));
  };

  const updateSchedule = (i: number, field: keyof ScheduleEntry, value: string) => {
    setSchedule(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: any = { ...form, schedule };
      if (isEdit && !payload.password) delete payload.password;

      if (isEdit) {
        await axios.put(`${API_URL}/api/admin/doctors/${id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/api/admin/doctors`, payload, { headers });
      }
      navigate("/admin/doctors");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="doctor-form-header bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4">
        <button onClick={() => navigate("/admin/doctors")} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-medium text-gray-900">{isEdit ? "Edit doctor" : "Add doctor"}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{isEdit ? "Update account details and schedule" : "Create a new doctor account"}</p>
        </div>
      </div>

      <div className="doctor-form-container px-8 py-8 max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Basic info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-gray-900">Account details</h2>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Full name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Sami Ben Ali"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="doctor@medicare.com"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                Password {isEdit && <span className="text-gray-300 font-normal">(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={isEdit ? "••••••••" : "Min. 6 characters"}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Specialty</label>
              <input
                required
                value={form.specialty}
                onChange={e => setForm({ ...form, specialty: e.target.value })}
                placeholder="Cardiologist, General Practitioner…"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Schedule</h2>
              <button
                type="button"
                onClick={addSchedule}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add day
              </button>
            </div>

            {schedule.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-4">No schedule added yet</p>
            )}

            {schedule.map((s, i) => (
              <div key={i} className="schedule-row flex items-center gap-2">
                <select
                  value={s.day}
                  onChange={e => updateSchedule(i, "day", e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500 flex-1"
                >
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <input
                  type="time"
                  value={s.startTime}
                  onChange={e => updateSchedule(i, "startTime", e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500"
                />
                <span className="text-gray-300 text-xs">to</span>
                <input
                  type="time"
                  value={s.endTime}
                  onChange={e => updateSchedule(i, "endTime", e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => removeSchedule(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="doctor-form-actions flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/doctors")}
              className="flex-1 text-sm border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
