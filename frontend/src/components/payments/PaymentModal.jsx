// src/components/payments/PaymentModal.jsx
import React, { useEffect, useState } from "react";
import { X, Copy, CheckCircle, ShieldCheck } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

export default function PaymentModal({
  open,
  onClose,
  onConfirmed, // optional: called when user clicks "Đã chuyển khoản"
  amount, // number (VND)
  orderCode, // mã/ghi chú chuyển khoản (e.g. "POMERA-123456")
  message = "Vui lòng thanh toán trước khi kết nối với bác sĩ.",
}) {
  const [bank, setBank] = useState([]);
  const sepayQrUrl = `${
    import.meta.env.VITE_QR_CODE_SEPAY
  }amount=${amount}&des=${orderCode}`;
  useEffect(() => {
    const getSepay = async () => {
      const res = await axiosInstance.get(API_PATHS.PAYMENT.GET_SEPAY);
      console.log();
      const data = res.data.bankaccount;
      const bankdata = {
        bankName: data.bank_short_name,
        accountName: data.account_holder_name,
        accountNumber: data.account_number,
      };
      setBank(bankdata);
    };

    getSepay();
    console.log(bank);
    const onEsc = (e) => e.key === "Escape" && open && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const fmtVND = (v) =>
    typeof v === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : v;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional toast: you can integrate your own
      alert("Đã sao chép!");
    } catch {
      // fallback (older browsers)
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Đã sao chép!");
    }
  };

  const InfoRow = ({ label, value, copyable }) => (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-zinc-900">{value}</div>
        {copyable && (
          <button
            onClick={() => copy(value)}
            className="rounded-lg border px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
          >
            <Copy className="inline h-3.5 w-3.5 mr-1" />
            Sao chép
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 grid place-items-center p-4"
      >
        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <div className="text-lg font-semibold">Thanh toán bảo mật</div>
              <div className="text-xs text-zinc-500">{message}</div>
            </div>
            <button
              className="rounded-xl p-2 hover:bg-zinc-50"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X className="h-5 w-5 text-zinc-600" />
            </button>
          </div>

          {/* Body */}
          <div className="grid gap-6 p-4 md:grid-cols-2">
            {/* Left: QR */}
            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div className="text-sm font-medium">
                  Quét QR (Sepay) để thanh toán
                </div>
              </div>

              <div className="flex items-center justify-center">
                {sepayQrUrl ? (
                  <img
                    src={sepayQrUrl}
                    alt="QR thanh toán Sepay"
                    className="h-auto w-[280px] rounded-lg border object-contain"
                  />
                ) : (
                  <div className="flex h-[280px] w-[280px] items-center justify-center rounded-lg border bg-zinc-50 text-center text-xs text-zinc-500">
                    Đặt sepayQrUrl để hiển thị mã QR
                  </div>
                )}
              </div>

              <div className="mt-3 text-center text-xs text-zinc-500">
                Quét bằng ứng dụng ngân hàng/Ví để chuyển nhanh & chính xác.
              </div>
            </div>

            {/* Right: bank info */}
            <div className="rounded-xl border p-4">
              <div className="mb-2 text-sm font-semibold">
                Thông tin chuyển khoản
              </div>

              <InfoRow label="Ngân hàng" value={bank.bankName} />
              <InfoRow label="Chủ tài khoản" value={bank.accountName} />

              <InfoRow
                label="Số tài khoản"
                value={bank.accountNumber}
                copyable
              />

              <div className="my-3 h-px w-full bg-zinc-100" />

              <InfoRow label="Số tiền" value={fmtVND(amount ?? 0)} copyable />
              <InfoRow
                label="Nội dung chuyển khoản"
                value={orderCode || "POMERA-[UserID]"}
                copyable
              />

              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Vui lòng giữ nguyên{" "}
                    <span className="font-semibold">nội dung chuyển khoản</span>{" "}
                    để hệ thống ghi nhận tự động.
                  </li>
                  <li>
                    Sau khi thanh toán, chọn{" "}
                    <span className="font-semibold">“Đã chuyển khoản”</span> để
                    tiếp tục.
                  </li>
                  <li>
                    <span className="font-semibold">Miễn phí</span> cuộc gọi đầu
                    tiên. Hãy liên hệ bác sĩ để{" "}
                    <span className="font-semibold">lên lịch hẹn</span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Thanh toán an toàn & mã hóa. Hỗ trợ 24/7 nếu có lỗi ghi nhận.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Đóng
              </button>
              <button
                onClick={onConfirmed}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
