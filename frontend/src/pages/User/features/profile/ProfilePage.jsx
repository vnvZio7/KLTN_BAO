import React, { useState } from "react";

function TextInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Chọn…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
export default function ProfilePage({ user, setUser }) {
  const [form, setForm] = useState(user);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setUser(form);
    alert("Đã lưu thông tin cá nhân");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <TextInput
              label="Họ và tên"
              value={form.fullName}
              onChange={(v) => update("fullName", v)}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChange={(v) => update("email", v)}
            />
            <TextInput
              label="Số điện thoại"
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />
            <TextInput
              label="Ngày sinh"
              type="date"
              value={form.dob}
              onChange={(v) => update("dob", v)}
            />
            <Select
              label="Giới tính"
              value={form.gender}
              onChange={(v) => update("gender", v)}
              options={["Nam", "Nữ", "Khác"]}
            />
            <Select
              label="Ngôn ngữ ưu tiên"
              value={form.lang}
              onChange={(v) => update("lang", v)}
              options={["Việt", "English", "Korean"]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[100px]"
              placeholder="Tóm tắt tình trạng, mục tiêu trị liệu…"
              value={form.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Lưu
            </button>
            <button
              onClick={() => setForm(user)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              Hoàn tác
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>
          <div className="aspect-square rounded-2xl border border-dashed border-slate-300 grid place-content-center text-slate-500">
            {/* Placeholder ảnh – bạn nối upload sau */}
            <div className="text-center text-sm">
              Kéo/thả ảnh vào đây
              <div className="text-xs">(Chưa triển khai upload)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
