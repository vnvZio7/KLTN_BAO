export const DOCTORS = [
  {
    id: "d1",
    name: "BS. Lan Nguyễn",
    specialty: "Therapist",
    rating: 4.8,
    patients: 320,
    gender: "Nữ",
    languages: ["Việt", "English"],
    avatar:
      "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=300&auto=format&fit=crop",
    bio: "10 năm trị liệu CBT/ACT, tập trung lo âu và trầm cảm.",
    price: 350000,
    nextSlots: ["2025-11-01T09:30", "2025-11-01T14:00", "2025-11-02T10:00"],
  },
  {
    id: "d2",
    name: "BS. Minh Trần",
    specialty: "Psychiatrist",
    rating: 4.9,
    patients: 410,
    gender: "Nam",
    languages: ["Việt"],
    avatar:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=300&auto=format&fit=crop",
    bio: "12 năm kê đơn & theo dõi, chuyên rối loạn khí sắc.",
    price: 550000,
    nextSlots: ["2025-11-01T16:00", "2025-11-02T09:00", "2025-11-03T19:30"],
  },
  {
    id: "d3",
    name: "BS. Huyền Phạm",
    specialty: "Counselor",
    rating: 4.6,
    patients: 210,
    gender: "Nữ",
    languages: ["Việt", "Korean"],
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop",
    bio: "Chuyên kỹ năng đối mặt stress, tự ti, mất ngủ.",
    price: 250000,
    nextSlots: ["2025-11-02T11:00", "2025-11-02T14:30", "2025-11-04T08:30"],
  },
];
export const INITIAL_MESSAGES = [
  {
    id: "m1",
    from: "doctor",
    text: "Chào bạn! Mình đã xem kết quả PHQ‑9/GAD‑7, hiện mức độ trung bình. Hôm nay bạn thấy thế nào?",
    time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "m2",
    from: "user",
    text: "Em thấy bồn chồn và hơi khó ngủ ạ.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
  },
];

export const MOCK_PLAN = {
  diagnosisHint: "Lo âu mức trung bình (GAD‑7: 12)",
  goals: [
    {
      id: "g1",
      title: "Giảm điểm GAD‑7 xuống < 8 trong 4 tuần",
      progress: 0.45,
    },
    { id: "g2", title: "Ngủ liên tục 6–7h/đêm", progress: 0.3 },
    { id: "g3", title: "Tập hít thở 4‑7‑8 mỗi ngày", progress: 0.6 },
  ],
  sessions: [
    {
      id: "s1",
      date: "2025-10-28T14:00",
      type: "CBT – Nhận diện suy nghĩ",
      status: "done",
      notes: "Nhật ký suy nghĩ tiêu cực x 3 lần/tuần",
    },
    {
      id: "s2",
      date: "2025-11-02T14:00",
      type: "Mindfulness – Thở 4‑7‑8",
      status: "upcoming",
      notes: "Theo dõi chất lượng giấc ngủ mỗi sáng",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Ghi chép mức lo âu 1 lần/ngày",
      due: "2025-11-03",
      done: false,
    },
    {
      id: "t2",
      title: "Thực hành 4‑7‑8 (5 phút)",
      due: "2025-11-01",
      done: true,
    },
    { id: "t3", title: "Đi bộ nhẹ 20 phút", due: "2025-11-02", done: false },
  ],
  medication: {
    prescribed: false,
    items: [],
  },
};
export const MOCK_STATS = {
  weekly: {
    // tuần gần nhất (T2..CN)
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    mood: [5, 6, 6, 7, 6, 7, 8], // thang 1-10
    sleepHours: [6.0, 6.5, 7.0, 6.8, 7.2, 7.0, 7.5],
    practiceMinutes: [5, 10, 0, 8, 12, 10, 6], // thời gian tập thở/thiền
  },
  phq9: [12, 12, 11, 10, 9, 9, 8], // theo tuần (7 tuần)
  gad7: [13, 12, 12, 11, 10, 9, 8],
  streakDays: 6,
  tasksDone: 9,
  tasksTotal: 12,
  sessionsCompleted: 3,
  upcomingSessions: 1,
};
export const MOCK_HOMEWORK = [
  {
    id: "hw1",
    title: "Nhật ký suy nghĩ tiêu cực",
    description:
      "Ghi lại 3 tình huống trong tuần bạn có suy nghĩ tiêu cực. Áp dụng khuôn CBT: Tình huống – Suy nghĩ – Cảm xúc – Hành vi – Thách thức suy nghĩ.",
    due: "2025-11-04",
    attachments: ["mau-nhat-ky-cbt.pdf"],
    status: "pending", // pending | submitted | graded
    submissions: [],
  },
  {
    id: "hw2",
    title: "Thực hành thở 4‑7‑8",
    description:
      "Thực hành 4‑7‑8 mỗi ngày. Tự đánh giá mức lo âu (1-10) trước và sau.",
    due: "2025-11-06",
    attachments: [],
    status: "pending",
    submissions: [],
  },
  {
    id: "hw3",
    title: "Giấc ngủ – Sleep diary",
    description:
      "Điền nhật ký giấc ngủ 3 ngày liên tiếp (giờ ngủ, thức dậy, số lần tỉnh giấc).",
    due: "2025-11-08",
    attachments: ["sleep-diary.xlsx"],
    status: "submitted",
    submissions: [
      {
        id: "sub1",
        time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        note: "Đã điền đủ 3 ngày, trước-sau khác biệt rõ",
        files: [{ name: "sleep-diary.xlsx", size: 24128 }],
      },
    ],
  },
];
export const MOCK_BILLING = {
  plan: {
    id: "weekly",
    name: "Gói theo tuần",
    price: 99000,
    currency: "VND",
    interval: "week",
    autoRenew: true,
    status: "active",
    nextChargeAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  paymentMethods: [
    {
      id: "pm_visa",
      brand: "Visa",
      last4: "4242",
      exp: "12/28",
      isDefault: true,
    },
    { id: "pm_momo", brand: "MoMo", last4: "•••", exp: "-", isDefault: false },
  ],
  invoices: [
    {
      id: "inv_1007",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      amount: 99000,
      status: "paid",
    },
    {
      id: "inv_1006",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      amount: 99000,
      status: "paid",
    },
  ],
  coupons: [],
};
