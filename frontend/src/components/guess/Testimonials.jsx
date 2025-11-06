import React from "react";

const Card = ({ avatarBg, name, quote, tag }) => (
  <div className="card-hover bg-white rounded-2xl p-8 shadow-lg">
    <div className="flex items-center mb-4">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mr-4 ${avatarBg}`}
      >
        👤
      </div>
      <div>
        <h4 className="font-bold text-gray-800">{name}</h4>
        <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
      </div>
    </div>
    <p className="text-gray-600 italic mb-4">“{quote}”</p>
    <p className="text-sm text-gray-500">{tag}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-teal-600">{value}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-16 bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Phản Hồi Từ Bệnh Nhân
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Những chia sẻ chân thành từ những người đã tin tưởng sử dụng dịch vụ
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Card
            avatarBg="bg-gradient-to-br from-teal-400 to-teal-600"
            name="Anh Hoàng Minh"
            quote="Tôi đã vượt qua được cơn trầm cảm nhờ sự hỗ trợ tận tâm của các chuyên gia. Họ thực sự lắng nghe và hiểu tôi."
            tag="Điều Trị Trầm Cảm - Tháng 12/2024"
          />
          <Card
            avatarBg="bg-gradient-to-br from-pink-400 to-pink-600"
            name="Chị Lan Anh"
            quote="Con tôi tự tin hơn rất nhiều sau các buổi tư vấn. Không còn sợ đi học và có nhiều bạn bè hơn."
            tag="Tâm Lý Trẻ Em - Tháng 11/2024"
          />
          <Card
            avatarBg="bg-gradient-to-br from-blue-400 to-blue-600"
            name="Ông Tuấn Anh"
            quote="Các kỹ thuật quản lý lo âu giúp tôi kiểm soát cảm xúc tốt hơn. Cuộc sống thay đổi tích cực."
            tag="Điều Trị Lo Âu - Tháng 10/2024"
          />
        </div>

        <div className="text-center mt-12">
          <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div className="flex items-center justify-center space-x-8">
              <Stat value="8,500+" label="Khách Hàng" />
              <div className="w-px h-16 bg-gray-300" />
              <Stat value="95%" label="Cải Thiện" />
              <div className="w-px h-16 bg-gray-300" />
              <Stat value="4.8/5" label="Đánh Giá" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
