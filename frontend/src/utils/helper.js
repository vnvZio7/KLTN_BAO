export const validateEmail = (email) => {
  // biểu thức chính quy (regular expression) dùng để kiểm tra định dạng email hợp lệ
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const timeFormat = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const minutesRemainder = minutes % 60;
  return `${hours}h ${minutesRemainder}m`;
};

export const isoTimeFormat = (dateTime) => {
  const date = new Date(dateTime);
  const localTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return localTime;
};

export const dateFormat = (date) => {
  return new Date(date).toLocaleString("vi", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export const formatAge = (date) => {
  return new Date().getFullYear() - new Date(date).getFullYear();
};

export const kConverter = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num;
  }
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const currency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

export const prettyTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function generateTransactionCode() {
  const timestamp = Date.now(); // số nguyên theo mili giây
  const random = Math.floor(Math.random() * 1000); // thêm 3 chữ số ngẫu nhiên
  return `BAO${timestamp}${random}`; // ví dụ: DH169987654321045
}

export function getNextMondayAndSaturday() {
  const today = new Date();
  const day = today.getDay(); // 0 CN, 1 T2, ... 6 T7

  // Tính thứ 2 tuần sau
  const daysToNextMonday = (8 - day) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  // Thứ 7 = thứ 2 + 5 ngày
  const nextSaturday = new Date(nextMonday);
  nextSaturday.setDate(nextMonday.getDate() + 5);
  nextSaturday.setHours(23, 59, 0, 0);

  return { nextMonday, nextSaturday };
}

export function convertDifficult(difficulty) {
  return difficulty === "easy"
    ? "Dễ"
    : difficulty === "medium"
    ? "Trung bình"
    : difficulty === "hard"
    ? "Khó"
    : "Dễ";
}
export function reconvertDifficult(difficulty) {
  return difficulty === "Dễ"
    ? "easy"
    : difficulty === "Trung bình"
    ? "medium"
    : difficulty === "Khó"
    ? "hard"
    : "easy";
}
