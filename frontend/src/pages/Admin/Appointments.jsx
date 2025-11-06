import React, { useEffect, useMemo, useState } from "react";

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/appointments");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRows(data);
      } catch {
        setRows([
          {
            _id: "a1",
            userName: "User 1",
            doctorName: "BS. C",
            time: "2025-10-24T07:00:00.000Z",
            status: "upcoming",
          },
          {
            _id: "a2",
            userName: "User 2",
            doctorName: "ThS. B",
            time: "2025-10-20T09:00:00.000Z",
            status: "completed",
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        r.userName.toLowerCase().includes(k) ||
        r.doctorName.toLowerCase().includes(k);
      const matchS = status ? r.status === status : true;
      return matchQ && matchS;
    });
  }, [rows, q, status]);

  const setApptStatus = async (id, st) => {
    try {
      // await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {method:"PATCH", body:JSON.stringify({status: st})})
      setRows((rs) => rs.map((r) => (r._id === id ? { ...r, status: st } : r)));
    } catch {}
  };

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-teal-700">Appointments</h1>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm user/doctor"
          className="px-3 py-2 border rounded-lg w-full placeholder:text-gray-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả</option>
          <option value="upcoming">upcoming</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <div className="overflow-auto bg-white border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">Thời gian</th>
              <th className="text-left p-3">Trạng thái</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.userName}</td>
                <td className="p-3">{r.doctorName}</td>
                <td className="p-3">{new Date(r.time).toLocaleString()}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.status === "upcoming"
                        ? "bg-sky-100 text-sky-700"
                        : r.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => setApptStatus(r._id, "completed")}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => setApptStatus(r._id, "cancelled")}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
