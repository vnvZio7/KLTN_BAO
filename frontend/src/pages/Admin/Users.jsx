import React, { useEffect, useMemo, useState } from "react";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRows(data);
      } catch {
        // demo
        setRows(
          Array.from({ length: 14 }).map((_, i) => ({
            _id: `u${i}`,
            fullName: `User ${i}`,
            email: `user${i}@mail.com`,
            status: i % 5 === 0 ? "blocked" : "active",
            createdAt: "2025-10-01",
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(k) ||
        r.email.toLowerCase().includes(k)
    );
  }, [rows, q]);

  const toggleBlock = async (id, status) => {
    try {
      // await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {method:"PATCH", body:JSON.stringify({status})})
      setRows((rs) => rs.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch {}
  };

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-teal-700">Users</h1>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc email"
          className="px-3 py-2 border rounded-lg w-full placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-auto bg-white border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Họ tên</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Trạng thái</th>
              <th className="text-left p-3">Ngày tạo</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.fullName}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "blocked"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3">{r.createdAt?.slice(0, 10)}</td>
                <td className="p-3 text-right">
                  {r.status !== "blocked" ? (
                    <button
                      onClick={() => toggleBlock(r._id, "blocked")}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleBlock(r._id, "active")}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                      Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
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
