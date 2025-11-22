import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";

/* ---------- Helpers ---------- */
const toDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};
const isFuture = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d > today;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const pwRule = (s) =>
  /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && s.length >= 8;

/* ---------- Inputs ---------- */
function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
  disabled,
}) {
  const isDisabled = disabled || readOnly;
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type={type}
        className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
          isDisabled
            ? "bg-slate-50 border-slate-200 text-slate-600"
            : "border-slate-300"
        }`}
        value={value ?? ""}
        onChange={(e) => !isDisabled && onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={!!readOnly}
        disabled={!!disabled}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], disabled }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <select
        className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
          disabled
            ? "bg-slate-50 border-slate-200 text-slate-600"
            : "border-slate-300"
        }`}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={!!disabled}
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

/* ---------- Modal đổi mật khẩu ---------- */
function PasswordModal({ open, onClose, onSubmit }) {
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [cfPw, setCfPw] = useState("");
  const [show, setShow] = useState({ cur: false, nw: false, cf: false });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!open) {
      setCurPw("");
      setNewPw("");
      setCfPw("");
      setErrors([]);
    }
  }, [open]);

  const validate = () => {
    const err = [];
    if (!curPw) err.push("Vui lòng nhập mật khẩu hiện tại.");
    if (!pwRule(newPw))
      err.push("Mật khẩu mới phải ≥8 ký tự, có chữ hoa, chữ thường và số.");
    if (newPw !== cfPw) err.push("Xác nhận mật khẩu không khớp.");
    setErrors(err);
    return err.length === 0;
  };

  const doSubmit = () => {
    if (!validate()) return;
    onSubmit?.({ currentPassword: curPw, newPassword: newPw });
    onClose?.();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <div className="font-medium mb-1">Vui lòng kiểm tra:</div>
            <ul className="list-disc pl-5">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {[
          {
            k: "cur",
            label: "Mật khẩu hiện tại",
            val: curPw,
            set: setCurPw,
            ph: "Nhập mật khẩu hiện tại",
          },
          {
            k: "nw",
            label: "Mật khẩu mới",
            val: newPw,
            set: setNewPw,
            ph: "≥8 ký tự, có Hoa, thường & số",
          },
          {
            k: "cf",
            label: "Xác nhận mật khẩu mới",
            val: cfPw,
            set: setCfPw,
            ph: "Nhập lại mật khẩu mới",
          },
        ].map(({ k, label, val, set, ph }) => (
          <div key={k} className="mb-3">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="relative">
              <input
                type={show[k] ? "text" : "password"}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 placeholder:text-gray-600"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600"
              >
                {show[k] ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeOffIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            onClick={doSubmit}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Lưu mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Trang chính ---------- */
export default function ProfilePage({ user = {} }) {
  // Chỉ các trường trong schema:
  const init = useMemo(
    () => ({
      fullName: user.accountId.fullName ?? "",
      email: user.accountId.email ?? "",
      phone: user.accountId.phone ?? "",
      gender: user.accountId.gender ?? "",
      birthDate: user.accountId.birthDate
        ? toDateInput(user.accountId.birthDate)
        : "",
    }),
    [user]
  );

  const [form, setForm] = useState(init);
  const [snapshot, setSnapshot] = useState(init);
  const [errors, setErrors] = useState([]);
  const [pwOpen, setPwOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const setUser = (user) => {};

  // đồng bộ khi prop user đổi (nếu đang không chỉnh)
  useEffect(() => {
    if (!isEditing) {
      setForm(init);
      setSnapshot(init);
    }
  }, [init, isEditing]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const err = [];
    if (!form.fullName?.trim()) err.push("Họ và tên là bắt buộc.");
    if (!emailRegex.test(form.email || "")) err.push("Email không hợp lệ.");
    if (form.gender && !["Nam", "Nữ", "Khác"].includes(form.gender))
      err.push("Giới tính không hợp lệ.");
    if (form.birthDate && isFuture(form.birthDate))
      err.push("Ngày sinh không được ở tương lai.");
    setErrors(err);
    return err.length === 0;
  };

  const onEdit = () => {
    setSnapshot(form); // lưu bản hiện tại
    setIsEditing(true);
    setErrors([]);
  };

  const onCancel = () => {
    setForm(snapshot); // khôi phục
    setIsEditing(false);
    setErrors([]);
  };

  const onSave = async () => {
    if (!validate()) return;
    const payload = {
      fullName: form.fullName?.trim(),
      email: form.email?.trim(), // vẫn read-only nhưng giữ đồng bộ
      phone: form.phone?.trim(),
      gender: form.gender || null,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
    };
    setUser?.({ ...user, ...payload });
    setIsEditing(false);
    alert("Đã lưu thông tin tài khoản");
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    // TODO: API change password
    alert("Đổi mật khẩu thành công");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setPwOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Chỉnh sửa
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Lưu
              </button>
            </>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="font-medium mb-1">Vui lòng kiểm tra lại:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <TextInput
          label="Họ và tên *"
          value={form.fullName}
          onChange={(v) => update("fullName", v)}
          placeholder="Nguyễn Văn A"
          readOnly={!isEditing}
        />
        {/* Email luôn chỉ xem */}
        <TextInput
          label="Email (chỉ xem)"
          value={form.email}
          type="email"
          readOnly
        />
        <TextInput
          label="Số điện thoại"
          value={form.phone}
          onChange={(v) => update("phone", v)}
          type="tel"
          placeholder="090xxxxxxx"
          readOnly={!isEditing}
        />
        <Select
          label="Giới tính"
          value={form.gender}
          onChange={(v) => update("gender", v)}
          options={["Nam", "Nữ", "Khác"]}
          disabled={!isEditing}
        />
        <TextInput
          label="Ngày sinh"
          type="date"
          value={form.birthDate}
          onChange={(v) => update("birthDate", v)}
          disabled={!isEditing} // date input nên dùng disabled để chặn mở lịch
        />
      </div>

      <PasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        onSubmit={changePassword}
      />
    </div>
  );
}
