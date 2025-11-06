import React, { useMemo, useState } from "react";
import { DOCTORS } from "../../../../utils/data";
import { currency } from "../../../../utils/helper";

export default function SwitchDoctorPage({ currentDoctor, onSwitch }) {
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [spec, setSpec] = useState("all");

  const filtered = useMemo(() => {
    return DOCTORS.filter(
      (d) =>
        (spec === "all" || d.specialty === spec) &&
        (gender === "all" || d.gender === gender) &&
        (q.trim() === "" || d.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, gender, spec]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">Đổi bác sĩ</h2>
        <p className="text-slate-600 mb-4">
          Bác sĩ hiện tại:{" "}
          <span className="font-medium">{currentDoctor.name}</span>
        </p>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input
            className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Tìm theo tên bác sĩ"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
          >
            <option value="all">Tất cả chuyên môn</option>
            <option value="Psychiatrist">Psychiatrist</option>
            <option value="Therapist">Therapist</option>
            <option value="Counselor">Counselor</option>
          </select>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="border border-slate-200 rounded-2xl p-4 bg-white"
            >
              <div className="flex gap-3 items-start">
                <img
                  src={d.avatar}
                  alt={d.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-slate-600">
                    {d.specialty} · {d.gender}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{d.bio}</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-3">
                    <span>⭐ {d.rating}</span>
                    <span>👥 {d.patients} bệnh nhân</span>
                    <span>💬 {d.languages.join(", ")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">
                  {currency(d.price)}/30′
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                    onClick={() => alert("Xem hồ sơ chi tiết – TODO")}
                  >
                    Hồ sơ
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => onSwitch(d)}
                  >
                    Chọn bác sĩ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
