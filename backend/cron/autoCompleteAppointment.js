import cron from "node-cron";
import Appointment from "../models/appointment.model.js";

cron.schedule("*/1 * * * *", async () => {
  console.log("crontab start......");
  const now = new Date();

  // 1. Appointment quá hạn
  await Appointment.updateMany(
    {
      status: "pending",
      endTime: { $lt: now },
    },
    { status: "completed" }
  );
});
