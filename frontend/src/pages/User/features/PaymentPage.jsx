// src/pages/QuickPayment.jsx
import React, { useMemo, useState } from "react";
import PaymentModal from "../../../components/payments/PaymentModal"; // chỉnh lại path nếu khác

// ---- Mock fallback nếu không truyền props.billing ----
const MOCK = {
  plan: {
    name: "Weekly Care",
    currency: "VND",
    price: 249000, // số tiền phải thanh toán tuần này
    nextChargeAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
  },
  invoices: [
    {
      id: "inv_8h3kx",
      date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      amount: 249000,
      status: "paid",
    },
    {
      id: "inv_7af20",
      date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      amount: 249000,
      status: "paid",
    },
  ],
};

const currency = (v, c = "VND") =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: c }).format(v);

export default function PaymentPage({ billing }) {
  const [state, setState] = useState(billing || MOCK);
  const { plan } = state;

  const [showPay, setShowPay] = useState(false);

  // Mã nội dung chuyển khoản (orderCode) để khớp thanh toán
  const orderCode = useMemo(
    () =>
      `POMERA-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
    []
  );

  const nextChargeLabel = useMemo(
    () =>
      new Date(plan.nextChargeAt).toLocaleString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [plan.nextChargeAt]
  );

  const onConfirmPaid = () => {
    // Khi user bấm "Đã chuyển khoản" trong PaymentModal → thêm hoá đơn mới
    const inv = {
      id: `inv_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      amount: plan.price,
      status: "paid",
    };
    const next = { ...state, invoices: [inv, ...(state.invoices || [])] };
    setState(next);
    setShowPay(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Tiêu đề trang */}
        <header className="bg-white rounded-2xl border border-slate-200 p-5">
          <h1 className="text-xl font-semibold">Thanh toán</h1>
          <p className="text-slate-600 text-sm">
            Vui lòng thanh toán để có thể tiếp tục làm việc với bác sĩ.
          </p>
        </header>

        {/* Khối Thanh toán */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-600">Gói</div>
              <div className="text-lg font-semibold">{plan.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">
                Số tiền phải thanh toán
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {currency(plan.price, plan.currency)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Kỳ tiếp theo: <b>{nextChargeLabel}</b>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Mã nội dung chuyển khoản:{" "}
              <b className="text-slate-800">{orderCode}</b>
            </div>
            <button
              onClick={() => setShowPay(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Thanh toán bằng QR
            </button>
          </div>
        </section>

        {/* Lịch sử thanh toán */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Lịch sử thanh toán</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Mã hoá đơn</th>
                  <th className="py-2 pr-4">Ngày</th>
                  <th className="py-2 pr-4">Số tiền</th>
                  <th className="py-2 pr-4">Trạng thái</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(state.invoices || []).length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={5}>
                      Chưa có hoá đơn nào.
                    </td>
                  </tr>
                )}
                {(state.invoices || []).map((iv) => (
                  <tr key={iv.id}>
                    <td className="py-2 pr-4 font-medium">{iv.id}</td>
                    <td className="py-2 pr-4">
                      {new Date(iv.date).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2 pr-4">
                      {currency(iv.amount, plan.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          iv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {iv.status === "paid" ? "Đã thanh toán" : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal QR Sepay */}
      <PaymentModal
        open={showPay}
        onClose={() => setShowPay(false)}
        onConfirmed={onConfirmPaid}
        amount={plan.price}
        orderCode={orderCode}
        message="Vui lòng thanh toán trước khi kết nối với bác sĩ. Bạn được miễn phí cuộc gọi đầu tiên — hãy liên hệ với bác sĩ để lên lịch."
      />
    </div>
  );
}
