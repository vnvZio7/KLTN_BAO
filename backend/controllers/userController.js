import User from "../models/user.model.js";
// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("accountId").select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserByDoctorId = async (req, res) => {
  try {
    const users = await User.find({ currentDoctorId: req.user._id })
      .populate({
        path: "accountId",
        select: "-password",
      })
      .populate({
        path: "testHistory",
      });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { testHistory, dominantSymptom, doctorIds, currentDoctorId } =
      req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          testHistory,
          dominantSymptom,
          doctorIds,
          currentDoctorId,
        },
      },
      { new: true } // trả về document sau khi update
    );
    res.status(201).json({ message: "Đã cập nhật user thành công!", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getUsers, getUserByDoctorId, updateUser };
