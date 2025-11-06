import Doctor from "../models/doctor.model";

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("accountId");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getDoctors };
