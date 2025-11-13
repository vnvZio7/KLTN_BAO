import TestResult from "../models/testResult.model.js";

const getTestResults = async (req, res) => {
  try {
    const testResults = await TestResult.find();
    res.json(testResults);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTestResultById = async (req, res) => {
  try {
    const testResult = await TestResult.findById(req.params.id);
    if (!testResult)
      return res.status(404).json({ message: "Không tìm thấy bài testResult" });
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTestResult = async (req, res) => {
  try {
    const { code, title, description, questions } = req.body;
    const testResult = await TestResult.create({
      code,
      title,
      description,
      questions,
    });
    res
      .status(201)
      .json({ message: "Đã tạo bài testResult thành công!", testResult });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getTestResults, getTestResultByCode, createTestResult };
