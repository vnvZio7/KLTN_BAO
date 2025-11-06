import React from "react";
import { prettyTime } from "../../../../utils/helper";

export default function PlanPage({ plan }) {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">Tổng quan liệu trình</h2>
        <p className="text-slate-600">{plan.diagnosisHint}</p>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {plan.goals.map((g) => (
            <div key={g.id} className="border border-slate-200 rounded-2xl p-4">
              <div className="font-medium mb-2">{g.title}</div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${g.progress * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {Math.round(g.progress * 100)}% hoàn thành
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-1">Buổi trị liệu</h3>
          <p className="text-slate-600 mb-4">Lịch sử & sắp tới</p>
          <div className="space-y-3">
            {plan.sessions.map((s) => (
              <div
                key={s.id}
                className="border border-slate-200 rounded-xl p-3 flex items-start justify-between"
              >
                <div>
                  <div className="font-medium">{s.type}</div>
                  <div className="text-sm text-slate-600">
                    {prettyTime(s.date)}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    Ghi chú: {s.notes}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    s.status === "done"
                      ? "bg-slate-100 text-slate-700 border border-slate-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {s.status === "done" ? "Đã xong" : "Sắp tới"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-1">Bài tập & Việc cần làm</h3>
          <p className="text-slate-600 mb-4">Được giao bởi bác sĩ</p>
          <div className="space-y-3">
            {plan.tasks.map((t) => (
              <label
                key={t.id}
                className="flex items-start gap-3 border border-slate-200 rounded-xl p-3"
              >
                <input
                  type="checkbox"
                  defaultChecked={t.done}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-slate-600">
                    Hạn: {new Date(t.due).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-1">Thuốc/Can thiệp y khoa</h3>
        {plan.medication.prescribed ? (
          <ul className="list-disc pl-5 text-slate-700">
            {plan.medication.items.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600">Chưa có chỉ định thuốc.</p>
        )}
      </section>
    </div>
  );
}
