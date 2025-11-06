import React, { useMemo, useState } from "react";
import { MOCK_STATS } from "../../../../utils/data";

function Card({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function SimpleBarChart({ labels, values, max = 100, height = 120 }) {
  const maxVal = Math.max(max, ...values);
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-2 h-[]" style={{ height }}>
        {values.map((v, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end min-w-[32px]"
          >
            <div
              className="w-6 rounded-t-lg bg-indigo-600"
              style={{ height: `${(v / maxVal) * (height - 24)}px` }}
            />
            <div className="text-[10px] mt-1 text-slate-600">{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleLineChart({ points, height = 160 }) {
  const w = 280;
  const h = height;
  const maxY = Math.max(...points) || 1;
  const minY = Math.min(...points) || 0;
  const pad = 10;
  const stepX = (w - pad * 2) / (points.length - 1 || 1);
  const norm = (y) => {
    if (maxY === minY) return h / 2;
    return pad + (h - pad * 2) * (1 - (y - minY) / (maxY - minY));
  };
  const d = points
    .map((y, i) => `${i === 0 ? "M" : "L"}${pad + i * stepX},${norm(y)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        className="text-indigo-600"
        strokeWidth="2"
      />
      {points.map((y, i) => (
        <circle
          key={i}
          cx={pad + i * stepX}
          cy={norm(y)}
          r="3"
          className="fill-indigo-600"
        />
      ))}
    </svg>
  );
}

export default function UserStatsPage({ appointments = [], messages = [] }) {
  const [range, setRange] = useState("7d");
  const stats = MOCK_STATS;

  const doneTasks = stats.tasksDone;
  const totalTasks = stats.tasksTotal;
  const adherence = Math.round((doneTasks / Math.max(totalTasks, 1)) * 100);

  const weekly = stats.weekly;

  // derive KPIs from inputs
  const sessionsCompleted = stats.sessionsCompleted;
  const upcomingSessions = stats.upcomingSessions;
  const totalMessages = messages.length;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Thống kê của bạn</h2>
          <p className="text-slate-600 text-sm">
            Theo dõi tiến trình trị liệu, thói quen và điểm kiểm tra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <Card
          title="Hoàn thành bài tập"
          value={`${doneTasks}/${totalTasks}`}
          sub={`${adherence}% hoàn thành`}
        />
        <Card
          title="Chuỗi ngày duy trì"
          value={`${stats.streakDays} ngày`}
          sub="Ngày liên tiếp hoàn thành thói quen"
        />
        <Card
          title="Buổi đã hoàn thành"
          value={sessionsCompleted}
          sub={`${upcomingSessions} buổi sắp tới`}
        />
        <Card
          title="Tin nhắn đã trao đổi"
          value={totalMessages}
          sub="Tổng số trong thời gian chọn"
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Điểm PHQ‑9 & GAD‑7 (tuần)</h3>
            <div className="text-xs text-slate-500">Càng thấp càng tốt</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-sm text-slate-600 mb-1">PHQ‑9</div>
              <SimpleLineChart points={stats.phq9} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">GAD‑7</div>
              <SimpleLineChart points={stats.gad7} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Thực hành & Giấc ngủ (tuần)</h3>
            <div className="text-xs text-slate-500">Phút tập và giờ ngủ</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Phút thực hành</div>
              <SimpleBarChart
                labels={weekly.labels}
                values={weekly.practiceMinutes}
                max={20}
              />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Giờ ngủ</div>
              <SimpleBarChart
                labels={weekly.labels}
                values={weekly.sleepHours}
                max={9}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Tâm trạng trong tuần</h3>
          <div className="text-xs text-slate-500">Thang 1–10</div>
        </div>
        <SimpleBarChart labels={weekly.labels} values={weekly.mood} max={10} />
      </section>
    </div>
  );
}
