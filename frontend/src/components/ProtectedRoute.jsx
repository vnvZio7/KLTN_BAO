// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUserRole, isAuthenticated } from "../lib/auth.js";
import toast from "react-hot-toast";
import { useUserContext } from "../context/userContext.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function ProtectedRoute({ allow }) {
  const authed = isAuthenticated();
  const role = getUserRole();

  if (!authed) return <Navigate to="/login" replace />;

  if (allow && !allow.includes(role)) {
    toast.error("Bạn không có quyền truy cập");
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    if (role === "user") return <Navigate to="/user" replace />;
    if (role === "admin") return <Navigate to="/admin-test" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RequireDoctorApproved() {
  const { user, loading } = useUserContext();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  const status = user.approval?.status; // approved | pending | frozen | rejected

  // ❄️ Nếu tài khoản bị đóng băng
  if (status === "frozen") {
    return <Navigate to="/frozen" replace />;
  }

  // ❌ Không được duyệt → chuyển về pending
  if (status !== "approved") {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}

export function RequireDoctorPending() {
  const { user, loading } = useUserContext();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  const status = user.approval?.status; // approved | pending | frozen | rejected

  // ❄️ Frozen
  if (status === "frozen") {
    return <Navigate to="/frozen" replace />;
  }

  // Nếu đã approved -> không cho vào pending nữa
  if (status === "approved") {
    return <Navigate to="/doctor" replace />;
  }

  // Nếu bị rejected hoặc trạng thái linh tinh -> đưa về /doctor
  if (status !== "pending") {
    return <Navigate to="/doctor" replace />;
  }

  // 🟡 Đúng trạng thái pending -> cho render
  return <Outlet />;
}

/* ===== Đã làm test ===== */
export function RequireTestDone() {
  const { user, loading } = useUserContext();

  if (loading) return <LoadingScreen />;
  console.log(user.testHistory?.length);
  if (!user) return <Navigate to="/login" replace />;
  console.log(user);

  if (user.testHistory?.length === 0) {
    return <Navigate to="/test" replace />;
  }

  return <Outlet />;
}

/* ===== Chưa làm test ===== */
export function RequireNoTest() {
  const { user, loading } = useUserContext();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (user.testHistory?.length > 0) {
    return <Navigate to="/user" replace />;
  }

  return <Outlet />;
}
