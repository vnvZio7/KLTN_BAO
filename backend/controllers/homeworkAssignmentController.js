import HomeworkAssignment from "../models/homeworkAssignment.model.js";
import Notification from "../models/notification.model.js";
import { uploadManyBuffers } from "../utils/uploadCloudinary.js";
import { createNotification } from "./notificationController.js";
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
      dueDate,
      estimatedMinutes: duration,
      method,
      attachments: attachmentUrls,
    });
    // 3️⃣ 🔔 THÔNG BÁO CHO USER
    await createNotification({
      userId,
      title1: "Bài tập mới từ bác sĩ",
      message: `Bác sĩ đã giao cho bạn bài tập "${title}"`,
      type: "homework",
    });

    // await Notification.create({
    //   userId,
    //   title: "Bài tập mới từ bác sĩ",
    //   message: `Bác sĩ đã giao cho bạn bài tập "${title}"`,
    //   type: "homework",
    // });
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
const oneWeekFromNow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
};

const createHomeworkAssignmentByAI = async (req, res) => {
  try {
    const { suggestedExercises } = req.body;
    const userId = req.user._id;
    const assignments = [];

    for (const ex of suggestedExercises) {
      const assignment = await HomeworkAssignment.create({
        userId,
        templateId: ex._id,
        title: ex.title,
        method: ex.method,
        content: ex.content,
        difficulty: ex.difficulty,
        estimatedMinutes: ex.estimatedMinutes,
        dueDate: oneWeekFromNow(),
        aiSuggested: true,
      });

      assignments.push(assignment);
    }
    // 3️⃣ 🔔 THÔNG BÁO CHO USER
    await createNotification({
      userId,
      title1: "Bài tập gợi ý bài tập từ AI",
      message: `Hệ thống đã gợi ý cho bạn một số bài tập mẫu, có thể làm khi chưa kết nối được đến bác sĩ.`,
      type: "homework",
    });
    res.status(201).json({
      message: "Đã tạo homeworkAssignment thành công!",
      assignments,
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
  createHomeworkAssignmentByAI,
};
