import Doctor from "../models/doctor.model.js";

const getDoctors = async (req, res) => {
  try {
    let doctors = null;
    if (req.account.role === "admin") {
      doctors = await Doctor.find()
        .populate("accountId")
        .select("-password")
        .lean();
      console.log(doctors);
    } else {
      doctors = await Doctor.find({ "approval.status": "approved" })
        .populate("accountId")
        .select("-password")
        .lean();
    }
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getDoctorByIds = async (req, res) => {
  try {
    const { doctorIds } = req.body;
    // Nếu không có hoặc rỗng → trả về mảng rỗng
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return [];
    }

    // Mongoose sẽ tự cast string → ObjectId
    const doctors = await Doctor.find({
      _id: { $in: doctorIds },
    })
      .populate("accountId")
      .select("-password")
      .lean();
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getDoctors, getDoctorByIds };
