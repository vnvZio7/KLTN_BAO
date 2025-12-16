const phqBand = (score) => {
  if (score <= 4) return "Bình thường";
  if (score <= 9) return "Nhẹ";
  if (score <= 14) return "Trung bình";
  return "Nặng";
};
const gadBand = (score) => {
  if (score <= 4) return "Bình thường";
  if (score <= 9) return "Nhẹ";
  if (score <= 14) return "Trung bình";
  return "Nặng";
};
const roleFromBand = (score) => {
  if (score <= 4) return "None";
  if (score <= 9) return "counselor";
  if (score <= 14) return "therapist";
  return "psychiatrist";
};

function pickSuggestedRole(phqScore, gadScore) {
  const dominant = phqScore >= gadScore ? "PHQ-9" : "GAD-7";
  const score = dominant === "PHQ-9" ? phqScore : gadScore;
  const role = roleFromBand(score);
  return { dominant, role };
}
function prettyTime(iso) {
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
export { pickSuggestedRole, gadBand, phqBand, prettyTime };
