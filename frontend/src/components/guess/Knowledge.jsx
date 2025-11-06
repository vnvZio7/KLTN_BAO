import React from "react";

const Card = ({ emoji, title, children, color }) => (
  <div
    className={`card-hover rounded-2xl p-6 shadow-lg bg-gradient-to-br ${color}`}
  >
    <div className="text-5xl mb-4">{emoji}</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4">{children}</p>
    <button className="font-semibold transition text-blue-700 hover:text-blue-900">
      Đọc thêm →
    </button>
  </div>
);

export default function Knowledge() {
  return (
    <section id="knowledge" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Kiến Thức Tâm Lý
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Cập nhật những thông tin tâm lý học mới nhất và hữu ích cho sức khỏe
          tinh thần của bạn
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Card
            emoji="😰"
            title="Rối Loạn Lo Âu"
            color="from-blue-50 to-blue-100"
          >
            Tìm hiểu về các triệu chứng lo âu, hoảng sợ và cách quản lý hiệu
            quả. Kỹ thuật thở, thiền định và liệu pháp nhận thức hành vi.
          </Card>
          <Card emoji="😔" title="Trầm Cảm" color="from-green-50 to-green-100">
            Nhận biết dấu hiệu trầm cảm và các phương pháp điều trị hiện đại.
            Hướng dẫn xây dựng thói quen tích cực và mạng lưới hỗ trợ.
          </Card>
          <Card
            emoji="💭"
            title="Stress & Căng Thẳng"
            color="from-purple-50 to-purple-100"
          >
            Kỹ thuật quản lý stress hiệu quả trong công việc và cuộc sống.
            Phương pháp thư giãn, cân bằng work-life và tự chăm sóc bản thân.
          </Card>
        </div>
      </div>
    </section>
  );
}
