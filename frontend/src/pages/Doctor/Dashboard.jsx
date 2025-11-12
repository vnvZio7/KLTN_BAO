// src/views/Dashboard.jsx
import React, { useMemo } from "react";
import {
  CalendarDays,
  CalendarClock,
  MessageSquareText,
  PhoneCall,
  Users,
  Activity,
} from "lucide-react";
import IconBtn from "../../components/doctor/IconBtn";
import Badge from "../../components/doctor/Badge";
import Empty from "../../components/doctor/Empty";
import Avatar from "../../components/doctor/Avatar";
import Progress from "../../components/doctor/Progress";
import { fmtDateTime, fmtTime } from "../../lib/date";
import { nameOf } from "../../lib/utils";
import { classifyPHQ9, classifyGAD7, toneToClass } from "../../lib/tests";

export default function Dashboard({
  stats,
  patients,
  calls,
  setNav,
  setActivePatientId,
}) {
  const upcoming = useMemo(
    () =>
      calls
        .slice()
        .sort((a, b) => +new Date(a.time) - +new Date(b.time))
        .slice(0, 6),
    [calls]
  );

  const recentMsgs = useMemo(
    () =>
      patients
        .filter((p) => (p.messages || []).length)
        .map((p) => ({ ...p, lastMsg: p.messages[p.messages.length - 1] }))
        .sort((a, b) => +new Date(b.lastMsg.at) - +new Date(a.lastMsg.at))
        .slice(0, 6),
    [patients]
  );

  const riskPatients = useMemo(
    () =>
      patients.filter(
        (p) => p.latestTests?.PHQ9 >= 20 || p.latestTests?.GAD7 >= 15
      ),
    [patients]
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard
          icon={Users}
          label="Bệnh nhân"
          value={stats.total}
          hint="Tổng đang theo dõi"
        />
        <StatCard
          icon={MessageSquareText}
          label="Chat hoạt động"
          value={stats.activeChats}
          hint="Có tin nhắn chưa đọc"
        />
        <StatCard
          icon={PhoneCall}
          label="Cuộc gọi hôm nay"
          value={stats.upcomingToday}
          hint="Trong 24h"
        />
        <StatCard
          icon={CalendarClock}
          label="Yêu cầu chờ"
          value={stats.pendingReq}
          hint="Chưa xử lý"
        />
        <StatCard
          icon={CalendarDays}
          label="Bài tập đến hạn"
          value={stats.homeworkDueToday}
          hint="Hôm nay"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cuộc gọi sắp tới</h3>
            <IconBtn icon={CalendarDays} onClick={() => setNav("calendar")}>
              Xem lịch
            </IconBtn>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <Empty
                icon={PhoneCall}
                title="Chưa có lịch"
                hint="Tạo lịch mới ở mục Lịch gọi"
              />
            )}
            {upcoming.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <Avatar name={nameOf(patients, c.patientId)} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {nameOf(patients, c.patientId)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {fmtDateTime(c.time)} • 45 phút
                  </div>
                </div>
                <div className="ml-auto">
                  <IconBtn> Bắt đầu </IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tin nhắn gần đây</h3>
            <IconBtn
              icon={MessageSquareText}
              onClick={() => setNav("messages")}
            >
              Vào hộp chat
            </IconBtn>
          </div>
          <div className="space-y-3">
            {recentMsgs.length === 0 && (
              <Empty icon={MessageSquareText} title="Chưa có tin nhắn" />
            )}
            {recentMsgs.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePatientId(p.id);
                  setNav("messages");
                }}
                className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-zinc-50"
              >
                <Avatar name={p.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs text-zinc-500">
                    {p.lastMsg.sender === "doctor" ? "Bạn: " : "BN: "}
                    {p.lastMsg.text}
                  </div>
                </div>
                <div className="ml-auto text-xs text-zinc-400">
                  {fmtTime(p.lastMsg.at)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Cảnh báo nguy cơ</h3>
            <Badge tone="danger">Theo dõi sát</Badge>
          </div>
          <div className="space-y-3">
            {riskPatients.length === 0 && (
              <Empty icon={Activity} title="Không có ca nguy cơ" />
            )}
            {riskPatients.map((p) => (
              <div key={p.id} className="rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} />
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-zinc-500">
                      PHQ-9 {p.latestTests.PHQ9} • GAD-7 {p.latestTests.GAD7}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <Progress
                      value={p.latestTests.PHQ9}
                      max={27}
                      label="PHQ-9"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyPHQ9(p.latestTests.PHQ9).tone
                      )}`}
                    >
                      {classifyPHQ9(p.latestTests.PHQ9).label}
                    </div>
                  </div>
                  <div>
                    <Progress
                      value={p.latestTests.GAD7}
                      max={21}
                      label="GAD-7"
                    />
                    <div
                      className={`mt-2 inline-block rounded-full border px-2 py-1 ${toneToClass(
                        classifyGAD7(p.latestTests.GAD7).tone
                      )}`}
                    >
                      {classifyGAD7(p.latestTests.GAD7).label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-zinc-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
      {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}
