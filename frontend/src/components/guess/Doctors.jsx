import React from "react";

const Doc = ({ emojiBg, name, major, color, years, btnColor }) => (
  <div className="card-hover bg-white rounded-2xl p-6 text-center shadow-lg">
    <div
      className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-5xl ${emojiBg}`}
    >
      👨‍⚕️
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
    <p className={`${color} font-semibold mb-2`}>{major}</p>
    <p className="text-gray-600 text-sm mb-4">{years} năm kinh nghiệm</p>
    <div className="flex justify-center space-x-1 mb-4">
      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
    </div>
    <button
      className={`${btnColor} text-white px-6 py-2 rounded-full transition w-full`}
    >
      Đặt Lịch
    </button>
  </div>
);

export default function Doctors() {
  return (
    <section
      id="doctors"
      className="py-16 bg-gradient-to-br from-teal-50 to-blue-50"
    >
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Đội Ngũ Chuyên Gia Tâm Lý
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Các nhà tâm lý học và bác sỹ tâm thần hàng đầu với nhiều năm kinh
          nghiệm
        </p>

        <div className="grid md:grid-cols-4 gap-8">
          <Doc
            emojiBg="bg-gradient-to-br from-teal-400 to-teal-600"
            name="TS. Nguyễn Văn An"
            major="Tâm Lý Lâm Sàng"
            color="text-teal-600"
            years={15}
            btnColor="bg-teal-600 hover:bg-teal-700"
          />
          <Doc
            emojiBg="bg-gradient-to-br from-pink-400 to-pink-600"
            name="ThS. Trần Thị Bình"
            major="Tâm Lý Trẻ Em"
            color="text-pink-600"
            years={12}
            btnColor="bg-pink-600 hover:bg-pink-700"
          />
          <Doc
            emojiBg="bg-gradient-to-br from-blue-400 to-blue-600"
            name="BS. Lê Minh Cường"
            major="Tâm Thần Học"
            color="text-blue-600"
            years={18}
            btnColor="bg-blue-600 hover:bg-blue-700"
          />
          <Doc
            emojiBg="bg-gradient-to-br from-purple-400 to-purple-600"
            name="ThS. Phạm Thu Dung"
            major="Tâm Lý Gia Đình"
            color="text-purple-600"
            years={10}
            btnColor="bg-purple-600 hover:bg-purple-700"
          />
        </div>
      </div>
    </section>
  );
}
