import HomeworkAssignment from "../models/homeworkAssignment.model.js";
import { uploadManyBuffers } from "../utils/uploadCloudinary.js";
// @desc    Get all homeworkAssignments (Admin only)
// @route   GET /api/homeworkAssignments/
// @access  Private (Admin)
const getHomeworkAssignments = async (req, res) => {
  try {
    const homeworkAssignments = await HomeworkAssignment.find();
    res.json(homeworkAssignments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get homeworkAssignment by ID
// @route   GET /api/homeworkAssignments/:id
// @access  Private
const getHomeworkAssignmentById = async (req, res) => {
  try {
    const userId = req.params.id;
    const homeworkAssignment = await HomeworkAssignment.find({
      userId,
    }).lean();
    if (!homeworkAssignment)
      return res.status(404).json({ message: "HomeworkAssignment not found" });
    res.json({ homeworkAssignment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createHomeworkAssignmentByDoctor = async (req, res) => {
  try {
    const { payload } = req.body;
    const {
      userId,
      doctorId,
      title,
      content,
      difficulty,
      frequency,
      dueDate,
      duration,
      method,
    } = JSON.parse(payload);

    let attachmentUrls = [];
    if (req.files?.length) {
      attachmentUrls = await uploadManyBuffers(
        req.files,
        "pomera/assignments/"
      );
    }
    const homeworkAssignment = await HomeworkAssignment.create({
      userId,
      doctorId,
      title,
      content,
      difficulty,
      frequency,
      dueDate,
      estimatedMinutes: duration,
      method,
      attachments: attachmentUrls,
    });

    res.status(201).json({
      message: "Đã tạo homeworkAssignment thành công!",
      homeworkAssignment,
    });
  } catch (err) {
    console.error("create error:", err);
    return res.status(500).json({
      message: "Lỗi server khi tạo homeworkAssignment",
      error: err.message,
    });
  }
};

export {
  getHomeworkAssignments,
  getHomeworkAssignmentById,
  createHomeworkAssignmentByDoctor,
};
