import React, { useEffect, useMemo, useState } from "react";

export default function Doctors() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/doctors");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRows(data);
      } catch {
        setRows([
          {
            _id: "d1",
            fullName: "ThS. B",
            email: "b@mail.com",
            role: "Therapist",
            verified: true,
            specialization: ["CBT", "Trầm cảm"],
          },
          {
            _id: "d2",
            fullName: "BS. C",
            email: "c@mail.com",
            role: "Psychiatrist",
            verified: false,
            specialization: ["Khí sắc"],
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
        r.fullName.toLowerCase().includes(k) ||
        r.email.toLowerCase().includes(k) ||
        r.role.toLowerCase().includes(k)
    );
  }, [rows, q]);

  const setVerify = async (id, verified) => {
    try {
      // await fetch(`http://localhost:5000/api/admin/doctors/${id}/verify`, {method:"PATCH", body:JSON.stringify({verified})})
      setRows((rs) => rs.map((r) => (r._id === id ? { ...r, verified } : r)));
    } catch {}
  };

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-teal-700">Doctors</h1>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, email, role"
          className="px-3 py-2 border rounded-lg w-full placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-auto bg-white border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Họ tên</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Chuyên môn</th>
              <th className="text-left p-3">Verified</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.fullName}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.role}</td>
                <td className="p-3">{r.specialization?.join(", ")}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.verified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.verified ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {r.verified ? (
                    <button
                      onClick={() => setVerify(r._id, false)}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                      Unverify
                    </button>
                  ) : (
                    <button
                      onClick={() => setVerify(r._id, true)}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
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
