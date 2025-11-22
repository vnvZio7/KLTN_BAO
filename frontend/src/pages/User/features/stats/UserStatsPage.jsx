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
function severityColor(score) {
  if (score == null) return "#CBD5E1"; // slate-300

  if (score <= 4) return "#059669"; // emerald-600
  if (score <= 9) return "#65A30D"; // lime-600
  if (score <= 14) return "#EA580C"; // orange-600
  return "#B91C1C"; // red-700
}
function SimpleLineChart({ points, height = 160 }) {
  const w = 320;
  const h = height;
  const maxY = Math.max(...points) || 1;
  const minY = Math.min(...points) || 0;
  const pad = 10;
  const stepX = (w - pad * 2) / (points.length - 1 || 1);

  const norm = (y) => {
    if (maxY === minY) return h / 2;
    return pad + (h - pad * 2) * (1 - (y - minY) / (maxY - minY));
  };

  // Tạo từng đoạn path theo từng mức độ
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = pad + i * stepX;
    const y1 = norm(points[i]);

    const x2 = pad + (i + 1) * stepX;
    const y2 = norm(points[i + 1]);

    const color = severityColor(points[i + 1]); // dựa trên điểm của đoạn thứ 2

    segments.push(
      <path
        key={i}
        d={`M${x1},${y1} L${x2},${y2}`}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
    );
  }

  return (
    <svg width={w} height={h} className="overflow-visible">
      {segments}

      {points.map((y, i) => {
        const cx = pad + i * stepX;
        const cy = norm(y);
        const color = severityColor(y);

        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="4" fill={color} />
            <text
              x={cx}
              y={cy - 8}
              fontSize="10"
              textAnchor="middle"
              fill={color}
              fontWeight="600"
            >
              {y}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Phân loại mức độ PHQ-9
function classifyPHQ9(score) {
  if (score == null) return { label: "Chưa có", tone: "text-slate-400" };
  if (score <= 4) return { label: "Bình thường", tone: "text-emerald-600" };
  if (score <= 9) return { label: "Nhẹ", tone: "text-lime-600" };
  if (score <= 14) return { label: "Trung bình", tone: "text-amber-600" };
  return { label: "Rất nặng", tone: "text-rose-600" };
}

// Phân loại mức độ GAD-7
function classifyGAD7(score) {
  if (score == null) return { label: "Chưa có", tone: "text-slate-400" };
  if (score <= 4) return { label: "Bình thường", tone: "text-emerald-600" };
  if (score <= 9) return { label: "Nhẹ", tone: "text-lime-600" };
  if (score <= 14) return { label: "Trung bình", tone: "text-amber-600" };
  return { label: "Nặng", tone: "text-rose-600" };
}

export default function UserStatsPage({ appointments = [], messages = [] }) {
  const stats = MOCK_STATS;

  const doneTasks = stats.tasksDone;
  const totalTasks = stats.tasksTotal;
  const adherence = Math.round((doneTasks / Math.max(totalTasks, 1)) * 100);

  // derive KPIs from inputs
  const sessionsCompleted = stats.sessionsCompleted;
  const upcomingSessions = stats.upcomingSessions;
  const totalMessages = messages.length;

  // Lấy điểm test gần nhất từ mảng phq9, gad7
  const lastPhqScore =
    Array.isArray(stats.phq9) && stats.phq9.length > 0
      ? stats.phq9[stats.phq9.length - 1]
      : null;
  const lastGadScore =
    Array.isArray(stats.gad7) && stats.gad7.length > 0
      ? stats.gad7[stats.gad7.length - 1]
      : null;

  const phqInfo = classifyPHQ9(lastPhqScore);
  const gadInfo = classifyGAD7(lastGadScore);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Thống kê của bạn</h2>
          <p className="text-slate-600 text-sm">
            Theo dõi tiến trình trị liệu, thói quen và điểm kiểm tra.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <Card
          title="Hoàn thành bài tập"
          value={`${doneTasks}/${totalTasks}`}
          sub={`${adherence}% hoàn thành`}
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
        <Card
          title="Số dư còn lại"
          value={`${stats.streakDays} ngày`}
          sub="Tổng tiền còn lại trong hệ thống"
        />
      </section>

      {/* Biểu đồ + bảng test gần nhất */}
      <section className="grid lg:grid-cols-3 gap-4">
        {/* Card biểu đồ: chiếm 2 cột */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 my-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Điểm PHQ-9 & GAD-7 theo thời gian</h3>
            <div className="text-xs text-slate-500">Càng thấp càng tốt</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-sm text-slate-600 mb-1">PHQ-9</div>
              <SimpleLineChart points={stats.phq9 || []} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">GAD-7</div>
              <SimpleLineChart points={stats.gad7 || []} />
            </div>
          </div>
        </div>

        {/* Bảng nhỏ: bài test gần nhất */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 my-4 flex flex-col gap-3">
          <h3 className="font-semibold text-sm mb-1">Bài test gần nhất</h3>
          <p className="text-xs text-slate-500">
            Tóm tắt nhanh lần làm test gần đây nhất của bạn.
          </p>

          <div className="mt-2 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-500">
                  PHQ-9 (Trầm cảm)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold">
                    {lastPhqScore ?? "—"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full bg-slate-50 ${phqInfo.tone}`}
                  >
                    {phqInfo.label}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">Tối đa 27</div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-500">
                  GAD-7 (Lo âu)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold">
                    {lastGadScore ?? "—"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full bg-slate-50 ${gadInfo.tone}`}
                  >
                    {gadInfo.label}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">Tối đa 21</div>
            </div>
          </div>

          {/* Gợi ý nhỏ */}
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Nếu điểm số tăng lên rõ rệt hoặc ở mức nặng, hãy cân nhắc trao đổi
            thêm với chuyên gia trị liệu của bạn.
          </div>
        </div>
      </section>
    </div>
  );
}
