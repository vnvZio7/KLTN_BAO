import TestResult from "../models/testResult.model.js";

const getBand = (score) => {
  if (score <= 4) return "Bình thường";
  if (score <= 9) return "Nhẹ";
  if (score <= 14) return "Trung bình";
  return "Nặng";
};

const getTestResults = async (req, res) => {
  try {
    const testResults = await TestResult.find();
    res.json(testResults);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTestResultByCode = async (req, res) => {
  // try {
  //   const testResult = await TestResult.findById(req.params.id);
  //   if (!testResult)
  //     return res.status(404).json({ message: "Không tìm thấy bài testResult" });
  //   res.json(testResult);
  // } catch (error) {
  //   res.status(500).json({ message: "Server error", error: error.message });
  // }
};

const createTestResult = async (req, res) => {
  try {
    const { code, answers, totalScore, band = "" } = req.body;
    const testResult = await TestResult.create({
      userId: req.user._id,
      code,
      answers,
      totalScore,
      band: getBand(totalScore),
    });
    res
      .status(201)
      .json({ message: "Đã tạo testResult thành công!", testResult });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getTestResults, getTestResultByCode, createTestResult };
