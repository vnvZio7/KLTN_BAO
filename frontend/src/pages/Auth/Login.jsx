import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // 👁️ Gói icon hiện đại
import { useApi } from "../../providers/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosIntence";
import { API_PATHS } from "../../utils/apiPaths";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { API_URL } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại!");
      console.log(data);
      // 🔹 Lưu token
      if (data.token) localStorage.setItem("token", data.token);
      if (data.account) localStorage.setItem("account", data.account);
      console.log(localStorage.getItem("token"));
      console.log(localStorage.getItem("account"));
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      const userData = response.data.user;
      console.log(data.account);
      console.log(response);
      console.log(userData);
      const role = data.account.role || "";
      if (role === "user") {
        if (userData.testHistory.length > 0) {
          navigate("/user");
        } else {
          navigate("/test");
        }
      } else if (role === "doctor") {
        if (userData.approval.status === "pending") {
          navigate("/pending");
        } else {
          navigate("/doctor");
        }
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
        return;
      }
      console.log("✅ Đăng nhập thành công:", data);
      toast.success("Đăng nhập thành công!");
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err.message);
      setError(err.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Đăng Nhập
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Nhập email của bạn"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none pr-10"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-teal-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-teal-600 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
