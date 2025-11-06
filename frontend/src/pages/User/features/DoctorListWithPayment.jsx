// src/pages/DoctorListWithPayment.jsx
import React, { useEffect, useMemo, useState } from "react";

/** ============ CONFIG ============ */
const BANK_INFO = {
  bankName: "MBBank",
  accountName: "VU NGOC VAN",
  accountNumber: "1000118802803",
  QR_URL:
    "https://api.vietqr.io/image/970422-1000118802803-9r7H6B.jpg?addInfo=MINDCARE&accountName=VU%20NGOC%20VAN",
};

/** Mock doctors (đổi sang dữ liệu API thật nếu có) */
const DOCTORS = [
  {
    id: "d1",
    fullName: "TS. Nguyễn Văn An",
    role: "Therapist",
    specializations: ["Trầm cảm", "CBT"],
    rating: 4.9,
    pricePerWeek: 265000,
  },
  {
    id: "d2",
    fullName: "ThS. Trần Thị Bình",
    role: "Counselor",
    specializations: ["Lo âu", "Trẻ em"],
    rating: 4.8,
    pricePerWeek: 199000,
  },
  {
    id: "d3",
    fullName: "BS. Lê Minh Cường",
    role: "Psychiatrist",
    specializations: ["Rối loạn khí sắc", "Thuốc"],
    rating: 4.7,
    pricePerWeek: 350000,
  },
  {
    id: "d4",
    fullName: "ThS. Phạm Thu Dung",
    role: "Therapist",
    specializations: ["Gia đình", "Hôn nhân"],
    rating: 4.6,
    pricePerWeek: 249000,
  },
];

/** ============ UTILS ============ */
const formatCurrency = (vnd) =>
  (vnd || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const genTransferNote = () =>
  (crypto?.randomUUID?.() || Math.random().toString(16).slice(2))
    .replace(/-/g, "")
    .slice(0, 24);

/** 5 phút đếm ngược; trả về expired để khoá hành động */
function useCountdown(seconds = 300) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (!seconds) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = 100 - Math.round((left / seconds) * 100);
  return { left, mmss: `${mm}:${ss}`, progress, expired: left === 0 };
}

const Toast = ({ text }) =>
  !text ? null : (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100]">
      <div className="bg-black/80 text-white text-sm px-3 py-2 rounded-lg shadow">
        {text}
      </div>
    </div>
  );

