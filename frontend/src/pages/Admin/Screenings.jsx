import React, { useEffect, useMemo, useState } from "react";

export default function Screenings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/screenings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRows(data);
      } catch {
        setRows([
          {
            _id: "s1",
            userName: "User 1",
            phqScore: 12,
            gadScore: 6,
            suggested: "Therapist",
            createdAt: "2025-10-21",
          },
          {
            _id: "s2",
            userName: "User 2",
            phqScore: 3,
            gadScore: 2,
            suggested: "None",
            createdAt: "2025-10-22",
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.userName.toLowerCase().includes(k) ||
        String(r.suggested).toLowerCase().includes(k)
    );
  }, [rows, q]);

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-teal-700">Screenings</h1>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo user / suggested role"
          className="px-3 py-2 border rounded-lg w-full placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-auto bg-white border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">PHQ-9</th>
              <th className="text-left p-3">GAD-7</th>
              <th className="text-left p-3">Đề xuất</th>
              <th className="text-left p-3">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.userName}</td>
                <td className="p-3">{r.phqScore}</td>
                <td className="p-3">{r.gadScore}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.suggested === "Counselor"
                        ? "bg-indigo-100 text-indigo-700"
                        : r.suggested === "Therapist"
                        ? "bg-amber-100 text-amber-700"
                        : r.suggested === "Psychiatrist"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.suggested}
                  </span>
                </td>
                <td className="p-3">{r.createdAt}</td>
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
