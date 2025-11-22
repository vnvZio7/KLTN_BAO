import { uid } from "./ui";

export function addDaysISO(days = 0, atHour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(atHour, 0, 0, 0);
  return d.toISOString();
}

export function addMinsISO(mins = 0) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

export const HOMEWORK_TEMPLATES = [
  {
    code: "CBT_TR",
    name: "CBT Thought Record",
    difficulty: "Easy",
    duration: "15–20m",
    target: ["Trầm cảm", "Lo âu"],
  },
  {
    code: "MF_BREATH",
    name: "Mindfulness 5–7–8",
    difficulty: "Easy",
    duration: "10m",
    target: ["Lo âu", "Mất ngủ"],
  },
  {
    code: "EXPOSURE_LITE",
    name: "Exposure Mini Hierarchy",
    difficulty: "Medium",
    duration: "20–30m",
    target: ["Ám ảnh cưỡng chế", "Sợ hãi"],
  },
  {
    code: "SLEEP_HYGIENE",
    name: "Sleep Hygiene Checklist",
    difficulty: "Easy",
    duration: "10–15m",
    target: ["Mất ngủ"],
  },
];

export const MOCK_PATIENTS = [
  {
    id: "p001",
    name: "Trần Minh Anh",
    gender: "Nữ",
    age: 27,
    tags: ["Trầm cảm", "Lo âu"],
    latestTests: { PHQ9: 14, GAD7: 8 },
    nextCall: new Date(Date.now() + 36e5).toISOString(), // +1h
    unread: 2,
    assignments: [
      {
        id: uid(),
        code: "CBT_TR",
        title: "CBT Thought Record",
        due: addDaysISO(2),
        status: "nộp bài",
      },
      {
        id: uid(),
        code: "MF_BREATH",
        title: "Mindfulness Breathing",
        due: addDaysISO(5),
        status: "đang làm",
      },
    ],
    notes: "Ưu tiên can thiệp CBT + Mindfulness, theo dõi giấc ngủ.",
    messages: [
      {
        id: uid(),
        sender: "patient",
        text: "Em cảm thấy đỡ hơn một chút.",
        at: addMinsISO(-120),
      },
      {
        id: uid(),
        sender: "doctor",
        text: "Tốt lắm, tiếp tục bài thở 5-7-8 nhé!",
        at: addMinsISO(-110),
      },
    ],
  },
  {
    id: "p002",
    name: "Ngô Quốc Huy",
    gender: "Nam",
    age: 31,
    tags: ["Mất ngủ"],
    latestTests: { PHQ9: 6, GAD7: 5 },
    nextCall: addDaysISO(1, 10),
    unread: 0,
    assignments: [
      {
        id: uid(),
        code: "SLEEP_HYGIENE",
        title: "Sleep Hygiene Checklist",
        due: addDaysISO(1),
        status: "chưa làm",
      },
    ],
    notes: "Đề xuất sleep hygiene + hạn chế caffeine.",
    messages: [],
  },
  {
    id: "p003",
    name: "Bùi Gia Hân",
    gender: "Nữ",
    age: 24,
    tags: ["Ám ảnh cưỡng chế"],
    latestTests: { PHQ9: 9, GAD7: 12 },
    nextCall: addDaysISO(3, 16),
    unread: 1,
    assignments: [],
    notes: "Theo dõi exposure hierarchy tuần này.",
    messages: [
      {
        id: uid(),
        sender: "patient",
        text: "Khi tiếp xúc em hơi lo lắng.",
        at: addMinsISO(-60),
      },
    ],
  },
  {
    id: "p004",
    name: "Phạm Nhật Quân",
    gender: "Nam",
    age: 29,
    tags: ["Stress công việc"],
    latestTests: { PHQ9: 4, GAD7: 3 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "Coaching kỹ năng quản lý thời gian.",
    messages: [],
  },
  {
    id: "p005",
    name: "Đỗ Thu Hà",
    gender: "Nữ",
    age: 33,
    tags: ["Rối loạn hoảng sợ"],
    latestTests: { PHQ9: 8, GAD7: 15 },
    nextCall: addDaysISO(2, 9),
    unread: 3,
    assignments: [
      {
        id: uid(),
        code: "EXPOSURE_LITE",
        title: "Mini Exposure Steps",
        due: addDaysISO(4),
        status: "đang làm",
      },
    ],
    notes: "Ưu tiên psychoeducation + breathing.",
    messages: [],
  },
  {
    id: "p006",
    name: "Vũ Hải Long",
    gender: "Nam",
    age: 26,
    tags: ["Lo âu"],
    latestTests: { PHQ9: 10, GAD7: 11 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "—",
    messages: [],
  },
  {
    id: "p007",
    name: "Lê Quỳnh Nhi",
    gender: "Nữ",
    age: 22,
    tags: ["Tự ti"],
    latestTests: { PHQ9: 5, GAD7: 7 },
    nextCall: null,
    unread: 0,
    assignments: [],
    notes: "—",
    messages: [],
  },
  {
    id: "p008",
    name: "Phan Tấn Tài",
    gender: "Nam",
    age: 35,
    tags: ["Trầm cảm"],
    latestTests: { PHQ9: 18, GAD7: 9 },
    nextCall: addDaysISO(1, 14),
    unread: 0,
    assignments: [],
    notes: "Theo sát an toàn.",
    messages: [],
  },
];

export const MOCK_CALL_REQUESTS = [
  {
    id: uid(),
    patientId: "p003",
    preferred: addDaysISO(1, 15),
    note: "Follow-up sau bài tập",
    status: "pending",
  },
  {
    id: uid(),
    patientId: "p001",
    preferred: addDaysISO(2, 9),
    note: "Kiểm tra tiến triển",
    status: "pending",
  },
];

export const MOCK_AVAILABILITY = [
  addDaysISO(1, 10),
  addDaysISO(2, 11),
  addDaysISO(3, 9),
];
