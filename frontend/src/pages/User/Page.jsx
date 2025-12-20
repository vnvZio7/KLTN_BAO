import React, { useContext, useEffect, useMemo, useState } from "react";
import Shell from "../../components/user/Shell";
import SchedulePage from "./features/schedule/SchedulePage";
import ChatPage from "./features/chat/ChatPage";
import NotificationsPage from "./features/notifications/NotificationsPage";
import ProfilePage from "./features/profile/ProfilePage";
import UserStatsPage from "./features/stats/UserStatsPage";
import DoctorInfoPage from "./features/doctor/DoctorInfoPage";
import DoctorHomeworkPage from "./Homework";
import PaymentPage from "./features/PaymentPage";
import { useUserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import PaymentModal from "../../components/payments/PaymentModal";
import { generateTransactionCode } from "../../utils/helper";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SessionDetailPopup from "../../components/SessionDetailPopup";

export default function Page() {
  const [active, setActive] = useState("stats");
  const navigate = useNavigate();
  const {
    doctors,
    user,
    currentDoctor,
    handleLogout,
    assignments,
    appointments,
    room,
    sendMessage,
    messages,
    setMessages,
    onlineUsers,
    setUser,
    homeworkSubmissions,
    setHomeworkSubmissions,
    notifications,
    setNotifications,
    sessions,
  } = useUserContext();

  const [open, setOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [openCallDetails, setOpenCallDetails] = useState(false);
  const pill = currentDoctor.pricePerWeek - user.walletBalance;
  const handleConfirm = async () => {
    try {
      const transaction = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.GET_TRANSACTION_BY_CODE(paymentData.orderCode)
      );
      console.log(transaction);
      if (transaction.data.success) {
        toast.success("Thanh toán thành công");
        await axiosInstance.patch(
          API_PATHS.TRANSACTIONS.UPDATE_TRANSACTION(
            transaction.data.transaction._id
          ),
          {
            roomId: room._id,
          }
        );
        navigate("/user");
      } else {
        toast.error(transaction.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const unreadChat = useMemo(() => {
    return messages.filter((m) => !m.read && m.senderType !== "user").length;
  }, [messages]);
  useEffect(() => {
    if (active === "chat") {
      axiosInstance.patch(
        API_PATHS.MESSAGES.UPDATE_READ_MESSAGES_BY_ROOM_ID(room._id)
      );
    }
    setMessages((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [active]);
  useEffect(() => {
    if ((user.freeCall === 1 || user.firstCallInWeek === true) && pill > 0) {
      setPaymentData({
        amount: pill,
        orderCode: generateTransactionCode(),
        messages:
          "Vui lòng thanh toán số tiền còn thiếu trước khi sử dụng dịch vụ",
        required: true,
      });
      setOpen(true); // 👉 mở modal
    }
  }, [active]);
  const unreadNotif = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <Shell
      active={active}
      onChange={setActive}
      user={user} // ← thêm
      unreadChat={unreadChat}
      unreadNotif={unreadNotif}
      onLogout={handleLogout}
    >
      {active === "stats" && (
        <UserStatsPage
          appointments={appointments}
          assignments={assignments}
          submissions={homeworkSubmissions}
          messages={messages} // truyền dữ liệu thực nếu có
          sessions={sessions}
          user={user}
        />
      )}
      {active === "billing" && <PaymentPage />}
      {active === "schedule" && (
        <SchedulePage
          doctor={currentDoctor}
          appointments={appointments}
          sessions={sessions}
          onReview={(session) => {
            setSessionData(session);
            setOpenCallDetails(true);
          }}
        />
      )}
      {active === "doctor" && (
        <DoctorInfoPage
          user={user}
          doctor={currentDoctor}
          suggestions={doctors} // <— truyền mảng gợi ý
          onSwitch={async ({ picked, reason }) => {
            console.log(picked);
            try {
              const user1 = await axiosInstance.patch(
                API_PATHS.USERS.UPDATE_SWITCH_DOCTOR,
                {
                  currentDoctorId: user.currentDoctorId,
                  switchDoctorId: picked.id,
                  status: "pending",
                  reason,
                }
              );
              // if (user)
              toast.success(
                "Yêu cầu đã được gửi lên admin. Vui lòng đợi phản hồi"
              );
              setUser((prev) => ({
                ...prev,
                switchDoctor: [
                  ...(prev.switchDoctor || []), // giữ lại các yêu cầu cũ
                  {
                    currentDoctorId: prev.currentDoctorId,
                    switchDoctorId: picked.id,
                    switchDoctorStatus: "pending",
                    reason,
                  },
                ],
              }));
            } catch (e) {
              console.error(e.message);
              toast.error(e.message);
            }
            // toast.success(picked.name + reason);
            // const diff = picked.pricePerWeek - currentDoctor.pricePerWeek;
            // if (diff > 0) {
            //   setPaymentData({
            //     amount: diff,
            //     orderCode: generateTransactionCode(),
            //   });
            //   setOpen(true); // 👉 mở modal
            // }
            // (tuỳ chọn) gọi API yêu cầu đổi bác sĩ ở đây
            // setActive("doctor");
          }}
        />
      )}

      {openCallDetails ? (
        <SessionDetailPopup
          open={true}
          onClose={() => {
            setSessionData([]);
            setOpenCallDetails(false);
          }}
          session={sessionData}
        />
      ) : null}
      {open && paymentData && (
        <PaymentModal
          amount={paymentData.amount}
          orderCode={paymentData.orderCode}
          message={paymentData.messages}
          open={open}
          onClose={() => setOpen(false)}
          required={paymentData.required}
          onConfirmed={handleConfirm}
        />
      )}

      {active === "homework" && (
        <DoctorHomeworkPage
          assignments={assignments}
          submissions={homeworkSubmissions}
          setHomeworkSubmissions={setHomeworkSubmissions}
        />
      )}

      {active === "chat" && (
        <ChatPage
          room={room}
          onSend={sendMessage}
          setMessages={setMessages}
          doctor={currentDoctor}
          messages={messages}
          onlineUsers={onlineUsers}
        />
      )}
      {active === "notifications" && (
        <NotificationsPage
          notifications={notifications}
          setNotifications={setNotifications}
          user={user}
        />
      )}
      {active === "profile" && <ProfilePage user={user} />}
    </Shell>
  );
}
