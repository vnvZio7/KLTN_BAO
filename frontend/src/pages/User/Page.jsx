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

export default function Page() {
  const [active, setActive] = useState("stats");
  const {
    doctors,
    user,
    currentDoctor,
    handleLogout,
    assignments,
    room,
    sendMessage,
    messages,
  } = useUserContext();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const room = await axiosInstance.get(API_PATHS.ROOMS.GET_ROOM);
        console.log("Room");
        const roomId = room.data.room._id;
        const { data } = await axiosInstance.get(
          API_PATHS.APPOINTMENTS.GET_APPOINTMENTS_BY_ROOMID(roomId)
        );
        setAppointments(data.appointments);
      } catch (error) {
        console.error(error.messages);
      }
    };

    fetchAppointments();
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      type: "appointment",
      title: "Nhắc lịch: 14:00 hôm nay",
      body: "Lịch gọi video với BS. Lan Nguyễn.",
      time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
    },
    {
      id: "n2",
      type: "message",
      title: "Tin nhắn mới",
      body: 'BS. Minh: "Bạn nhớ điền nhật ký giấc ngủ nhé."',
      time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: false,
    },
    {
      id: "n3",
      type: "system",
      title: "Cập nhật tính năng",
      body: "Thêm bộ lọc thông báo và đánh dấu đã đọc.",
      time: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      read: true,
    },
  ]);
  const [unreadChat, setUnreadChat] = useState(2);
  useEffect(() => {
    if (active === "chat") setUnreadChat(0);
  }, [active]);

  const onAppointmentBooked = (item) => {
    setNotifications((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        type: "appointment",
        title: "Đã đặt lịch mới",
        body: `${item.doctorName} · ${new Date(item.time).toLocaleString(
          "vi-VN"
        )}`,
        time: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

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
          messages={[]} // truyền dữ liệu thực nếu có
        />
      )}
      {active === "billing" && <PaymentPage />}
      {active === "schedule" && (
        <SchedulePage
          doctor={currentDoctor}
          appointments={appointments}
          setAppointments={setAppointments}
          onBooked={onAppointmentBooked}
        />
      )}
      {active === "doctor" && (
        <DoctorInfoPage
          doctor={currentDoctor}
          suggestions={doctors} // <— truyền mảng gợi ý
          onSwitch={(picked) => {
            // (tuỳ chọn) gọi API yêu cầu đổi bác sĩ ở đây
            setActive("doctor");
          }}
        />
      )}

      {active === "homework" && (
        <DoctorHomeworkPage assignments={assignments} />
      )}

      {active === "chat" && (
        <ChatPage
          room={room}
          onSend={sendMessage}
          doctor={currentDoctor}
          messages={messages}
          setUnreadChat={setUnreadChat}
        />
      )}
      {active === "notifications" && (
        <NotificationsPage
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {active === "profile" && <ProfilePage user={user} />}
    </Shell>
  );
}