/** ============ PAGE ============ */
export default function DoctorListWithPayment() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [openPay, setOpenPay] = useState(false);
  const [transferNote, setTransferNote] = useState(genTransferNote());
  const [toast, setToast] = useState("");
  const [sessionSeed, setSessionSeed] = useState(0); // dùng để reset timer

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCTORS;
    return DOCTORS.filter((d) =>
      `${d.fullName} ${d.role} ${d.specializations.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  // chỉ chạy countdown khi modal mở; + sessionSeed để reset
  const { mmss, progress, expired } = useCountdown(openPay ? 300 : 0);

  const openPaymentFor = (doctor) => {
    setPicked(doctor);
    setTransferNote(genTransferNote());
    setSessionSeed((s) => s + 1); // đổi seed (phòng khi bạn muốn theo dõi)
    setOpenPay(true);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Đã sao chép!");
      setTimeout(() => setToast(""), 1200);
    } catch {
      setToast("Không thể sao chép");
      setTimeout(() => setToast(""), 1200);
    }
  };

  const restartSession = () => {
    setTransferNote(genTransferNote());
    setSessionSeed((s) => s + 1);
    // đóng & mở lại để reset UI/QR nếu cần
    setOpenPay(false);
    setTimeout(() => setOpenPay(true), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-neutral-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Chọn Bác Sĩ
          </h1>
          <div className="w-full sm:w-96">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, chuyên môn, vai trò…"
              className="w-full rounded-xl bg-white/10 text-white placeholder:text-white/50 px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 text-white hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">{d.fullName}</div>
                  <div className="text-rose-400 text-sm">{d.role}</div>
                </div>
                <div className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                  ⭐ {d.rating}
                </div>
              </div>
              <div className="mt-2 text-sm text-white/80">
                <span className="font-medium text-white">Chuyên môn: </span>
                {d.specializations.join(", ")}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-emerald-300 font-semibold">
                  {formatCurrency(d.pricePerWeek)}/tuần
                </div>
                <button
                  onClick={() => openPaymentFor(d)}
                  className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-white/70 p-8 border border-white/10 rounded-2xl">
              Không tìm thấy bác sĩ phù hợp.
            </div>
          )}
        </div>
      </div>

      {/* Modal Payment */}
      {openPay && picked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setOpenPay(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative w-[min(980px,95vw)] rounded-2xl overflow-hidden shadow-2xl bg-[#121212] text-white border border-white/10">
            {/* progress + timer */}
            <div className="bg-rose-700 h-2 relative">
              <div
                className="absolute left-0 top-0 h-full bg-rose-400 transition-all"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute right-3 -top-7 translate-y-2 text-sm font-semibold">
                {mmss}
              </div>
            </div>

            {/* banner hết hạn */}
            {expired && (
              <div className="bg-rose-900/70 text-rose-200 text-center text-sm py-2">
                Phiên thanh toán đã hết hạn (5 phút). Hãy tạo lại phiên để tiếp
                tục.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* QR */}
              <div className="flex flex-col items-center">
                <div className="text-white/80 font-medium mb-3">
                  Quét Mã QR Để Thanh Toán
                </div>
                <div
                  className={`p-3 rounded-xl border-4 ${
                    expired ? "border-gray-600" : "border-rose-600"
                  } bg-white`}
                >
                  <img
                    src={BANK_INFO.QR_URL}
                    alt="QR thanh toán"
                    className="w-64 h-64 object-contain opacity-100"
                  />
                </div>
                <div className="mt-3 text-xs text-white/50">
                  * Kiểm tra người nhận & nội dung trước khi xác nhận
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="bg-[#0d1a2b] rounded-xl p-5 border border-white/10">
                  <div className="text-white/70 text-sm">Ngân hàng</div>
                  <div className="font-semibold">{BANK_INFO.bankName}</div>

                  <div className="mt-3 text-white/70 text-sm">
                    Chủ Tài Khoản
                  </div>
                  <div className="font-semibold">{BANK_INFO.accountName}</div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-white/70 text-sm">Số Tài Khoản</div>
                      <div className="font-semibold">
                        {BANK_INFO.accountNumber}
                      </div>
                    </div>
                    <button
                      disabled={expired}
                      onClick={() => copyText(BANK_INFO.accountNumber)}
                      className={`text-xs px-3 py-1 rounded ${
                        expired
                          ? "bg-white/5 text-white/40 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      Sao chép
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-white/70 text-sm">Số Tiền</div>
                      <div className="font-semibold text-emerald-400">
                        {formatCurrency(picked.pricePerWeek)}
                      </div>
                    </div>
                    <button
                      disabled={expired}
                      onClick={() => copyText(String(picked.pricePerWeek))}
                      className={`text-xs px-3 py-1 rounded ${
                        expired
                          ? "bg-white/5 text-white/40 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      Sao chép
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-white/70 text-sm">
                        Nội Dung Chuyển Khoản
                      </div>
                      <div className="font-mono text-sm truncate">
                        {transferNote}
                      </div>
                    </div>
                    <button
                      disabled={expired}
                      onClick={() => copyText(transferNote)}
                      className={`text-xs px-3 py-1 rounded ${
                        expired
                          ? "bg-white/5 text-white/40 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      Sao chép
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="text-white/70 text-sm">Tổng Tiền</div>
                    <div className="text-rose-400 font-bold">
                      {formatCurrency(picked.pricePerWeek)}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-[#2a0f10] rounded-xl p-5 border border-rose-900/50">
                  <div className="font-semibold mb-2">Cách thanh toán</div>
                  <ol className="text-sm list-decimal list-inside space-y-1 text-white/80">
                    <li>Mở ứng dụng ngân hàng</li>
                    <li>Quét mã QR</li>
                    <li>
                      Nhập đúng{" "}
                      <span className="font-mono">{transferNote}</span>
                    </li>
                    <li>Hoàn tất thanh toán</li>
                  </ol>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setOpenPay(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Đóng
                  </button>

                  {!expired ? (
                    <a
                      href={BANK_INFO.QR_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold"
                    >
                      Mở trong ứng dụng NH
                    </a>
                  ) : (
                    <button
                      onClick={restartSession}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold"
                    >
                      Tạo lại phiên
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Toast text={toast} />
        </div>
      )}
    </div>
  );
}
