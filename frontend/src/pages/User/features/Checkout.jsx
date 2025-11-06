// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Helpers
const fmtVND = (v) => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);
  } catch {
    return `${v}₫`;
  }
};
const buildQrPayload = ({ id, amount }) =>
  `PAY|VND|ID=${id}|AMT=${amount}|DESC=Thanh toan dich vu tuan`;

// Trang Checkout
export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Cho phép lấy từ location.state hoặc query (?id=...&amount=...&status=...)
  const search = new URLSearchParams(location.search);
  const statePayload = location?.state?.payload || {};
  const id = statePayload.id || search.get("id") || "";
  const amount =
    typeof statePayload.amount === "number"
      ? statePayload.amount
      : Number(search.get("amount") || 0);
  const initialStatus =
    statePayload.status || search.get("status") || "Pending"; // Pending | Succeeded | Failed

  const [status, setStatus] = useState(initialStatus); // trạng thái thanh toán hiện tại
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const poller = useRef(null);

  // Nếu không có id/amount thì quay về trang chủ
  useEffect(() => {
    if (!id || !amount) {
      navigate("/", { replace: true });
    }
  }, [id, amount, navigate]);

  // Nếu không pending thì quay về trang chủ (theo yêu cầu)
  useEffect(() => {
    if (!id || !amount) return;
    if (status !== "Pending") {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id, amount]);

  // Poll trạng thái thanh toán mỗi 5s (nhẹ), dừng khi succeeded/failed
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/payments/${encodeURIComponent(id)}/status`
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.status) {
          setStatus(data.status); // Pending | Succeeded | Failed
        }
      } catch {
        // im lặng, tránh làm phiền người dùng
      }
    };
    // Chỉ poll khi đang Pending
    if (status === "Pending") {
      poller.current = setInterval(poll, 5000);
    }
    return () => {
      if (poller.current) clearInterval(poller.current);
    };
  }, [id, status]);

  // Khi thành công → hiện thông báo ngắn rồi về trang chủ
  useEffect(() => {
    if (status === "Succeeded") {
      // hiển thị UI thành công trong 1.5s
      const t = setTimeout(() => navigate("/", { replace: true }), 1500);
      return () => clearTimeout(t);
    }
    if (status === "Failed") {
      // về trang chủ ngay (hoặc bạn có thể giữ 1s tuỳ ý)
      navigate("/", { replace: true });
    }
  }, [status, navigate]);

  const qrPayload = useMemo(() => buildQrPayload({ id, amount }), [id, amount]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      alert("Đã copy QR payload.");
    } catch {
      alert("Không copy được, vui lòng tự chọn và copy.");
    }
  };

  const checkNow = async () => {
    if (!id) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/${encodeURIComponent(id)}/status`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.message || "Không kiểm tra được trạng thái.");
      if (data?.status) setStatus(data.status);
    } catch (e) {
      setError(e.message || "Có lỗi khi kiểm tra trạng thái.");
    } finally {
      setChecking(false);
    }
  };

  // Khi status = Succeeded → UI thành công (nhưng hiệu ứng chuyển trang sẽ tự chạy)
  if (status === "Succeeded") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 text-center">
          <div className="text-2xl font-bold text-emerald-700 mb-2">
            Thanh toán thành công
          </div>
          <p className="text-gray-700">
            Cảm ơn bạn! Hệ thống đang chuyển về trang chủ…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Thanh toán
          </h1>
          <span className="text-sm px-2 py-1 rounded-full border bg-white text-gray-700">
            Trạng thái: <b>{status}</b>
          </span>
        </header>

        {status !== "Pending" ? (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6">
            <div className="text-gray-700">Đang chuyển về trang chủ…</div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Mã giao dịch</div>
                <div className="text-lg font-semibold text-gray-900 break-all">
                  {id}
                </div>

                <div className="mt-4 text-sm text-gray-500 mb-1">Số tiền</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {fmtVND(amount)}
                </div>

                <div className="mt-6 text-sm text-gray-600">
                  Quét mã QR bằng ứng dụng ngân hàng của bạn. Sau khi thanh toán
                  thành công, trạng thái sẽ chuyển sang “Succeeded”.
                </div>
              </div>

              <div className="flex flex-col items-center">
                {/* Khung QR – thay bằng ảnh QR thật/SDK */}
                <div className="w-56 h-56 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-xs text-gray-400 text-center px-3">
                    QR Placeholder
                    <br />
                    (Cắm SDK/ảnh QR sau)
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <div className="text-xs text-gray-500 mb-1">QR Payload</div>
                  <textarea
                    className="w-full text-xs border rounded-lg p-2 bg-gray-50 text-gray-700"
                    rows={3}
                    readOnly
                    value={qrPayload}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={copy}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Copy payload
                    </button>
                    <button
                      onClick={checkNow}
                      disabled={checking}
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      {checking ? "Đang kiểm tra…" : "Tôi đã thanh toán"}
                    </button>
                    <button
                      onClick={() => navigate("/", { replace: true })}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Về trang chủ
                    </button>
                  </div>
                  {error ? (
                    <div className="mt-2 text-sm text-red-600">{error}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <hr className="my-6" />

            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Lưu ý: Sau khi thanh toán, hệ thống sẽ tự động cập nhật trạng thái
              và điều hướng về trang chủ.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
