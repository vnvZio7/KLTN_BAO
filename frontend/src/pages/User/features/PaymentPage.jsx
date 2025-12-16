// src/pages/QuickPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import PaymentModal from "../../../components/payments/PaymentModal"; // chỉnh lại path nếu khác
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import {
  generateTransactionCode,
  getNextMondayAndSaturday,
} from "../../../utils/helper";
import { useUserContext } from "../../../context/userContext";
import { InfoIcon } from "lucide-react";
import toast from "react-hot-toast";

const currency = (v, c = "VND") =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: c }).format(v);

export default function PaymentPage() {
  const { currentDoctor, user, fetchUser, room } = useUserContext();
  const plan = {
    currency: "VND",
    price: currentDoctor.pricePerWeek, // số tiền phải thanh toán tuần này
  };
  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    const getInvoices = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.TRANSACTIONS.GET_ALL_TRANSACTIONS
        );
        setInvoices(response.data.transactions.reverse());
        console.log(response.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    getInvoices();
  }, []);
  const [showPay, setShowPay] = useState(false);

  // Mã nội dung chuyển khoản (orderCode) để khớp thanh toán
  const orderCode = useMemo(() => generateTransactionCode(), []);

  const { nextMonday, nextSaturday } = getNextMondayAndSaturday();
  const nextWeekLabel = useMemo(() => {
    const formatOptions = {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    const mondayLabel = nextMonday.toLocaleString("vi-VN", formatOptions);
    const saturdayLabel = nextSaturday.toLocaleString("vi-VN", formatOptions);

    return `${mondayLabel} → ${saturdayLabel}`;
  }, []);

  const onConfirmPaid = async () => {
    // Khi user bấm "Đã chuyển khoản" trong PaymentModal → thêm hoá đơn mới
    try {
      const transaction = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.GET_TRANSACTION_BY_CODE(orderCode)
      );
      console.log(transaction);
      if (transaction.data.success) {
        toast.success("Thanh toán thành công");
        // setUser((prev) => ({
        //   ...prev,
        //   walletBalance:
        //     Number(prev.walletBalance || 0) +
        //     Number(transaction.data.transaction.amount || 0),
        // }));
        await axiosInstance.patch(
          API_PATHS.TRANSACTIONS.UPDATE_TRANSACTION(
            transaction.data.transaction._id
          ),
          {
            roomId: room._id,
            free: false,
          }
        );
        fetchUser();
        setInvoices((prev) => [transaction.data.transaction, ...(prev || [])]);
        setShowPay(false);
      } else {
        toast.error(transaction.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Tiêu đề trang */}
        <span className="bg-yellow-100 flex gap-2 items-center p-1">
          <InfoIcon className="w-5 h-5" />
          Số dư sẽ bị trừ khi bạn thực hiện cuộc gọi đầu tiên trong tuần (Không
          tính cuộc gọi đầu sau khi kết nối với bác sĩ).
        </span>
        <header className="bg-white rounded-2xl border border-slate-200 p-5">
          <h1 className="text-xl font-semibold">Thanh toán</h1>
          <p className="text-slate-600 text-sm">
            {`Vui lòng thanh toán trước ngày ${nextMonday.toLocaleString(
              "vi-VN",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )} để có thể tiếp tục làm
            việc với bác sĩ.`}
          </p>
        </header>

        {/* Khối Thanh toán */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-600">Gói</div>
              <div className="text-lg font-semibold">Thanh toán theo tuần</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">
                Số tiền phải thanh toán
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {currency(plan.price, plan.currency)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Kỳ tiếp theo: <b>{nextWeekLabel}</b>
              </div>
            </div>
          </div>

          {!(
            user.freeCall === 0 &&
            user.firstCallInWeek === false &&
            user.walletBalance < currentDoctor.pricePerWeek
          ) ? (
            <div className="flex mt-5 justify-center items-center">
              Bạn đã thanh toán hóa đơn cho tuần này rồi. Hãy quay lại sau.
            </div>
          ) : (
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
          )}
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
                {(invoices || []).length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={5}>
                      Chưa có hoá đơn nào.
                    </td>
                  </tr>
                )}
                {(invoices || []).map((iv) => (
                  <tr key={iv._id}>
                    <td className="py-2 pr-4 font-medium">{iv._id}</td>
                    <td className="py-2 pr-4">
                      {new Date(iv.paidAt).toLocaleString("vi-VN")}
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
        message="Vui lòng thanh toán để gia hạn tuần tiếp theo. Bạn được miễn phí cuộc gọi đầu tiên — hãy liên hệ với bác sĩ để lên lịch."
      />
    </div>
  );
}
