import React, { useMemo, useRef, useState } from "react";
import { EyeIcon, EyeOffIcon, CheckCircle2, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.~#^_+\-=])[A-Za-z\d@$!%*?&.~#^_+\-=]{8,}$/;

const csvToArray = (t) =>
  String(t || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function logFormData(fd) {
  for (const [key, value] of fd.entries()) {
    if (value instanceof Blob) {
      if (value.type === "application/json") {
        value.text().then((txt) => {
          try {
            console.log(`🟦 ${key} (JSON):`, JSON.parse(txt));
          } catch {
            console.log(`🟦 ${key} (text):`, txt);
          }
        });
      } else {
        console.log(`🟨 ${key} (File):`, value.name, value.type, value.size);
      }
    } else {
      console.log(`🟩 ${key}:`, value);
    }
  }
}

export default function Register() {
  const [step, setStep] = useState(1); // 1: common, 2: doctor
  const [accountType, setAccountType] = useState("user"); // 'user' | 'doctor'
  const [form, setForm] = useState({
    // common
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    gender: "",
    birthDate: "",
    // doctor
    role: "", // counselor | therapist | psychiatrist
    specializationsText: "",
    modalitiesText: "",
    yearsExperience: "",
    bio: "",
    certificatesFiles: [], // File[]
  });
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refs = {
    fullName: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirm: useRef(null),
    gender: useRef(null),
    birthDate: useRef(null),
    // doctor
    role: useRef(null),
    specializationsText: useRef(null),
    modalitiesText: useRef(null),
    yearsExperience: useRef(null),
    bio: useRef(null),
    certificatesFiles: useRef(null),
  };

  const isStrong = passwordRegex.test(form.password);
  const match = form.confirm && form.confirm === form.password;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isInvalid = (name) =>
    touched[name] && (!form[name] || !String(form[name]).trim());

  const focusField = (field) => {
    refs[field]?.current?.focus?.();
    refs[field]?.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });
    setTouched((p) => ({ ...p, [field]: true }));
  };

  // ===== VALIDATION =====
  const validateStep1 = () => {
    const { fullName, email, password, confirm, gender, birthDate } = form;
    if (!fullName.trim()) return focusField("fullName"), false;
    if (!email.trim()) return focusField("email"), false;
    if (!password) return focusField("password"), false;
    if (!confirm) return focusField("confirm"), false;
    if (!gender) return focusField("gender"), false;
    if (!birthDate) return focusField("birthDate"), false;
    if (!isStrong)
      return (
        setError("Mật khẩu chưa đạt yêu cầu bảo mật."),
        focusField("password"),
        false
      );
    if (!match)
      return (
        setError("Xác nhận mật khẩu không khớp."), focusField("confirm"), false
      );
    if (!agree)
      return setError("Vui lòng đồng ý Điều khoản & Chính sách."), false;
    setError("");
    return true;
  };

  // Bước 2: MỌI TRƯỜNG BẮT BUỘC
  const validateStep2 = () => {
    if (!form.role) {
      setError("Vui lòng chọn Vai trò (role).");
      return focusField("role"), false;
    }
    const specs = csvToArray(form.specializationsText);
    if (specs.length === 0) {
      setError("Vui lòng nhập ít nhất 1 Chuyên môn (specializations).");
      return focusField("specializationsText"), false;
    }
    const mods = csvToArray(form.modalitiesText);
    if (mods.length === 0) {
      setError("Vui lòng nhập ít nhất 1 Phương pháp (modalities).");
      return focusField("modalitiesText"), false;
    }
    if (String(form.yearsExperience || "").trim() === "") {
      setError("Vui lòng nhập Số năm kinh nghiệm.");
      return focusField("yearsExperience"), false;
    }
    const n = Number(form.yearsExperience);
    if (Number.isNaN(n) || n < 0) {
      setError("Số năm kinh nghiệm không hợp lệ.");
      return focusField("yearsExperience"), false;
    }
    if (!form.bio.trim()) {
      setError("Vui lòng nhập Giới thiệu ngắn (bio).");
      return focusField("bio"), false;
    }
    if (
      !Array.isArray(form.certificatesFiles) ||
      form.certificatesFiles.length === 0
    ) {
      setError("Vui lòng upload ít nhất 1 ảnh Chứng chỉ.");
      setTouched((p) => ({ ...p, certificatesFiles: true }));
      refs.certificatesFiles?.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    setError("");
    return true;
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      password: "",
      confirm: "",
      phone: "",
      gender: "",
      birthDate: "",
      role: "",
      specializationsText: "",
      modalitiesText: "",
      yearsExperience: "",
      bio: "",
      certificatesFiles: [],
    });
    setAgree(false);
    setTouched({});
    setStep(1);
    setAccountType("user");
  };

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // 🔹 build dữ liệu chung
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone?.trim() || undefined,
        gender: form.gender,
        birthDate: form.birthDate,
        role: accountType, // "user" hoặc "doctor"
      };

      // 🔹 nếu là doctor thì thêm phần profile
      if (accountType === "doctor") {
        payload.profile = {
          role: form.role, // counselor | therapist | psychiatrist
          specializations: csvToArray(form.specializationsText),
          modalities: csvToArray(form.modalitiesText),
          yearsExperience: Number(form.yearsExperience),
          bio: form.bio.trim(),
        };
      }

      // 🔹 tạo FormData dùng chung
      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

      if (accountType === "doctor" && form.certificatesFiles?.length) {
        form.certificatesFiles.forEach((file) =>
          fd.append("certificates", file)
        );
      }

      logFormData(fd);
      // 🔹 Gửi chỉ 1 lần duy nhất
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: fd, // KHÔNG cần set headers
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại!");
      console.log("✅ Kết quả:", data);

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      resetForm();
    } catch (e) {
      setError(e.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (accountType === "user") {
      if (!validateStep1()) return;
      submit();
    } else {
      if (step === 1) {
        if (!validateStep1()) return;
        setStep(2);
      } else {
        if (!validateStep2()) return;
        submit();
      }
    }
  };

  const Rule = ({ ok, text }) => (
    <li className={ok ? "text-green-600" : "text-gray-500 italic"}>• {text}</li>
  );

  const primaryBtnClass =
    accountType === "doctor" && step === 2
      ? "px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
      : "w-full py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50";

  const showCertError =
    accountType === "doctor" &&
    step === 2 &&
    touched.certificatesFiles &&
    (!Array.isArray(form.certificatesFiles) ||
      form.certificatesFiles.length === 0);

  return (
    <div className="register-form min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-2">
          Đăng ký tài khoản
        </h1>
        <p className="text-center text-gray-500 mb-3">
          {accountType === "doctor" && step === 2
            ? "Bổ sung thông tin chuyên môn (Bác sĩ)."
            : "Nhập thông tin cơ bản của bạn."}
        </p>

        {/* Toggle loại tài khoản */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={() => {
              setAccountType("user");
              setStep(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              accountType === "user"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Người dùng
          </button>
          <button
            type="button"
            onClick={() => setAccountType("doctor")}
            className={`px-4 py-2 rounded-lg border transition ${
              accountType === "doctor"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Bác sĩ
          </button>
        </div>

        {/* Thanh tiến trình chỉ hiện khi doctor */}
        {accountType === "doctor" && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className={`h-2 w-20 rounded-full ${
                step >= 1 ? "bg-teal-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 w-20 rounded-full ${
                step >= 2 ? "bg-teal-500" : "bg-gray-200"
              }`}
            />
          </div>
        )}

        <form
          onSubmit={handleNextOrSubmit}
          className="grid md:grid-cols-2 gap-3"
        >
          {/* ===== BƯỚC 1: COMMON ===== */}
          {step === 1 && (
            <>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Họ và tên *
                </label>
                <input
                  ref={refs.fullName}
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, fullName: true })}
                  placeholder="VD: Nguyễn Văn A"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("fullName")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email *
                </label>
                <input
                  ref={refs.email}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("email")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="VD: 0901234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Giới tính *
                </label>
                <select
                  ref={refs.gender}
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, gender: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("gender")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ngày sinh *
                </label>
                <input
                  ref={refs.birthDate}
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, birthDate: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("birthDate")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu *
                </label>
                <input
                  ref={refs.password}
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none pr-10 ${
                    isInvalid("password")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-[42px] text-gray-500 hover:text-teal-600"
                >
                  {showPw ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <Rule ok={form.password.length >= 8} text="Ít nhất 8 ký tự" />
                  <Rule
                    ok={/[A-Z]/.test(form.password)}
                    text="Có chữ hoa (A–Z)"
                  />
                  <Rule
                    ok={/[a-z]/.test(form.password)}
                    text="Có chữ thường (a–z)"
                  />
                  <Rule ok={/\d/.test(form.password)} text="Có số (0–9)" />
                  <Rule
                    ok={/[@$!%*?&.~#^_+\-=]/.test(form.password)}
                    text="Có ký tự đặc biệt (@$!%*?&)"
                  />
                </ul>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu *
                </label>
                <input
                  ref={refs.confirm}
                  type={showPw2 ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, confirm: true })}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none pr-10 ${
                    isInvalid("confirm")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2(!showPw2)}
                  className="absolute right-3 top-[42px] text-gray-500 hover:text-teal-600"
                >
                  {showPw2 ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {form.confirm && (
                  <div
                    className={`flex items-center gap-1 text-xs mt-1 ${
                      match ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {match ? "Khớp mật khẩu" : "Không khớp"}
                  </div>
                )}
              </div>

              <label className="md:col-span-2 flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="/terms" className="text-teal-600 hover:underline">
                    Điều khoản & Chính sách
                  </a>
                  .
                </span>
              </label>
            </>
          )}

          {/* ===== BƯỚC 2: DOCTOR ===== */}
          {accountType === "doctor" && step === 2 && (
            <>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Thông tin chuyên môn (Bác sĩ)
                </h3>
                <p className="text-xs text-gray-500">
                  Các trường danh sách nhập bằng dấu phẩy, ví dụ:{" "}
                  <i>Trầm cảm, Lo âu, CBT</i>
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Vai trò *
                </label>
                <select
                  ref={refs.role}
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, role: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("role")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                >
                  <option value="">-- Chọn vai trò --</option>
                  <option value="counselor">Counselor</option>
                  <option value="therapist">Therapist</option>
                  <option value="psychiatrist">Psychiatrist</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Chuyên môn *
                </label>
                <input
                  ref={refs.specializationsText}
                  type="text"
                  name="specializationsText"
                  value={form.specializationsText}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, specializationsText: true })
                  }
                  placeholder="VD: Trầm cảm, Lo âu, Mất ngủ, Hôn nhân"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("specializationsText")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nhập nhiều mục, cách nhau dấu phẩy.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Phương pháp *
                </label>
                <input
                  ref={refs.modalitiesText}
                  type="text"
                  name="modalitiesText"
                  value={form.modalitiesText}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, modalitiesText: true })
                  }
                  placeholder="VD: CBT, ACT, Mindfulness, Family, Trauma-focused"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("modalitiesText")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số năm kinh nghiệm *
                </label>
                <input
                  ref={refs.yearsExperience}
                  type="number"
                  min={0}
                  name="yearsExperience"
                  value={form.yearsExperience}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, yearsExperience: true })
                  }
                  placeholder="VD: 8"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("yearsExperience")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>

              <div className="md:col-span-1" ref={refs.certificatesFiles}>
                <label className="block text-gray-700 font-medium mb-2">
                  Chứng chỉ (ảnh) *
                </label>
                <input
                  type="file"
                  name="certificates"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm((prev) => ({ ...prev, certificatesFiles: files }));
                    setTouched((p) => ({ ...p, certificatesFiles: true }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    showCertError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
                <p
                  className={`mt-1 text-xs ${
                    showCertError ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {showCertError
                    ? "Cần tải lên ít nhất 1 ảnh chứng chỉ."
                    : "Có thể chọn nhiều ảnh. (Gửi bằng FormData)"}
                </p>
              </div>

              <div className="md:col-span-1">
                {Array.isArray(form.certificatesFiles) &&
                  form.certificatesFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {form.certificatesFiles.map((file, i) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt={`cert-${i}`}
                              className="w-full h-20 object-cover rounded-lg border"
                              onLoad={() => URL.revokeObjectURL(url)}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  certificatesFiles:
                                    prev.certificatesFiles.filter(
                                      (_, idx) => idx !== i
                                    ),
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              title="Xóa ảnh"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Giới thiệu ngắn (bio) *
                </label>
                <textarea
                  ref={refs.bio}
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, bio: true })}
                  placeholder="2–3 câu tóm tắt chuyên môn, phương pháp và triết lý trị liệu…"
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    isInvalid("bio")
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                />
              </div>
            </>
          )}

          {/* Alerts */}
          {error && (
            <div className="md:col-span-2 bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="md:col-span-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-md text-sm">
              ✅ {success}
            </div>
          )}

          {/* Actions */}
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {accountType === "doctor" && step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={loading}
              className={primaryBtnClass}
            >
              {loading
                ? "Đang xử lý…"
                : accountType === "doctor"
                ? step === 1
                  ? "Tiếp tục"
                  : "Đăng ký"
                : "Đăng ký"}
            </button>
          </div>

          <div className="md:col-span-2 text-center text-sm text-gray-500 mt-2">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-teal-600 hover:underline">
              Đăng nhập
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
