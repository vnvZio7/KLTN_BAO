import ExerciseTemplate from "../models/exerciseTemplate.model";

const getExerciseTemplates = async (req, res) => {
  try {
    const exerciseTemplates = await ExerciseTemplate.find();
    res.json(exerciseTemplates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getExerciseTemplateById = async (req, res) => {
  try {
    const exerciseTemplate = await ExerciseTemplate.findOne({
      id: req.params.id,
    });
    if (!exerciseTemplate)
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài exerciseTemplate" });
    res.json(exerciseTemplate);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createExerciseTemplate = async (req, res) => {
  try {
    // const {
    //   title,
    //   method,
    //   targetSymptoms,
    //   difficulty,
    //   estimatedMinutes,
    //   content,
    //   attachments,
    // } = req.body;
    // const exerciseTemplate = await ExerciseTemplate.create({
    //   title,
    //   method,
    //   targetSymptoms,
    //   difficulty,
    //   estimatedMinutes,
    //   content,
    //   attachments,
    // });
    const exercises = req.body;
    const result = await ExerciseTemplate.insertMany(exercises);

    res.status(201).json({
      message: "Đã tạo bài exerciseTemplate thành công!",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getExerciseTemplates,
  getExerciseTemplateById,
  createExerciseTemplate,
};
