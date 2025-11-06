import React from "react";
import { currency } from "../../../../utils/helper";

function Tag({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full border border-slate-300 text-slate-700 bg-white">
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
export default function DoctorInfoPage({ doctor, onGoSchedule, onSwitch }) {
  if (!doctor) return null;
  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{doctor.name}</h2>
              <Tag>{doctor.specialty}</Tag>
              <Tag>{doctor.gender}</Tag>
            </div>
            <div className="text-slate-600 text-sm mt-1">
              Ngôn ngữ: {doctor.languages?.join(", ")}
            </div>
            <div className="text-slate-700 mt-2">{doctor.bio}</div>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-700">
              <div>⭐ {doctor.rating}</div>
              <div>👥 {doctor.patients} bệnh nhân</div>
              <div>💳 {currency(doctor.price)}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onGoSchedule}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Đặt lịch
            </button>
            <button
              onClick={() => onSwitch?.(doctor)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              Đổi bác sĩ
            </button>
          </div>
        </div>
      </section>

      <Section
        title="Khung giờ đề xuất"
        right={
          <div className="text-sm text-slate-500">Theo múi giờ hệ thống</div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {(doctor.nextSlots || []).map((s) => (
            <button
              key={s}
              onClick={onGoSchedule}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              {new Date(s).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Chuyên môn & phương pháp">
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Liệu pháp Nhận thức – Hành vi (CBT)</li>
          <li>Chánh niệm – Thở 4‑7‑8, thư giãn cơ</li>
          <li>Theo dõi giấc ngủ & hành vi</li>
        </ul>
      </Section>

      <Section title="Chứng chỉ & kinh nghiệm">
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>10+ năm thực hành lâm sàng</li>
          <li>Chứng chỉ CBT, ACT được công nhận</li>
          <li>Tham gia đào tạo kỹ thuật viên sức khỏe tâm lý</li>
        </ul>
      </Section>

      <Section title="Đánh giá gần đây">
        <div className="space-y-3">
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-sm text-slate-600">
              Người dùng ẩn danh • 2 tuần trước
            </div>
            <div className="mt-1">
              “Bác sĩ giải thích rõ ràng, bài tập dễ áp dụng, sau 2 tuần mình
              ngủ tốt hơn.”
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-3">
            <div className="text-sm text-slate-600">
              Người dùng ẩn danh • 1 tháng trước
            </div>
            <div className="mt-1">
              “Buổi online đúng giờ, thái độ thân thiện, chuyên nghiệp.”
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
