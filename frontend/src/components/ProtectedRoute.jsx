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
    // Nếu không có quyền, đưa về trang mặc định
    toast.error("Ban khong co quyen");
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    if (role === "user") return <Navigate to="/user" replace />;
    if (role === "admin") return <Navigate to="/admin-test" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RequireDoctorApproved() {
  const { user } = useUserContext();
  if (!user) return <LoadingScreen />;
  if (user.approval.status !== "approved")
    return <Navigate to="/pending" replace />;
  return <Outlet />;
}

export function RequireDoctorPending() {
  const { user } = useUserContext();
  if (!user) return <LoadingScreen />;
  if (user.approval.status !== "pending")
    return <Navigate to="/doctor" replace />;
  return <Outlet />;
}
export function RequireTestDone() {
  const { user } = useUserContext();
  if (!user) return <LoadingScreen />;
  if (user.testHistory.length === 0) return <Navigate to="/test" replace />;
  return <Outlet />;
}

export function RequireNoTest() {
  const { user } = useUserContext();
  if (!user) return <LoadingScreen />;
  if (user.testHistory.length > 0) return <Navigate to="/user" replace />;
  return <Outlet />;
}
