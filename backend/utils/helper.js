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
  if (score <= 9) return "Counselor";
  if (score <= 14) return "Therapist";
  return "Psychiatrist";
};

function pickSuggestedRole(phqScore, gadScore) {
  const dominant = phqScore >= gadScore ? "PHQ-9" : "GAD-7";
  const score = dominant === "PHQ-9" ? phqScore : gadScore;
  const role = roleFromBand(score);
  return { dominant, role };
}

function trimDoctorForPrompt(d) {
  return {
    id: String(d._id),
    name: d.accountId?.fullName || d.fullName || "Unknown",
    role: d.role,
    specializations: d.specializations?.slice(0, 5),
    modalities: d.modalities?.slice(0, 5),
    yearsExperience: d.yearsExperience,
    pricePerWeek: d.pricePerWeek,
    rating: d.rating,
  };
}

// services/testMaxScore.js
const Test = require("../models/test.model");

/** Trả map { [code]: maxScore } cho các code yêu cầu */
async function getTestsMaxScores(codes = []) {
  if (!codes.length) return {};
  const tests = await Test.find({ code: { $in: codes } })
    .select("code maxScore")
    .lean();
  const map = {};
  for (const t of tests) {
    map[t.code] = t.maxScore ?? 0;
  }
  for (const c of codes) if (map[c] == null) map[c] = 0; // nếu thiếu doc nào
  return map;
}

export {
  trimDoctorForPrompt,
  pickSuggestedRole,
  gadBand,
  phqBand,
  getTestsMaxScores,
};
