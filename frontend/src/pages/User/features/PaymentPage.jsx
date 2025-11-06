import React, { useMemo, useState } from "react";
import { MOCK_BILLING } from "../../../utils/data";

const currency = (v, c = "VND") =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: c }).format(v);

function Section({ title, right, children }) {
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

function Radio({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <div>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-sm text-slate-600">{hint}</div>}
      </div>
    </label>
  );
}
export default function PaymentPage({ billing, setBilling }) {
  const [state, setState] = useState(billing || MOCK_BILLING);
  const [coupon, setCoupon] = useState("");
  const [selectedPm, setSelectedPm] = useState(
    (billing || MOCK_BILLING).paymentMethods.find((m) => m.isDefault)?.id
  );

  const plan = state.plan;
  const pm = state.paymentMethods;

  const toggleAutoRenew = () => {
    setState((prev) => ({
      ...prev,
      plan: { ...prev.plan, autoRenew: !prev.plan.autoRenew },
    }));
    setBilling?.((prev) => ({
      ...prev,
      plan: { ...prev.plan, autoRenew: !prev.plan.autoRenew },
    }));
  };
  const applyCoupon = () => {
    if (!coupon.trim()) return;
    if (coupon.trim().toUpperCase() === "GIAM20") {
      const discounted = Math.round(plan.price * 0.8);
      const next = { ...state, plan: { ...plan, price: discounted } };
      setState(next);
      setBilling?.(next);
      alert("Đã áp dụng mã giảm 20% cho tuần này");
    } else {
      alert("Mã không hợp lệ");
    }
    setCoupon("");
  };

  const setDefaultPm = (id) => {
    const next = {
      ...state,
      paymentMethods: pm.map((m) => ({ ...m, isDefault: m.id === id })),
    };
    setState(next);
    setBilling?.(next);
    setSelectedPm(id);
  };
  const payNow = () => {
    alert(
      `Thanh toán ${currency(
        plan.price,
        plan.currency
      )} bằng phương thức mặc định`
    );
    const inv = {
      id: `inv_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      amount: plan.price,
      status: "paid",
    };
    const next = { ...state, invoices: [inv, ...state.invoices] };
    setState(next);
    setBilling?.(next);
  };

  const cancelPlan = () => {
    const next = {
      ...state,
      plan: { ...plan, status: "canceled", autoRenew: false },
    };
    setState(next);
    setBilling?.(next);
  };

  const resumePlan = () => {
    const next = {
      ...state,
      plan: { ...plan, status: "active", autoRenew: true },
    };
    setState(next);
    setBilling?.(next);
  };
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

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Thanh toán (theo tuần)</h2>
          <p className="text-slate-600 text-sm">
            Quản lý gói theo tuần, phương thức thanh toán, mã ưu đãi và hoá đơn.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Trạng thái gói</div>
          <div
            className={`font-semibold ${
              plan.status === "active" ? "text-emerald-600" : "text-slate-700"
            }`}
          >
            {plan.status === "active"
              ? "Đang hoạt động"
              : plan.status === "canceled"
              ? "Đã huỷ gia hạn"
              : "Quá hạn"}
          </div>
        </div>
      </section>
      <Section
        title="Gói đang dùng"
        right={
          plan.status === "active" ? (
            <button
              onClick={cancelPlan}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm"
            >
              Huỷ gia hạn
            </button>
          ) : (
            <button
              onClick={resumePlan}
              className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              Tiếp tục gia hạn
            </button>
          )
        }
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-600">Tên gói</div>
            <div className="text-lg font-semibold">{plan.name}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-600">Giá</div>
            <div className="text-lg font-semibold">
              {currency(plan.price, plan.currency)} / tuần
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-600">Lần tính tiền kế tiếp</div>
            <div className="text-lg font-semibold">{nextChargeLabel}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={plan.autoRenew}
              onChange={toggleAutoRenew}
            />
            Tự động gia hạn mỗi tuần
          </label>
          <button
            onClick={payNow}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Thanh toán ngay
          </button>
        </div>
      </Section>
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Phương thức thanh toán">
          <div className="space-y-2">
            {pm.map((m) => (
              <Radio
                key={m.id}
                checked={selectedPm === m.id}
                onChange={() => setDefaultPm(m.id)}
                label={`${m.brand} ${m.last4 ? "•••• " + m.last4 : ""}`}
                hint={`Hết hạn: ${m.exp}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">
              Thêm thẻ / ví
            </button>
            <button className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">
              Xoá phương thức
            </button>
          </div>
        </Section>

        <Section title="Mã ưu đãi">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã (VD: GIAM20)"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button
              onClick={applyCoupon}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Áp dụng
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Mỗi tuần chỉ áp dụng 1 mã. Một số mã chỉ dành cho người dùng mới.
          </div>
        </Section>
      </div>
      <Section title="Hoá đơn gần đây">
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
              {state.invoices.map((iv) => (
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
      </Section>
    </div>
  );
}
