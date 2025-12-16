import cron from "node-cron";
import {
  notifyTodayAppointments,
  notifyAppointment15Minutes,
} from "./notify.js";
import userModel from "../models/user.model.js";
import notificationModel from "../models/notification.model.js";

/**
 * 🔔 Thông báo: hôm nay có lịch
 * 08:00 sáng mỗi ngày
 */
cron.schedule("0 8 * * *", async () => {
  console.log("[CRON] Notify today appointments");
  await notifyTodayAppointments();
});

/**
 * ⏰ Thông báo: trước 15 phút
 * Chạy mỗi 5 phút
 */
cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Notify 15-minute appointments");
  await notifyAppointment15Minutes();
});

cron.schedule("59 23 * * 0", async () => {
  console.log("Cron tuần chạy lúc 23:59 Chủ Nhật...");

  try {
    const result = await userModel.updateMany(
      {},
      {
        $set: {
          firstCallInWeek: true,
        },
      }
    );

    console.log(
      "Đã reset firstCallInWeek,freeCall cho",
      result.modifiedCount,
      "user"
    );
  } catch (err) {
    console.error("Cron weekly reset error:", err);
  }
});
cron.schedule(
  "0 0 * * 5",
  async () => {
    console.log(
      "Cron weekly reminder: check users who haven't used free call this week..."
    );

    try {
      const users = await userModel.find({ firstCallInWeek: false }).lean();

      if (!users.length) {
        console.log("Không có user nào cần nhắc.");
        return;
      }

      // Tạo danh sách notification
      const notis = users.map((u) => ({
        userId: u._id,
        title: "Nhắc nhở thanh toán hóa đơn",
        message:
          "Bạn đang có hóa đơn cần thanh toán. Hãy thanh toán sớm để có thể tiếp tục sử dụng dịch vụ",
        type: "system",
      }));

      await notificationModel.insertMany(notis);

      console.log(`Đã tạo ${notis.length} thông báo cho người dùng.`);
    } catch (err) {
      console.error("Cron weekly reminder error:", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);
