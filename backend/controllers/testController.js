import Test from "../models/test.model";

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

export { getTests, getTestByCode, createTest };
