import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    apptsMonth: 0,
    convRate: 0,
    trendDaily: [], // [{date:'2025-11-01', appts: 12}]
    byRole: [], // [{role:'Counselor', count: 12}, ...]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats");
        if (!res.ok) throw new Error("Fetch stats failed");
        const data = await res.json();
        setStats(data);
      } catch {
        // demo fallback
        setStats({
          users: 8500,
          doctors: 120,
          apptsMonth: 640,
          convRate: 42,
          trendDaily: Array.from({ length: 14 }).map((_, i) => ({
            date: `11-${i + 1}`,
            appts: Math.floor(20 + Math.random() * 30),
          })),
          byRole: [
            { role: "Counselor", count: 48 },
            { role: "Therapist", count: 56 },
            { role: "Psychiatrist", count: 16 },
          ],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Stat = ({ title, value, sub }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold text-teal-700">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-teal-700">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat title="Tổng Users" value={stats.users} />
        <Stat title="Tổng Doctors" value={stats.doctors} />
        <Stat title="Lịch trong tháng" value={stats.apptsMonth} />
        <Stat
          title="Tỉ lệ chuyển đổi"
          value={`${stats.convRate}%`}
          sub="(đã book / đã làm test)"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="font-semibold mb-2">Xu hướng đặt lịch (14 ngày)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendDaily}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="appts"
                  stroke="#14b8a6"
                  fill="url(#c1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="font-semibold mb-2">Phân bổ theo vai trò</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRole}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
