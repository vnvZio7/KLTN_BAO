import React from "react";

const Item = ({ icon, title, children, color }) => (
  <div
    className={`flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br ${color}`}
  >
    <div className="text-4xl">{icon}</div>
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  </div>
);

export default function Services() {
  return (
    <section id="services" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Tại Sao Chọn Chúng Tôi?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Những lý do khiến hàng nghìn bệnh nhân tin tưởng dịch vụ của chúng tôi
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Item
            icon="⚡"
            title="Đặt Lịch Linh Hoạt"
            color="from-teal-50 to-teal-100"
          >
            Hệ thống đặt lịch trực tuyến 24/7, lựa chọn thời gian phù hợp với
            lịch trình cá nhân.
          </Item>
          <Item
            icon="🛋️"
            title="Không Gian Riêng Tư"
            color="from-blue-50 to-blue-100"
          >
            Phòng tư vấn ấm cúng, tạo cảm giác thoải mái và an toàn tuyệt đối.
          </Item>
          <Item
            icon="💰"
            title="Chi Phí Minh Bạch"
            color="from-green-50 to-green-100"
          >
            Bảng giá rõ ràng, nhiều gói liệu trình ưu đãi phù hợp với mọi hoàn
            cảnh kinh tế.
          </Item>
          <Item
            icon="🎯"
            title="Liệu Pháp Cá Nhân"
            color="from-purple-50 to-purple-100"
          >
            Phác đồ điều trị thiết kế riêng cho từng cá nhân, theo dõi tiến
            triển sát sao.
          </Item>
          <Item
            icon="📱"
            title="Tư Vấn Trực Tuyến"
            color="from-pink-50 to-pink-100"
          >
            Kết nối với chuyên gia qua video call, hỗ trợ khẩn cấp 24/7.
          </Item>
          <Item
            icon="🔒"
            title="Bảo Mật Tuyệt Đối"
            color="from-orange-50 to-orange-100"
          >
            Thông tin cá nhân được bảo vệ nghiêm ngặt theo đạo đức nghề nghiệp.
          </Item>
        </div>
      </div>
    </section>
  );
}
