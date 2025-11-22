import React, { useState, useMemo } from "react";

import Dashboard from "./Dashboard";
import PatientsView from "./PatientsView";
import MessagesView from "./MessagesView";
import CalendarView from "./CalendarView";
import HomeworkView from "./HomeworkView";
import NotificationsView from "./NotificationsView";
import SettingsView from "./SettingsView";

import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  CalendarDays,
  ClipboardList,
  Bell,
  Settings,
} from "lucide-react";

// Mock patient data
const MOCK_PATIENTS = [
  {
    id: "p001",
    name: "Nguyễn Văn A",
    age: 28,
    gender: "Nam",
    latestTests: { PHQ9: 12, GAD7: 9 },
    slots: [],
    notes: "BN có dấu hiệu stress công việc.",
    tags: ["stress", "lo âu"],
    unread: 2,
    messages: [
      {
        id: "m1",
        sender: "patient",
        text: "Bác sĩ ơi em lo lắng quá",
        at: "2025-02-14T08:10",
      },
      {
        id: "m2",
        sender: "doctor",
        text: "Em mô tả chi tiết hơn nhé?",
        at: "2025-02-14T08:11",
      },
      {
        id: "m3",
        sender: "patient",
        text: "Em bị hồi hộp",
        at: "2025-02-14T09:00",
      },
    ],
    assignments: [
      {
        id: "x1",
        title: "Ghi nhật ký cảm xúc 3 ngày",
        due: "2025-02-16T23:00",
        submission: null,
        feedback: null,
      },
    ],
  },
];

const MOCK_CALLS = [];

export default function DoctorPortal() {
  const [nav, setNav] = useState("dashboard");
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [calls, setCalls] = useState(MOCK_CALLS);
  const [availability, setAvailability] = useState([]);
  const [activePatientId, setActivePatientId] = useState(MOCK_PATIENTS[0].id);

  const unreadNoti = 0;
  const notifications = [];

  const stats = useMemo(
    () => ({
      total: patients.length,
      activeChats: patients.filter((p) => p.unread > 0).length,
      upcomingToday: calls.length,
      pendingReq: 0,
      homeworkDueToday: patients.reduce((n, p) => {
        return (
          n +
          p.assignments.filter(
            (a) =>
              !a.submission &&
              new Date(a.due).toDateString() === new Date().toDateString()
          ).length
        );
      }, 0),
    }),
    [patients, calls]
  );

  const onSend = ({ patientId, text }) => {
    setPatients((ps) =>
      ps.map((p) =>
        p.id === patientId
          ? {
              ...p,
              messages: [
                ...p.messages,
                {
                  id: Math.random().toString(36),
                  sender: "doctor",
                  text,
                  at: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    );
  };

  const onAssign = () => alert("Giao bài tập (modal chưa code)");
  const onSchedule = () => alert("Tạo lịch (modal chưa code)");
  const onRespond = () => alert("Phản hồi bài tập");

  const onAddAvail = (slot) =>
    setAvailability((arr) => [...arr, new Date(slot).toISOString()]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-screen">
      {/* SIDEBAR */}
      <div className="border-r bg-white p-4 space-y-2 hidden lg:block">
        <NavButton
          icon={LayoutDashboard}
          label="Tổng quan"
          active={nav === "dashboard"}
          onClick={() => setNav("dashboard")}
        />
        <NavButton
          icon={Users}
          label="Bệnh nhân"
          active={nav === "patients"}
          onClick={() => setNav("patients")}
        />
        <NavButton
          icon={MessageSquareText}
          label="Tin nhắn"
          active={nav === "messages"}
          onClick={() => setNav("messages")}
        />
        <NavButton
          icon={CalendarDays}
          label="Lịch gọi"
          active={nav === "calendar"}
          onClick={() => setNav("calendar")}
        />
        <NavButton
          icon={ClipboardList}
          label="Bài tập"
          active={nav === "homework"}
          onClick={() => setNav("homework")}
        />
        <NavButton
          icon={Bell}
          label="Thông báo"
          active={nav === "notifications"}
          badge={unreadNoti}
          onClick={() => setNav("notifications")}
        />
        <NavButton
          icon={Settings}
          label="Cài đặt"
          active={nav === "settings"}
          onClick={() => setNav("settings")}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header đơn giản cho mobile (có thể thêm Tabs / Dropdown sau) */}
        <div className="mb-2 flex items-center justify-between lg:hidden">
          <div className="text-base font-semibold capitalize">
            {labelOf(nav)}
          </div>
        </div>
        {nav === "dashboard" && (
          <Dashboard
            stats={stats}
            patients={patients}
            calls={calls}
            setNav={setNav}
            setActivePatientId={setActivePatientId}
          />
        )}
        {nav === "patients" && (
          <PatientsView
            patients={patients}
            setPatients={setPatients}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
            onAssign={onAssign}
            onSchedule={onSchedule}
          />
        )}
        {nav === "messages" && (
          <MessagesView
            patients={patients}
            setPatients={setPatients}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
            onSend={onSend}
          />
        )}
        {nav === "calendar" && (
          <CalendarView
            calls={calls}
            patients={patients}
            onSchedule={onSchedule}
          />
        )}
        {nav === "homework" && (
          <HomeworkView
            patients={patients}
            onAssign={onAssign}
            onRespond={onRespond}
          />
        )}
        {nav === "notifications" && (
          <NotificationsView
            notifications={notifications}
            onMarkAll={() => {}}
          />
        )}
        {nav === "settings" && (
          <SettingsView availability={availability} onAddAvail={onAddAvail} />
        )}
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      className={`flex items-center w-full gap-3 p-3 rounded-xl hover:bg-zinc-50 ${
        active ? "bg-zinc-100 font-semibold" : ""
      }`}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-rose-600 text-white text-xs px-2 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}
function labelOf(key) {
  switch (key) {
    case "dashboard":
      return "Tổng quan";
    case "patients":
      return "Bệnh nhân";
    case "messages":
      return "Tin nhắn";
    case "calendar":
      return "Lịch gọi";
    case "homework":
      return "Bài tập trị liệu";
    case "notifications":
      return "Thông báo";
    case "settings":
      return "Cài đặt";
    default:
      return key;
  }
}
