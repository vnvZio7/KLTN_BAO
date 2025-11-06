import React from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 bg-red-500 w-35 h-10 overflow-hidden">
            <img src={assets.logo} className="w-full items-center" alt="logo" />
          </div>

          <div className="hidden md:flex space-x-8">
            <a
              href="#knowledge"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Kiến Thức
            </a>
            <a
              href="#doctors"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Bác Sỹ
            </a>
            <a
              href="#services"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Dịch Vụ
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Đánh Giá
            </a>
          </div>

          <Link to={"/login"}>
            <button className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition">
              Đặt Lịch Khám
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
