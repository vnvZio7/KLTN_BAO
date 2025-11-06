import React from "react";
import { assets } from "../../assets/assets";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={assets.favicon} className="w-7 h-7" />
              <span className="text-xl font-bold">POMERA</span>
            </div>
            <p className="text-gray-400">
              Đồng hành cùng sức khỏe tinh thần của bạn
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Liên Kết</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#knowledge" className="hover:text-teal-400 transition">
                  Kiến Thức
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-teal-400 transition">
                  Bác Sỹ
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-teal-400 transition">
                  Dịch Vụ
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="hover:text-teal-400 transition"
                >
                  Đánh Giá
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Liên Hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📞 1900 5678</li>
              <li>📧 info@pomera.vn</li>
              <li>📍 456 Đường Tâm Lý, Quận 3, TP.HCM</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Giờ Làm Việc</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Thứ 2 - Thứ 6: 8:00 - 20:00</li>
              <li>Thứ 7: 8:00 - 17:00</li>
              <li>Chủ Nhật: 8:00 - 12:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} POMERA. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
