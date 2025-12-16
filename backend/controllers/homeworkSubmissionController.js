import HomeworkSubmission from "../models/homeworkSubmission.model.js";
import HomeworkAssignment from "../models/homeworkAssignment.model.js";
import Notification from "../models/notification.model.js";
import { uploadManyBuffers } from "../utils/uploadCloudinary.js";
// @desc    Get all homeworkSubmissions (Admin only)
// @route   GET /api/homeworkSubmissions/
// @access  Private (Admin)
const getHomeworkSubmissions = async (req, res) => {
  try {
    const homeworkSubmissions = await HomeworkSubmission.find();
    res.json(homeworkSubmissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get homeworkSubmission by ID
// @route   GET /api/homeworkSubmissions/:id
// @access  Private
const getHomeworkSubmissionById = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const homeworkSubmission = await HomeworkSubmission.find({
      assignmentId,
    }).lean();
    if (!homeworkSubmission)
      return res.status(404).json({ message: "HomeworkSubmission not found" });
    res.json({ homeworkSubmission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createHomeworkSubmission = async (req, res) => {
  try {
    const { payload } = req.body;
    const { assignmentId, answers, moodBefore, moodAfter } =
      JSON.parse(payload);

    let attachmentUrls = [];
    console.log(req.files);

    if (req.files?.length) {
      attachmentUrls = await uploadManyBuffers(
        req.files,
        "pomera/submissions/"
      );
      console.log(attachmentUrls);
    }
    const homeworkSubmission = await HomeworkSubmission.create({
      assignmentId,
      answers,
      moodBefore,
      moodAfter,
      attachments: attachmentUrls,
    });
    const homeworkAssignment = await HomeworkAssignment.findByIdAndUpdate(
      assignmentId,
      { status: "completed" }, // dữ liệu update
      { new: true }
    ).populate({
      path: "userId",
      populate: {
        path: "accountId",
        select: "fullName",
      },
    });
    await Notification.create({
      doctorId: homeworkAssignment.doctorId,
      title: "Bệnh nhân nộp bài tập",
      message: `Bệnh nhân "${
        homeworkAssignment.userId.accountId.fullName || "Không rõ tên"
      }" vừa mới nộp bài tập "${homeworkAssignment.title}"`,
      type: "homework",
    });
    res.status(201).json({
      message: "Đã tạo homeworkSubmission thành công!",
      homeworkSubmission,
    });
  } catch (err) {
    console.error("create error:", err);
    return res.status(500).json({
      message: "Lỗi server khi tạo homeworkSubmission",
      error: err.message,
    });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await HomeworkSubmission.findByIdAndUpdate(id, {
      $set: { feedbackDoctor: req.body.feedbackDoctor },
    });
    const homeworkAssignment = await HomeworkAssignment.findById(
      updated.assignmentId
    ).populate({
      path: "userId",
      populate: {
        path: "accountId",
        select: "fullName",
      },
    });
    if (!updated) {
      return res.status(404).json({ message: "Submission không tồn tại" });
    }
    await Notification.create({
      userId: homeworkAssignment.userId,
      title: "Bác sĩ feedback bài tập",
      message: `Bác sĩ vừa mới phản hồi bài tập "${homeworkAssignment.title}" mà bạn đã nộp`,
      type: "homework",
    });
    res.json({
      message: "Feedback thành công",
      submission: updated,
    });
  } catch (err) {
    console.error("update submission error:", err);
    return res.status(500).json({
      message: "Lỗi server khi cập nhật submission",
      error: err.message,
    });
  }
};

export {
  getHomeworkSubmissions,
  getHomeworkSubmissionById,
  createHomeworkSubmission,
  updateFeedback,
};
