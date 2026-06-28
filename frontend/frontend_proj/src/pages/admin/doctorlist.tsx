import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string | null;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function DoctorList() {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/doctors`, { headers })
      .then((res) => setDoctors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/admin/doctors/${deleteId}`, { headers });
      setDoctors((prev) => prev.filter((d) => d._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="admin-header bg-white border-b border-gray-100 px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-400 mt-0.5">{doctors.length} registered</p>
        </div>
        <div className="admin-header-actions flex items-center gap-3">
          <button
            onClick={() => { ctx?.logout(); }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
          <button
            onClick={() => navigate("/admin/doctors/new")}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span>+</span> Add doctor
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">
        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No doctors found.</div>
        ) : (
          <div className="admin-table-wrap bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Doctor
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Specialty
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Joined
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr
                    key={d._id}
                    className={`${i !== filtered.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 text-xs font-semibold flex-shrink-0">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{d.name}</p>
                          <p className="text-gray-400 text-xs">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {d.specialty ? (
                        <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {d.specialty}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(d.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/doctors/${d._id}/edit`)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(d._id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:border-red-200 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Delete doctor?</h2>
            <p className="text-sm text-gray-400 mb-5">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
