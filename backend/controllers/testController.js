import Test from "../models/test.model";
import { gadBand, phqBand } from "../utils/helper";

const getTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTestByCode = async (req, res) => {
  try {
    const test = await Test.findOne({ code: req.params.code });
    if (!test)
      return res.status(404).json({ message: "Không tìm thấy bài test" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTest = async (req, res) => {
  try {
    const { code, title, description, questions } = req.body;
    const test = await Test.create({ code, title, description, questions });
    res.status(201).json({ message: "Đã tạo bài test thành công!", test });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const sum = (arr) => arr.reduce((s, n) => s + (n ?? 0), 0);

const computeScoreFromDefinition = async (code, answers) => {
  try {
    const def = await Test.findOne({ code });
    if (!def) throw new Error(`Missing test definition: ${code}`);
    if (
      !Array.isArray(def.questions) ||
      def.questions.length !== answers.length
    ) {
      throw new Error(`Answers length mismatch for ${code}`);
    }
    const scores = answers.map((optIdx, i) => {
      const sc = def.questions[i]?.scores?.[optIdx];
      return Number.isFinite(sc) ? sc : 0;
    });
    const total = sum(scores);
    const band = code === "PHQ-9" ? phqBand(total) : gadBand(total);
    return { scores, total, band };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { getTests, getTestByCode, createTest, computeScoreFromDefinition };
